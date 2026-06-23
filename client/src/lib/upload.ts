import { createClient } from '@supabase/supabase-js';
import type { PresignedItem } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const bucket = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string) || 'century-joy-files';

export const supabase = url && anon ? createClient(url, anon) : null;

/** Upload a single file to its signed Supabase Storage URL (browser → storage). */
export async function uploadToSigned(item: PresignedItem, file: File): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase storage is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(item.storageKey, item.token, file);
  if (error) throw new Error(error.message);
}
