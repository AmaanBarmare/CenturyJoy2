import crypto from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../types';

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  email: string;
  name: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

/** Refresh tokens are opaque random strings; we store only their SHA-256 hash. */
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(48).toString('base64url');
  const hash = hashToken(raw);
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
