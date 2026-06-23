import './types/express'; // registers the Express.Request.user type augmentation (must be imported, not just ambient, so Vercel's entrypoint-rooted type-check includes it)
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorMiddleware, notFound } from './lib/errors';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { logger } from './lib/logger';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import uploadRoutes from './routes/upload.routes';
import studioRoutes from './routes/studio.routes';
import adminRoutes from './routes/admin.routes';
import chatRoutes from './routes/chat.routes';
import internalRoutes from './routes/internal.routes';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers (PRD B8)
  app.use(
    helmet({
      contentSecurityPolicy: false, // API only; the SPA sets its own CSP
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
  );

  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Lightweight request log (no PII)
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info('request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms: Date.now() - start,
        userId: req.user?.id,
      });
    });
    next();
  });

  app.use('/api/health', healthRoutes);

  // Per-user/IP general limiter on the rest of the API
  app.use('/api', generalLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/studio', studioRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/internal', internalRoutes);

  app.use((_req, _res, next) => next(notFound('Route not found')));
  app.use(errorMiddleware);

  return app;
}
