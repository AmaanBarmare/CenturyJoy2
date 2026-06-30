import { env } from './config/env';
import { createApp } from './app';
import { logger } from './lib/logger';
import { startEmailWorker } from './workers/emailQueue.worker';
import { startOrphanCleanupWorker } from './workers/orphanCleanup.worker';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info('Century Joy API listening', { port: env.port, env: env.nodeEnv });
  // Background jobs run inside the same process (PRD B3 / B10).
  startEmailWorker();
  startOrphanCleanupWorker();
});

// Graceful shutdown so the dev watcher (tsx) and prod hosts can stop the
// process cleanly instead of force-killing it. Workers use unref'd timers,
// so closing the HTTP server lets the event loop drain and exit.
let shuttingDown = false;
function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('Shutting down', { signal });
  server.close(() => process.exit(0));
  // Fallback if a connection refuses to drain in time.
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});
