import { Router } from 'express';
import { asyncHandler } from '../lib/errors';
import { supabase } from '../lib/supabase';

const router = Router();

// Process is alive
router.get('/', (_req, res) => res.json({ status: 'ok', service: 'century-joy-api' }));

// Database connectivity — runs a trivial query
router.get(
  '/db',
  asyncHandler(async (_req, res) => {
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) return res.status(503).json({ status: 'unavailable', db: false });
    res.json({ status: 'ok', db: true });
  }),
);

export default router;
