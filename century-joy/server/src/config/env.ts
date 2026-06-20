import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env and fill it in.`,
    );
  }
  return v;
}

function optional(key: string, fallback = ''): string {
  return process.env[key]?.trim() || fallback;
}

export const env = {
  port: parseInt(optional('PORT', '8080'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd: optional('NODE_ENV', 'development') === 'production',
  clientOrigins: optional('CLIENT_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
  storageBucket: optional('SUPABASE_STORAGE_BUCKET', 'century-joy-files'),

  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  accessTokenTtl: optional('ACCESS_TOKEN_TTL', '15m'),
  refreshTokenTtlDays: parseInt(optional('REFRESH_TOKEN_TTL_DAYS', '7'), 10),

  resendApiKey: optional('RESEND_API_KEY'),
  emailFrom: optional('EMAIL_FROM', 'Century Joy <noreply@centuryjoy.in>'),
  appBaseUrl: optional('APP_BASE_URL', 'http://localhost:5173'),
  adminAlertEmail: optional('ADMIN_ALERT_EMAIL'),

  // ── OpenAI (support chatbot) ──
  openaiApiKey: optional('OPENAI_API_KEY'),
};

export type Env = typeof env;
