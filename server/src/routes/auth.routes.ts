import { Router, type Response } from 'express';
import { env } from '../config/env';
import { asyncHandler } from '../lib/errors';
import { authService } from '../services/auth.service';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth.middleware';
import {
  loginLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
} from '../middleware/rateLimit.middleware';
import {
  loginSchema,
  setPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators';

const router = Router();
const REFRESH_COOKIE = 'cj_refresh';

function setRefreshCookie(res: Response, token: string, expires: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/api/auth',
    expires,
  });
}
function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

router.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password, req);
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    res.json({ accessToken: result.accessToken, user: result.user });
  }),
);

router.post(
  '/refresh',
  refreshLimiter,
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE];
    const result = await authService.refresh(raw, req);
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    res.json({ accessToken: result.accessToken, user: result.user });
  }),
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(raw, req);
    clearRefreshCookie(res);
    res.json({ ok: true });
  }),
);

router.post(
  '/set-password',
  validateBody(setPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    await authService.setPassword(email, currentPassword, newPassword, req);
    res.json({ ok: true });
  }),
);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    // Always 200 to avoid email enumeration.
    res.json({ ok: true });
  }),
);

router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.newPassword, req);
    res.json({ ok: true });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

export default router;
