import { Router } from 'express';
import { env } from '../config/env';
import { asyncHandler, unauthorized } from '../lib/errors';
import { drainPendingEmails } from '../services/email.service';
import { runOrphanCleanup } from '../workers/orphanCleanup.worker';
import { logger } from '../lib/logger';

const router = Router();

/**
 * Internal job endpoints. In production the API runs serverless on Vercel, so
 * the in-process interval workers don't run — Supabase pg_cron (via pg_net)
 * POSTs here on a schedule instead (see server/src/db/cron.sql). Guarded by a
 * shared secret so they are not publicly callable.
 */
router.use((req, _res, next) => {
  const expected = env.cronSecret;
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!expected || got !== expected) return next(unauthorized('Invalid or missing cron secret'));
  next();
});

// POST /api/internal/email-queue — send any pending emails once
router.post(
  '/email-queue',
  asyncHandler(async (_req, res) => {
    await drainPendingEmails();
    logger.info('Email queue drained via cron endpoint');
    res.json({ ok: true });
  }),
);

// POST /api/internal/orphan-cleanup — remove orphaned uploads once
router.post(
  '/orphan-cleanup',
  asyncHandler(async (_req, res) => {
    const removed = await runOrphanCleanup();
    logger.info('Orphan cleanup ran via cron endpoint', { removed });
    res.json({ ok: true, removed });
  }),
);

export default router;
