import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { unauthorized } from '../lib/errors';
import { usersRepo } from '../repositories/users.repo';

/**
 * Verifies the Bearer access token, confirms the user still exists and is
 * active in the DB, then attaches { id, role, email, name } to req.user.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw unauthorized('Missing access token');
    }
    const token = header.slice('Bearer '.length).trim();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw unauthorized('Invalid or expired token');
    }

    const user = await usersRepo.findById(payload.sub);
    if (!user || !user.is_active) {
      throw unauthorized('Account is inactive');
    }

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    next(err);
  }
}
