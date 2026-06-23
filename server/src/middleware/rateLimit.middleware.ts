import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

const userOrIp = (req: Request) => req.user?.id || req.ip || 'anon';

/** PRD B8 rate limits. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many login attempts. Try again later.' } },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => (req.body?.email as string)?.toLowerCase() || req.ip || 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many reset requests. Try again later.' } },
});

export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

export const createProjectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: userOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Project creation limit reached for this hour.' } },
});

export const presignLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 200,
  keyGenerator: userOrIp,
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,
  keyGenerator: userOrIp,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Support chatbot — keep OpenAI spend bounded per visitor. */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  keyGenerator: userOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many messages. Please wait a moment.' } },
});
