import { v4 as uuid } from 'uuid';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { createSignedUploadUrl, deleteObject, readLeadingBytes } from '../lib/storage';
import { detectKind, kindAllowedForCategory, type FileKind } from '../lib/magicBytes';
import { filesRepo } from '../repositories/files.repo';
import { deliverablesRepo } from '../repositories/deliverables.repo';
import { writeAudit } from '../lib/audit';
import type { FileCategory, Iteration, RequestUser } from '../types';

const MB = 1024 * 1024;
const MAX_SIZE: Record<string, number> = {
  plan_master: 100 * MB,
  plan_floor: 100 * MB,
  elevation: 100 * MB,
  sections: 100 * MB,
  rcp_layouts: 100 * MB,
  references: 10 * MB,
  deliverable: 20 * MB,
};

const MIME_BY_KIND: Record<FileKind, string> = {
  pdf: 'application/pdf',
  dwg: 'image/vnd.dwg',
  jpg: 'image/jpeg',
};

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
}

function checkSize(category: string, sizeBytes: number) {
  const max = MAX_SIZE[category];
  if (max && sizeBytes > max) {
    throw badRequest(`File exceeds the ${Math.round(max / MB)} MB limit for this category.`);
  }
}

export interface PresignedItem {
  fileId: string;
  category?: FileCategory;
  viewNumber?: number;
  originalName: string;
  storageKey: string;
  signedUrl: string;
  token: string;
}

export const uploadService = {
  /** Create unconfirmed project_files rows + signed upload URLs. */
  async presignProjectFiles(
    projectId: string,
    files: { category: FileCategory; originalName: string; sizeBytes: number }[],
    user: RequestUser,
  ): Promise<PresignedItem[]> {
    const out: PresignedItem[] = [];
    for (const f of files) {
      checkSize(f.category, f.sizeBytes);
      const fileId = uuid();
      const storageKey = `projects/${projectId}/inputs/${fileId}.${extOf(f.originalName)}`;
      const row = await filesRepo.insert({
        project_id: projectId,
        category: f.category,
        original_name: f.originalName,
        storage_key: storageKey,
        file_size_bytes: f.sizeBytes,
        mime_type: 'application/octet-stream',
        uploaded_by: user.id,
      });
      const signed = await createSignedUploadUrl(storageKey);
      out.push({
        fileId: row.id,
        category: f.category,
        originalName: f.originalName,
        storageKey,
        signedUrl: signed.signedUrl,
        token: signed.token,
      });
    }
    return out;
  },

  /** Validate magic bytes for a single uploaded project file. */
  async confirmProjectFile(fileId: string, user: RequestUser): Promise<void> {
    const file = await filesRepo.findById(fileId);
    if (!file) throw notFound('File not found');
    if (file.is_confirmed) return;

    const bytes = await readLeadingBytes(file.storage_key, 16);
    const kind = bytes ? detectKind(bytes) : null;
    if (!bytes || !kindAllowedForCategory(file.category, kind)) {
      await deleteObject(file.storage_key);
      await filesRepo.remove(file.id);
      await writeAudit({
        user,
        action: 'file_rejected',
        entityType: 'project_file',
        entityId: file.id,
        metadata: { category: file.category, detectedKind: kind },
      });
      throw badRequest('Uploaded file failed validation and was removed. Please upload a valid file.');
    }
    await filesRepo.markConfirmed(file.id, MIME_BY_KIND[kind as FileKind]);
    await writeAudit({
      user,
      action: 'file_uploaded',
      entityType: 'project_file',
      entityId: file.id,
      metadata: { category: file.category },
    });
  },

  /** Create unconfirmed deliverable rows + signed upload URLs. */
  async presignDeliverables(
    projectId: string,
    iteration: Iteration,
    views: { viewNumber: number; originalName: string; sizeBytes: number }[],
    user: RequestUser,
  ): Promise<PresignedItem[]> {
    const out: PresignedItem[] = [];
    for (const v of views) {
      checkSize('deliverable', v.sizeBytes);
      const id = uuid();
      const storageKey = `projects/${projectId}/outputs/${iteration}/${id}.${extOf(v.originalName)}`;
      const row = await deliverablesRepo.insert({
        project_id: projectId,
        view_number: v.viewNumber,
        iteration,
        original_name: v.originalName,
        storage_key: storageKey,
        file_size_bytes: v.sizeBytes,
        mime_type: 'image/jpeg',
        uploaded_by: user.id,
      });
      const signed = await createSignedUploadUrl(storageKey);
      out.push({
        fileId: row.id,
        viewNumber: v.viewNumber,
        originalName: v.originalName,
        storageKey,
        signedUrl: signed.signedUrl,
        token: signed.token,
      });
    }
    return out;
  },

  /** Validate + confirm a batch of deliverables. Returns count confirmed. */
  async confirmDeliverables(deliverableIds: string[], projectId: string, user: RequestUser): Promise<number> {
    let confirmed = 0;
    for (const id of deliverableIds) {
      const d = await deliverablesRepo.findById(id);
      if (!d || d.project_id !== projectId) throw forbidden('Deliverable does not belong to this project');
      if (d.is_confirmed) {
        confirmed++;
        continue;
      }
      const bytes = await readLeadingBytes(d.storage_key, 16);
      const kind = bytes ? detectKind(bytes) : null;
      if (!bytes || !kindAllowedForCategory('deliverable', kind)) {
        await deleteObject(d.storage_key);
        await deliverablesRepo.remove(d.id);
        throw badRequest(`A deliverable for View ${d.view_number} failed validation (.jpg only).`);
      }
      await deliverablesRepo.markConfirmed(d.id);
      confirmed++;
    }
    return confirmed;
  },
};
