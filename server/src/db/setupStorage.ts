/**
 * Creates the private storage bucket (idempotent). Run: npm run setup:storage
 */
import { supabase, STORAGE_BUCKET } from '../lib/supabase';

async function main() {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('Could not list buckets:', listErr.message);
    process.exit(1);
  }
  if (buckets?.some((b) => b.name === STORAGE_BUCKET)) {
    console.log(`Bucket "${STORAGE_BUCKET}" already exists.`);
    process.exit(0);
  }
  const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: false,
  });
  if (error) {
    console.error('Failed to create bucket:', error.message);
    process.exit(1);
  }
  console.log(`Created private bucket "${STORAGE_BUCKET}".`);
  process.exit(0);
}

main();
