import { supabase } from '../lib/supabase';
import { deleteObject } from '../lib/storage';
import { logger } from '../lib/logger';

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Removes unconfirmed file/deliverable rows older than 24h and their
 * storage objects (PRD B3 orphanCleanup.worker).
 */
export function startOrphanCleanupWorker(): void {
  const tick = async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
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
      }
    }
  };
  setInterval(tick, INTERVAL_MS);
  setTimeout(tick, 10_000);
  logger.info('Orphan cleanup worker started', { intervalMs: INTERVAL_MS });
}
