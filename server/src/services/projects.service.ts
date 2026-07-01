import { badRequest, forbidden, notFound } from '../lib/errors';
import { projectsRepo, historyRepo, revisionsRepo } from '../repositories/projects.repo';
import { filesRepo } from '../repositories/files.repo';
import { deliverablesRepo } from '../repositories/deliverables.repo';
import { usersRepo } from '../repositories/users.repo';
import { createSignedDownloadUrl } from '../lib/storage';
import { writeAudit } from '../lib/audit';
import { enqueueEmail } from './email.service';
import { uploadService, type PresignedItem } from './upload.service';
import { REVISION_FROM } from '../lib/stateMachine';
import type { Project, RequestUser } from '../types';

function assertCanView(user: RequestUser, project: Project) {
  if (user.role === 'client' && project.client_id !== user.id) {
    throw forbidden('You do not have access to this project');
  }
}

async function clientLabel(clientId: string) {
  const u = await usersRepo.findById(clientId);
  return { clientName: u?.name ?? 'Unknown', companyName: u?.company_name ?? null, clientEmail: u?.email ?? null };
}

async function enrichList(projects: Project[]) {
  const ids = [...new Set(projects.map((p) => p.client_id))];
  const users = await usersRepo.findManyByIds(ids);
  const map = new Map(users.map((u) => [u.id, u]));
  return projects.map((p) => ({
    ...p,
    client_name: map.get(p.client_id)?.name ?? 'Unknown',
    company_name: map.get(p.client_id)?.company_name ?? null,
  }));
}

export const projectsService = {
  async create(
    user: RequestUser,
    input: {
      title: string;
      projectType: string;
      services: string[];
      numberOfViews: number;
      designIntent: string;
      clientRequirements: string;
      preferredStyle: string;
      materialPreferences: string;
      specialInstructions: string;
      files: { category: any; originalName: string; sizeBytes: number }[];
    },
  ): Promise<{ project: Project; uploads: PresignedItem[] }> {
    const project = await projectsRepo.create({
      client_id: user.id,
      title: input.title,
      project_type: input.projectType,
      services: input.services,
      number_of_views: input.numberOfViews,
      brief_design_intent: input.designIntent,
      brief_client_requirements: input.clientRequirements || null,
      brief_preferred_style: input.preferredStyle || null,
      brief_material_preferences: input.materialPreferences || null,
      brief_special_instructions: input.specialInstructions || null,
    });
    await historyRepo.add({ project_id: project.id, from_status: null, to_status: 'pending', changed_by: user.id });
    const uploads = await uploadService.presignProjectFiles(project.id, input.files, user);
    await writeAudit({ user, action: 'project_created', entityType: 'project', entityId: project.id, metadata: { reference: project.reference_number } });
    return { project, uploads };
  },

  /** Called after the client confirms all file uploads — notifies studio. */
  async notifySubmitted(user: RequestUser, projectId: string): Promise<void> {
    const project = await projectsRepo.findById(projectId);
    if (!project) throw notFound('Project not found');
    assertCanView(user, project);
    const { clientName } = await clientLabel(project.client_id);
    const studio = await usersRepo.listActiveByRole('studio');
    for (const s of studio) {
      await enqueueEmail({
        template: 'project_submitted',
        recipientEmail: s.email,
        projectId: project.id,
        payload: {
          referenceNumber: project.reference_number,
          title: project.title,
          numberOfViews: project.number_of_views,
          clientName,
          projectId: project.id,
        },
      });
    }
  },

  async listForClient(user: RequestUser, page: number) {
    const { rows, total } = await projectsRepo.listForClient(user.id, page, 10);
    return { projects: rows, total, page, pageSize: 10 };
  },

  async clientSummary(user: RequestUser) {
    return projectsRepo.clientSummary(user.id);
  },

  async listAll(filters: { status?: any; search?: string; page?: number; pageSize?: number }) {
    const { rows, total } = await projectsRepo.listAll(filters);
    const projects = await enrichList(rows);
    return { projects, total, page: filters.page ?? 1, pageSize: filters.pageSize ?? 20 };
  },

  async getDetail(user: RequestUser, id: string) {
    const project = await projectsRepo.findById(id);
    if (!project) throw notFound('Project not found');
    assertCanView(user, project);

    const [files, deliverables, history, revisions, label] = await Promise.all([
      filesRepo.listConfirmed(id),
      deliverablesRepo.listConfirmed(id),
      historyRepo.listForProject(id),
      revisionsRepo.listForProject(id),
      clientLabel(project.client_id),
    ]);

    const filesWithUrls = await Promise.all(
      files.map(async (f) => ({
        id: f.id,
        category: f.category,
        originalName: f.original_name,
        sizeBytes: f.file_size_bytes,
        downloadUrl: await createSignedDownloadUrl(f.storage_key),
      })),
    );
    const deliverablesWithUrls = await Promise.all(
      deliverables.map(async (d) => ({
        id: d.id,
        viewNumber: d.view_number,
        iteration: d.iteration,
        originalName: d.original_name,
        sizeBytes: d.file_size_bytes,
        downloadUrl: await createSignedDownloadUrl(d.storage_key),
      })),
    );

    const canRequestRevision =
      user.role === 'client' &&
      project.client_id === user.id &&
      REVISION_FROM.includes(project.status) &&
      project.revisions_used < project.revisions_allowed;

    return {
      project: { ...project, client_name: label.clientName, company_name: label.companyName },
      files: filesWithUrls,
      deliverables: deliverablesWithUrls,
      history,
      revisions,
      canRequestRevision,
    };
  },

  async requestRevision(user: RequestUser, id: string, notes: string) {
    const project = await projectsRepo.findById(id);
    if (!project) throw notFound('Project not found');
    if (project.client_id !== user.id) throw forbidden('You do not have access to this project');
    if (!REVISION_FROM.includes(project.status)) {
      throw badRequest('A revision cannot be requested at this stage.');
    }
    if (project.revisions_used >= project.revisions_allowed) {
      throw badRequest('Maximum revisions reached. The studio team will be in touch via email.');
    }
    const revisionNumber = project.revisions_used + 1;
    const toStatus = revisionNumber === 1 ? 'revision_1_requested' : 'revision_2_requested';

    await projectsRepo.update(id, { status: toStatus, revisions_used: revisionNumber });
    await historyRepo.add({
      project_id: id,
      from_status: project.status,
      to_status: toStatus,
      changed_by: user.id,
      reason: notes || null,
    });
    await revisionsRepo.add({
      project_id: id,
      revision_number: revisionNumber,
      requested_by: user.id,
      notes: notes || null,
    });
    await writeAudit({ user, action: 'revision_requested', entityType: 'project', entityId: id, metadata: { revisionNumber } });

    const { clientName } = await clientLabel(project.client_id);
    const studio = await usersRepo.listActiveByRole('studio');
    for (const s of studio) {
      await enqueueEmail({
        template: 'revision_requested',
        recipientEmail: s.email,
        projectId: id,
        payload: {
          referenceNumber: project.reference_number,
          title: project.title,
          revisionNumber,
          notes,
          clientName,
          projectId: id,
        },
      });
    }
    return { status: toStatus, revisionNumber };
  },
};
