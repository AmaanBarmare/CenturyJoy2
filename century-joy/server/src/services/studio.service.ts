import { badRequest, notFound } from '../lib/errors';
import { projectsRepo, historyRepo } from '../repositories/projects.repo';
import { usersRepo } from '../repositories/users.repo';
import { writeAudit } from '../lib/audit';
import { enqueueEmail } from './email.service';
import { uploadService, type PresignedItem } from './upload.service';
import {
  canTransition,
  COMPLETE_FROM,
  iterationForStatus,
  UPLOAD_TARGET,
} from '../lib/stateMachine';
import type { ProjectStatus, RequestUser } from '../types';

async function getClient(clientId: string) {
  const u = await usersRepo.findById(clientId);
  return { name: u?.name ?? 'Client', email: u?.email ?? null };
}

async function loadProject(id: string) {
  const project = await projectsRepo.findById(id);
  if (!project) throw notFound('Project not found');
  if (project.status === 'closed') throw badRequest('This project is closed and read-only.');
  return project;
}

export const studioService = {
  async accept(user: RequestUser, id: string) {
    const project = await loadProject(id);
    if (project.status !== 'pending') throw badRequest('Only pending projects can be accepted.');
    await projectsRepo.update(id, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    });
    await historyRepo.add({ project_id: id, from_status: project.status, to_status: 'accepted', changed_by: user.id });
    await writeAudit({ user, action: 'project_accepted', entityType: 'project', entityId: id });
    const client = await getClient(project.client_id);
    if (client.email)
      await enqueueEmail({
        template: 'project_accepted',
        recipientEmail: client.email,
        projectId: id,
        payload: { referenceNumber: project.reference_number, title: project.title, projectId: id },
      });
    return { status: 'accepted' as ProjectStatus };
  },

  async updateStatus(user: RequestUser, id: string, toStatus: ProjectStatus) {
    const project = await loadProject(id);
    if (!canTransition(project.status, toStatus)) {
      throw badRequest(`Cannot move from ${project.status} to ${toStatus}.`);
    }
    await projectsRepo.update(id, { status: toStatus });
    await historyRepo.add({ project_id: id, from_status: project.status, to_status: toStatus, changed_by: user.id });
    await writeAudit({ user, action: 'status_changed', entityType: 'project', entityId: id, metadata: { from: project.status, to: toStatus } });

    if (toStatus === 'in_progress') {
      const client = await getClient(project.client_id);
      if (client.email)
        await enqueueEmail({
          template: 'status_in_progress',
          recipientEmail: client.email,
          projectId: id,
          payload: { referenceNumber: project.reference_number, title: project.title, projectId: id },
        });
    }
    return { status: toStatus };
  },

  async presignDeliverables(
    user: RequestUser,
    id: string,
    views: { viewNumber: number; originalName: string; sizeBytes: number }[],
  ): Promise<PresignedItem[]> {
    const project = await loadProject(id);
    if (!UPLOAD_TARGET[project.status]) {
      throw badRequest('Deliverables can only be uploaded while the project is in an active work stage.');
    }
    const iteration = iterationForStatus(project.status);
    return uploadService.presignDeliverables(id, iteration, views, user);
  },

  async confirmDeliverables(user: RequestUser, id: string, deliverableIds: string[]) {
    const project = await loadProject(id);
    const toStatus = UPLOAD_TARGET[project.status];
    if (!toStatus) throw badRequest('Project is not in a stage that accepts deliverables.');

    await uploadService.confirmDeliverables(deliverableIds, id, user);

    await projectsRepo.update(id, { status: toStatus });
    await historyRepo.add({ project_id: id, from_status: project.status, to_status: toStatus, changed_by: user.id });
    await writeAudit({ user, action: 'deliverables_uploaded', entityType: 'project', entityId: id, metadata: { to: toStatus, count: deliverableIds.length } });

    const client = await getClient(project.client_id);
    if (client.email) {
      if (toStatus === 'first_draft_submitted') {
        await enqueueEmail({
          template: 'first_draft',
          recipientEmail: client.email,
          projectId: id,
          payload: { referenceNumber: project.reference_number, title: project.title, projectId: id },
        });
      } else {
        const revisionNumber = toStatus === 'revision_1_submitted' ? 1 : 2;
        await enqueueEmail({
          template: 'revision_delivered',
          recipientEmail: client.email,
          projectId: id,
          payload: { referenceNumber: project.reference_number, title: project.title, revisionNumber, projectId: id },
        });
      }
    }
    return { status: toStatus };
  },

  async complete(user: RequestUser, id: string) {
    const project = await loadProject(id);
    if (!COMPLETE_FROM.includes(project.status)) {
      throw badRequest('The project must have a delivered draft before it can be completed.');
    }
    await projectsRepo.update(id, { status: 'completed', completed_at: new Date().toISOString() });
    await historyRepo.add({ project_id: id, from_status: project.status, to_status: 'completed', changed_by: user.id });
    await writeAudit({ user, action: 'project_completed', entityType: 'project', entityId: id });
    const client = await getClient(project.client_id);
    if (client.email)
      await enqueueEmail({
        template: 'project_completed',
        recipientEmail: client.email,
        projectId: id,
        payload: { referenceNumber: project.reference_number, title: project.title, projectId: id },
      });
    return { status: 'completed' as ProjectStatus };
  },

  async close(user: RequestUser, id: string) {
    const project = await projectsRepo.findById(id);
    if (!project) throw notFound('Project not found');
    if (project.status !== 'completed') throw badRequest('Only completed projects can be closed.');
    await projectsRepo.update(id, { status: 'closed', closed_at: new Date().toISOString(), closed_by: user.id });
    await historyRepo.add({ project_id: id, from_status: project.status, to_status: 'closed', changed_by: user.id });
    await writeAudit({ user, action: 'project_closed', entityType: 'project', entityId: id });
    const client = await getClient(project.client_id);
    if (client.email)
      await enqueueEmail({
        template: 'project_closed',
        recipientEmail: client.email,
        projectId: id,
        payload: { referenceNumber: project.reference_number, title: project.title, projectId: id },
      });
    return { status: 'closed' as ProjectStatus };
  },

  async flag(user: RequestUser, id: string, reason: string) {
    const project = await projectsRepo.findById(id);
    if (!project) throw notFound('Project not found');
    await writeAudit({ user, action: 'studio_flagged_issue', entityType: 'project', entityId: id, metadata: { reason } });
    const admins = await usersRepo.listActiveByRole('admin');
    for (const a of admins) {
      await enqueueEmail({
        template: 'studio_flagged',
        recipientEmail: a.email,
        projectId: id,
        payload: { referenceNumber: project.reference_number, title: project.title, reason, projectId: id },
      });
    }
    return { ok: true };
  },
};
