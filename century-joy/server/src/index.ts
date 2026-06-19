import { env } from './config/env';
import { createApp } from './app';
import { logger } from './lib/logger';
import { startEmailWorker } from './workers/emailQueue.worker';
import { startOrphanCleanupWorker } from './workers/orphanCleanup.worker';

const app = createApp();

app.listen(env.port, () => {
  logger.info('Century Joy API listening', { port: env.port, env: env.nodeEnv });
  // Background jobs run inside the same process (PRD B3 / B10).
  startEmailWorker();
  startOrphanCleanupWorker();
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});
