import type { ProjectStatus, Role } from '../types';

type BadgeColor = 'amber' | 'blue' | 'violet' | 'emerald' | 'green' | 'slate';

interface StatusMeta {
  color: BadgeColor;
  client: string;
  studio: string;
}

export const STATUS: Record<ProjectStatus, StatusMeta> = {
  pending: { color: 'amber', client: 'Awaiting Review', studio: 'New Request' },
  accepted: { color: 'blue', client: 'Accepted — Work Starting', studio: 'Accepted' },
  in_progress: { color: 'blue', client: 'In Progress', studio: 'In Progress' },
  first_draft_submitted: { color: 'emerald', client: 'First Draft Ready', studio: 'First Draft Delivered' },
  revision_1_requested: { color: 'amber', client: 'Revision 1 Requested', studio: 'Revision 1 Requested' },
  revision_1_in_progress: { color: 'violet', client: 'Revision 1 In Progress', studio: 'Revision 1 In Progress' },
  revision_1_submitted: { color: 'emerald', client: 'Revision 1 Ready', studio: 'Revision 1 Delivered' },
  revision_2_requested: { color: 'amber', client: 'Revision 2 Requested', studio: 'Revision 2 Requested' },
  revision_2_in_progress: { color: 'violet', client: 'Revision 2 In Progress', studio: 'Revision 2 In Progress' },
  revision_2_submitted: { color: 'emerald', client: 'Revision 2 Ready', studio: 'Revision 2 Delivered' },
  completed: { color: 'green', client: 'Completed', studio: 'Completed' },
  closed: { color: 'slate', client: 'Closed', studio: 'Closed' },
};

export function statusLabel(status: ProjectStatus, role: Role): string {
  const m = STATUS[status];
  return role === 'client' ? m.client : m.studio;
}

export function statusColor(status: ProjectStatus): BadgeColor {
  return STATUS[status].color;
}

// ── Progress tracker (collapses revisions into the visible lifecycle) ──
export const TRACKER_STEPS = ['Submitted', 'Accepted', 'In Production', 'Delivered', 'Completed', 'Closed'];

const STATUS_STEP: Record<ProjectStatus, number> = {
  pending: 0,
  accepted: 1,
  in_progress: 2,
  revision_1_requested: 2,
  revision_1_in_progress: 2,
  revision_2_requested: 2,
  revision_2_in_progress: 2,
  first_draft_submitted: 3,
  revision_1_submitted: 3,
  revision_2_submitted: 3,
  completed: 4,
  closed: 5,
};

const CAPTION: Partial<Record<ProjectStatus, string>> = {
  revision_1_requested: 'Revision 1 requested',
  revision_1_in_progress: 'Revision 1 in progress',
  revision_1_submitted: 'Revision 1 delivered',
  revision_2_requested: 'Revision 2 requested',
  revision_2_in_progress: 'Revision 2 in progress',
  revision_2_submitted: 'Revision 2 delivered',
};

export function trackerState(status: ProjectStatus) {
  const current = STATUS_STEP[status];
  const steps = TRACKER_STEPS.map((label, i) => ({
    label,
    state: i < current ? 'done' : i === current ? 'current' : 'future',
  }));
  return { steps, caption: CAPTION[status] ?? null };
}
