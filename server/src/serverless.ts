// Vercel serverless entry — exposes the Express app as one function.
//
// Local dev / a real Node host still use `src/index.ts` (app.listen + the
// background email/cleanup workers). Serverless functions are ephemeral, so
// those interval workers do NOT run here; on Vercel they are driven by
// Supabase pg_cron hitting protected endpoints (see README → Deploying).
import express from 'express';
import { createApp } from './app';

// Vercel Services strips the backend's `/api` routePrefix before handing the
// request to this function, but the Express app mounts every route under
// `/api/*`. Re-add the prefix here so routing matches. (Local dev keeps `/api`
// via the Vite proxy and runs src/index.ts directly, so it is unaffected. The
// guard makes this a no-op if a prefix is already present.)
const api = createApp();
const handler = express();
handler.use((req, _res, next) => {
  if (!req.url.startsWith('/api')) req.url = `/api${req.url}`;
  next();
});
handler.use(api);

export default handler;
