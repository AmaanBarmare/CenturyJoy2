import { drainPendingEmails } from '../services/email.service';
import { logger } from '../lib/logger';

const INTERVAL_MS = 60_000;
let running = false;

/** Polls email_notifications every 60s and sends pending mail (PRD A9). */
export function startEmailWorker(): void {
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await drainPendingEmails();
    } catch (err) {
      logger.error('Email worker tick failed', {
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      running = false;
    }
  };
  // unref() so these timers never keep the process alive during shutdown
  setInterval(tick, INTERVAL_MS).unref();
  // run shortly after boot too
  setTimeout(tick, 3000).unref();
  logger.info('Email worker started', { intervalMs: INTERVAL_MS });
}
