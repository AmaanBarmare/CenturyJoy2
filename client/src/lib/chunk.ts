/**
 * Client-side chunk-and-split for large 3D models (see backend MD §6).
 *
 * Supabase's free-tier per-object cap is 50 MB. A `models_3d` file larger than
 * CHUNK_SIZE (45 MB) is split into `ceil(size / 45MB)` parts named
 *   <stem>__part<i>of<n>.<ext>
 * Each part uploads as its own `models_3d` file (each < 50 MB, extension still
 * valid). On download the parts are grouped, fetched, and re-joined into one
 * byte-identical blob. The backend needs no change — each part is a normal file.
 */

export const CHUNK_SIZE = 45 * 1024 * 1024; // 45 MB
export const CHUNK_RE = /^(.+)__part(\d+)of(\d+)\.([A-Za-z0-9]+)$/;

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1) : '';
}

export function stemOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(0, i) : name;
}

export function partName(stem: string, i: number, n: number, ext: string): string {
  return `${stem}__part${i}of${n}.${ext}`;
}

/** The reassembled display name for a (possibly chunked) file name. */
export function baseName(name: string): string {
  const m = name.match(CHUNK_RE);
  return m ? `${m[1]}.${m[4]}` : name;
}

export interface UploadUnit {
  category: string;
  originalName: string;
  blob: Blob; // a File, or a sliced Blob for a chunk part
  sizeBytes: number;
}

/**
 * Expand a picked file into one or more upload units. A `models_3d` file larger
 * than CHUNK_SIZE becomes `n` __partIofN slices; everything else stays whole.
 */
export function expandForUpload(category: string, file: File): UploadUnit[] {
  if (category !== 'models_3d' || file.size <= CHUNK_SIZE) {
    return [{ category, originalName: file.name, blob: file, sizeBytes: file.size }];
  }
  const n = Math.ceil(file.size / CHUNK_SIZE);
  const ext = extOf(file.name);
  const stem = stemOf(file.name);
  const units: UploadUnit[] = [];
  for (let i = 0; i < n; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    units.push({
      category,
      originalName: partName(stem, i + 1, n, ext),
      blob: file.slice(start, end),
      sizeBytes: end - start,
    });
  }
  return units;
}

// ── Download-side reassembly ──────────────────────────────

export interface FileGroup<T> {
  key: string;
  displayName: string;
  totalBytes: number;
  isChunked: boolean;
  items: T[]; // parts sorted by index; a single item when not chunked
}

/**
 * Group a category's files so multi-part 3D models collapse into one row.
 * Parts are matched by CHUNK_RE and sorted by their part index.
 */
export function groupChunkedFiles<T extends { originalName: string; sizeBytes: number }>(
  files: T[],
): FileGroup<T>[] {
  const groups: FileGroup<T>[] = [];
  const byKey = new Map<string, FileGroup<T>>();

  for (const f of files) {
    const m = f.originalName.match(CHUNK_RE);
    if (!m) {
      groups.push({ key: `s:${groups.length}:${f.originalName}`, displayName: f.originalName, totalBytes: f.sizeBytes, isChunked: false, items: [f] });
      continue;
    }
    const key = `c:${m[1]}.${m[4]}`;
    let g = byKey.get(key);
    if (!g) {
      g = { key, displayName: `${m[1]}.${m[4]}`, totalBytes: 0, isChunked: true, items: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    g.items.push(f);
    g.totalBytes += f.sizeBytes;
  }

  for (const g of groups) {
    if (g.isChunked) {
      g.items.sort((a, b) => {
        const ai = Number(a.originalName.match(CHUNK_RE)?.[2] ?? 0);
        const bi = Number(b.originalName.match(CHUNK_RE)?.[2] ?? 0);
        return ai - bi;
      });
    }
  }
  return groups;
}

/** Fetch every part in order, join into one blob, and save it as `name`. */
export async function downloadReassembled(name: string, parts: { downloadUrl: string }[]): Promise<void> {
  const blobs: Blob[] = [];
  for (const p of parts) {
    const res = await fetch(p.downloadUrl);
    if (!res.ok) throw new Error(`Could not fetch a file part (${res.status}).`);
    blobs.push(await res.blob());
  }
  triggerDownload(name, new Blob(blobs));
}

/** Save a blob to disk via a temporary object URL. */
export function triggerDownload(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
