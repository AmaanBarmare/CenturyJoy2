import type { NextFunction, Request, Response } from 'express';
import { forbidden, unauthorized } from '../lib/errors';
import type { Role } from '../types';

/** Guard a route to one or more roles. Admin is NOT implicitly allowed —
 *  pass 'admin' explicitly where it should have access (it usually should). */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden('Your role does not have access to this action'));
    }
    next();
  };
}
