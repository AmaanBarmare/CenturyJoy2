// Vercel serverless entry — exposes the Express app as one function.
//
// Local dev / a real Node host still use `src/index.ts` (app.listen + the
// background email/cleanup workers). Serverless functions are ephemeral, so
// those interval workers do NOT run here; on Vercel they are driven by
// Supabase pg_cron hitting protected endpoints (see README → Deploying).
import { createApp } from '../src/app';

export default createApp();
