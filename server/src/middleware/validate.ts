import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { badRequest } from '../lib/errors';

/** Validate req.body against a Zod schema; replaces body with the parsed value. */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          badRequest(
            'Validation failed',
            err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
          ),
        );
      }
      next(err);
    }
  };
}
