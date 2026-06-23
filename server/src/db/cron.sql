-- ============================================================================
-- Century Joy — scheduled background jobs (Supabase pg_cron + pg_net)
-- ============================================================================
-- When the API runs serverless on Vercel, the in-process interval workers
-- (email queue, orphan cleanup) do NOT run. Instead, Supabase pg_cron POSTs to
-- the API's protected /api/internal/* endpoints on a schedule.
--
-- Run this ONCE in the Supabase SQL Editor AFTER the API is deployed.
-- Available on the Supabase free tier.
--
-- Prerequisites:
--   * The API is reachable at a public URL (e.g. https://century-joy.vercel.app).
--   * The API has CRON_SECRET set to the same value used below.
-- ============================================================================

-- 1) Extensions ---------------------------------------------------------------
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Secrets in Vault ---------------------------------------------------------
--    EDIT the two values, then run. The secret must equal the API's CRON_SECRET.
--    (Re-running create_secret with the same name errors; update via the
--     Dashboard → Project Settings → Vault, or vault.update_secret.)
select vault.create_secret('https://YOUR-DEPLOYMENT.vercel.app', 'cj_api_url');
select vault.create_secret('YOUR_CRON_SECRET', 'cj_cron_secret');

-- 3) Email queue — every minute ----------------------------------------------
select cron.schedule(
  'cj-email-queue',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'cj_api_url')
           || '/api/internal/email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cj_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4) Orphan cleanup — daily at 03:00 UTC -------------------------------------
select cron.schedule(
  'cj-orphan-cleanup',
  '0 3 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'cj_api_url')
           || '/api/internal/orphan-cleanup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cj_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ── Manage / inspect ────────────────────────────────────────────────────────
--   select jobid, jobname, schedule, active from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 20;
--   select cron.unschedule('cj-email-queue');
--   select cron.unschedule('cj-orphan-cleanup');
