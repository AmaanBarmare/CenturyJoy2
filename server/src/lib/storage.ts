import { supabase, STORAGE_BUCKET } from './supabase';
import { logger } from './logger';

const bucket = () => supabase.storage.from(STORAGE_BUCKET);

/**
 * Create a signed upload URL the browser can upload to directly
 * (file never passes through our server — PRD A7.3 rule 1).
 */
export async function createSignedUploadUrl(storageKey: string): Promise<{
  token: string;
  signedUrl: string;
  path: string;
}> {
  const { data, error } = await bucket().createSignedUploadUrl(storageKey);
  if (error || !data) throw error ?? new Error('Failed to create signed upload URL');
  return { token: data.token, signedUrl: data.signedUrl, path: data.path };
}

/** Time-limited download URL (default 1 hour, PRD A10). */
export async function createSignedDownloadUrl(
  storageKey: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await bucket().createSignedUrl(storageKey, expiresInSeconds);
  if (error || !data) throw error ?? new Error('Failed to create signed download URL');
  return data.signedUrl;
}

export async function deleteObject(storageKey: string): Promise<void> {
  const { error } = await bucket().remove([storageKey]);
  if (error) logger.warn('Failed to delete storage object', { storageKey, error: error.message });
}

/**
 * Read the first `n` bytes of an object via a ranged request on a short-lived
 * signed URL — used for magic-byte validation without downloading the whole file.
 */
export async function readLeadingBytes(storageKey: string, n = 16): Promise<Buffer | null> {
  try {
    const url = await createSignedDownloadUrl(storageKey, 60);
    const res = await fetch(url, { headers: { Range: `bytes=0-${n - 1}` } });
    if (!res.ok && res.status !== 206) return null;
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    logger.warn('Failed to read leading bytes', {
      storageKey,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/** Confirm an object actually exists in storage (HeadObject equivalent). */
export async function objectExists(storageKey: string): Promise<boolean> {
  const slash = storageKey.lastIndexOf('/');
  const dir = slash >= 0 ? storageKey.slice(0, slash) : '';
  const name = slash >= 0 ? storageKey.slice(slash + 1) : storageKey;
  const { data, error } = await bucket().list(dir, { search: name, limit: 100 });
  if (error) return false;
  return (data ?? []).some((o) => o.name === name);
}
