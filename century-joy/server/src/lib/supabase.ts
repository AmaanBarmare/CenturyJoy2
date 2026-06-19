import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Service-role client — full access, bypasses RLS.
 * Server-side ONLY. Never expose this key to the browser.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const STORAGE_BUCKET = env.storageBucket;
