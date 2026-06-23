import type { Request } from 'express';
import { supabase } from './supabase';
import { logger } from './logger';
import type { RequestUser } from '../types';

export interface AuditEntry {
  user?: RequestUser | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

/** Best-effort audit write — never throws into the request path. */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await supabase.from('audit_log').insert({
      user_id: entry.user?.id ?? null,
      user_email: entry.user?.email ?? null,
      user_role: entry.user?.role ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
      ip_address: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
    });
  } catch (err) {
    logger.error('Failed to write audit log', {
      action: entry.action,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export function reqMeta(req: Request): { ip: string | null; userAgent: string | null } {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null;
  const userAgent = req.headers['user-agent'] || null;
  return { ip, userAgent };
}
