import { supabase } from '../lib/supabase';
import { deleteObject } from '../lib/storage';
import { logger } from '../lib/logger';

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Removes unconfirmed file/deliverable rows older than 24h and their storage
 * objects (PRD B3). Returns the number of rows removed.
 *
 * Reused two ways: the in-process interval worker below (local dev / a real
 * Node host) and the `/api/internal/orphan-cleanup` endpoint, which Supabase
 * pg_cron drives when the API runs serverless on Vercel.
 */
export async function runOrphanCleanup(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let removed = 0;
  for (const table of ['project_files', 'deliverables'] as const) {
    const { data, error } = await supabase
      .from(table)
      .select('id, storage_key')
      .eq('is_confirmed', false)
      .lt('created_at', cutoff);
    if (error) {
      logger.error('Orphan cleanup read failed', { table, error: error.message });
      continue;
    }
    const rows = (data as { id: string; storage_key: string }[]) ?? [];
    for (const r of rows) await deleteObject(r.storage_key);
    if (rows.length) {
      await supabase
        .from(table)
        .delete()
        .in(
          'id',
          rows.map((r) => r.id),
        );
      logger.info('Orphan cleanup removed rows', { table, count: rows.length });
      removed += rows.length;
    }
  }
  return removed;
}

export function startOrphanCleanupWorker(): void {
  const tick = () =>
    runOrphanCleanup().catch((err) =>
      logger.error('Orphan cleanup tick failed', {
        message: err instanceof Error ? err.message : String(err),
      }),
    );
  setInterval(tick, INTERVAL_MS).unref();
  setTimeout(tick, 10_000).unref();
  logger.info('Orphan cleanup worker started', { intervalMs: INTERVAL_MS });
}
