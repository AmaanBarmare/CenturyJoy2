import type { Request } from 'express';
import { env } from '../config/env';
import { usersRepo } from '../repositories/users.repo';
import { refreshTokensRepo, resetTokensRepo } from '../repositories/tokens.repo';
import {
  generateRefreshToken,
  hashToken,
  signAccessToken,
} from '../lib/jwt';
import {
  hashPassword,
  isStrongPassword,
  PASSWORD_RULE,
  verifyPassword,
} from '../lib/password';
import { badRequest, unauthorized } from '../lib/errors';
import { writeAudit, reqMeta } from '../lib/audit';
import { enqueueEmail } from './email.service';
import { logger } from '../lib/logger';
import type { User } from '../types';

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
const MAX_SESSIONS = 3;

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: { id: string; name: string; role: string; email: string; mustChangePassword: boolean };
}

function isLocked(user: User): boolean {
  return !!user.locked_until && new Date(user.locked_until).getTime() > Date.now();
}

function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    mustChangePassword: user.must_change_password,
  };
}

async function issueSession(user: User, req: Request): Promise<LoginResult> {
  // Concurrent session limit: revoke oldest if at cap (PRD A3.4).
  const active = await refreshTokensRepo.listActiveForUser(user.id);
  if (active.length >= MAX_SESSIONS) {
    await refreshTokensRepo.revoke(active[0].id);
  }
  const { raw, hash } = generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  const meta = reqMeta(req);
  await refreshTokensRepo.create({
    user_id: user.id,
    token_hash: hash,
    expires_at: refreshExpiresAt.toISOString(),
    ip_address: meta.ip,
    user_agent: meta.userAgent,
  });
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  return { accessToken, refreshToken: raw, refreshExpiresAt, user: publicUser(user) };
}

export const authService = {
  async login(email: string, password: string, req: Request): Promise<LoginResult> {
    const meta = reqMeta(req);
    const user = await usersRepo.findByEmail(email);

    // Uniform error to avoid user enumeration.
    const invalid = () => unauthorized('Invalid email or password');

    if (!user) {
      await writeAudit({ action: 'login_failed', metadata: { email, reason: 'no_user' }, ...meta });
      throw invalid();
    }
    if (!user.is_active) {
      await writeAudit({ user: toReqUser(user), action: 'login_failed', metadata: { reason: 'inactive' }, ...meta });
      throw unauthorized('This account is inactive. Contact your administrator.');
    }
    if (isLocked(user)) {
      await writeAudit({ user: toReqUser(user), action: 'login_blocked_locked', ...meta });
      throw unauthorized('Account is temporarily locked. Try again later.');
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      const failed = user.failed_login_count + 1;
      const patch: Record<string, unknown> = { failed_login_count: failed };
      if (failed >= MAX_FAILED) {
        patch.locked_until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
        patch.failed_login_count = 0;
        await enqueueEmail({ template: 'account_locked', recipientEmail: user.email, payload: {} });
        await writeAudit({ user: toReqUser(user), action: 'account_locked', ...meta });
      }
      await usersRepo.update(user.id, patch);
      await writeAudit({ user: toReqUser(user), action: 'login_failed', metadata: { reason: 'bad_password' }, ...meta });
      throw invalid();
    }

    // success
    await usersRepo.update(user.id, {
      failed_login_count: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    });
    await writeAudit({ user: toReqUser(user), action: 'login', ...meta });
    return issueSession(user, req);
  },

  async refresh(rawRefreshToken: string | undefined, req: Request): Promise<LoginResult> {
    if (!rawRefreshToken) throw unauthorized('No refresh token');
    const hash = hashToken(rawRefreshToken);
    const row = await refreshTokensRepo.findValidByHash(hash);
    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
      throw unauthorized('Session expired');
    }
    // Rotate: revoke the old token immediately (PRD A3.4).
    await refreshTokensRepo.revoke(row.id);
    const user = await usersRepo.findById(row.user_id);
    if (!user || !user.is_active) throw unauthorized('Account is inactive');
    return issueSession(user, req);
  },

  async logout(rawRefreshToken: string | undefined, req: Request): Promise<void> {
    if (!rawRefreshToken) return;
    const row = await refreshTokensRepo.findValidByHash(hashToken(rawRefreshToken));
    if (row) {
      await refreshTokensRepo.revoke(row.id);
      await writeAudit({ user: undefined, action: 'logout', entityType: 'user', entityId: row.user_id, ...reqMeta(req) });
    }
  },

  async setPassword(email: string, currentPassword: string, newPassword: string, req: Request) {
    const user = await usersRepo.findByEmail(email);
    if (!user) throw unauthorized('Invalid email or password');
    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) throw unauthorized('Invalid email or password');
    if (!isStrongPassword(newPassword)) throw badRequest(PASSWORD_RULE);
    if (await verifyPassword(newPassword, user.password_hash)) {
      throw badRequest('New password must be different from the temporary password.');
    }
    const password_hash = await hashPassword(newPassword);
    await usersRepo.update(user.id, { password_hash, must_change_password: false });
    await refreshTokensRepo.revokeAllForUser(user.id); // force re-login everywhere
    await writeAudit({ user: toReqUser(user), action: 'password_set', ...reqMeta(req) });
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await usersRepo.findByEmail(email);
    // Always behave the same to avoid enumeration.
    if (!user || !user.is_active) {
      logger.info('Password reset requested for unknown/inactive email');
      return;
    }
    const { raw, hash } = generateRefreshToken();
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
    await resetTokensRepo.create({ user_id: user.id, token_hash: hash, expires_at });
    await enqueueEmail({
      template: 'password_reset',
      recipientEmail: user.email,
      payload: { name: user.name, token: raw },
    });
  },

  async resetPassword(token: string, newPassword: string, req: Request): Promise<void> {
    if (!isStrongPassword(newPassword)) throw badRequest(PASSWORD_RULE);
    const row = await resetTokensRepo.findValidByHash(hashToken(token));
    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
      throw badRequest('This reset link is invalid or has expired.');
    }
    const password_hash = await hashPassword(newPassword);
    await usersRepo.update(row.user_id, { password_hash, must_change_password: false, failed_login_count: 0, locked_until: null });
    await resetTokensRepo.markUsed(row.id);
    await refreshTokensRepo.revokeAllForUser(row.user_id);
    await writeAudit({ action: 'password_reset', entityType: 'user', entityId: row.user_id, ...reqMeta(req) });
  },
};

function toReqUser(u: User) {
  return { id: u.id, role: u.role, email: u.email, name: u.name };
}
