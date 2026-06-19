import type { NextFunction, Request, Response } from 'express';
import { logger } from './logger';

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, message: string, code = 'error', details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (m: string, d?: unknown) => new AppError(400, m, 'bad_request', d);
export const unauthorized = (m = 'Authentication required') => new AppError(401, m, 'unauthorized');
export const forbidden = (m = 'You do not have access to this resource') =>
  new AppError(403, m, 'forbidden');
export const notFound = (m = 'Not found') => new AppError(404, m, 'not_found');
export const conflict = (m: string) => new AppError(409, m, 'conflict');
export const tooMany = (m = 'Too many requests') => new AppError(429, m, 'rate_limited');

/** Wrap an async route handler so thrown errors reach the error middleware. */
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (err.status >= 500) logger.error(err.message, { code: err.code });
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  logger.error('Unhandled error', {
    route: req.method + ' ' + req.path,
    message: err instanceof Error ? err.message : String(err),
  });
  return res
    .status(500)
    .json({ error: { code: 'internal_error', message: 'Something went wrong. Please try again.' } });
}
