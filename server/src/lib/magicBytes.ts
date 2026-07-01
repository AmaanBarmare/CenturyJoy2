/**
 * Validate a file's true type by inspecting its leading bytes,
 * independent of the declared extension. (PRD A7.3 rule 5.)
 */
export type FileKind = 'pdf' | 'dwg' | 'jpg' | 'png';

export function detectKind(bytes: Buffer): FileKind | null {
  if (bytes.length < 4) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';   // NEW

  // PDF: "%PDF"
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf';

  // DWG: "AC10" .. "AC10xx" — AutoCAD files begin with ASCII "AC" + version
  if (bytes[0] === 0x41 && bytes[1] === 0x43) {
    const tag = bytes.slice(0, 6).toString('ascii');
    if (/^AC\d{4}$/.test(tag)) return 'dwg';
  }

  return null;
}

/** Which true kinds are acceptable for each upload category. */
export const CATEGORY_ALLOWED_KINDS: Record<string, FileKind[]> = {
  plan_master: ['dwg', 'pdf'],
  plan_floor: ['dwg', 'pdf'],
  elevation: ['dwg', 'pdf'],
  sections: ['dwg', 'pdf'],
  rcp_layouts: ['dwg', 'pdf'],
  references: ['jpg', 'png'],   // + png
  // studio deliverables
  deliverable: ['jpg'],
};

// 3D models validated by extension, not magic bytes (.skp/.max have no
// reliable magic-byte signature across versions).
export const CATEGORY_ALLOWED_EXTENSIONS: Record<string, string[]> = {
  models_3d: ['skp', 'max'],
};

export function kindAllowedForCategory(category: string, kind: FileKind | null): boolean {
  const allowed = CATEGORY_ALLOWED_KINDS[category];
  if (!allowed) return false;
  return kind !== null && allowed.includes(kind);
}

export function isExtensionValidatedCategory(category: string): boolean {
  return category in CATEGORY_ALLOWED_EXTENSIONS;
}

export function extensionAllowedForCategory(category: string, ext: string): boolean {
  const allowed = CATEGORY_ALLOWED_EXTENSIONS[category];
  if (!allowed) return false;
  return allowed.includes(ext.toLowerCase());
}
