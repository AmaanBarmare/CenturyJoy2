import type { ProjectStatus } from '../types';

/**
 * Valid status transitions (PRD A8.2). Each entry maps a status to the
 * set of statuses it may move to via normal (non-admin) actions.
 * Admin override can move to ANY status and is handled separately.
 */
export const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  pending: ['accepted'],
  accepted: ['in_progress'],
  in_progress: ['first_draft_submitted'],
  first_draft_submitted: ['revision_1_requested', 'completed'],
  revision_1_requested: ['revision_1_in_progress'],
  revision_1_in_progress: ['revision_1_submitted'],
  revision_1_submitted: ['revision_2_requested', 'completed'],
  revision_2_requested: ['revision_2_in_progress'],
  revision_2_in_progress: ['revision_2_submitted'],
  revision_2_submitted: ['completed'],
  completed: ['closed'],
  closed: [],
};

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses from which a studio upload of deliverables is valid, and the resulting status. */
export const UPLOAD_TARGET: Partial<Record<ProjectStatus, ProjectStatus>> = {
  in_progress: 'first_draft_submitted',
  revision_1_in_progress: 'revision_1_submitted',
  revision_2_in_progress: 'revision_2_submitted',
};

/** Statuses from which the client may request the next revision. */
export const REVISION_FROM: ProjectStatus[] = ['first_draft_submitted', 'revision_1_submitted'];

/** Statuses from which the studio may mark a project complete. */
export const COMPLETE_FROM: ProjectStatus[] = [
  'first_draft_submitted',
  'revision_1_submitted',
  'revision_2_submitted',
];

/** Iteration label for a deliverable uploaded while in the given status. */
export function iterationForStatus(status: ProjectStatus): 'original' | 'revision_1' | 'revision_2' {
  if (status === 'revision_1_in_progress') return 'revision_1';
  if (status === 'revision_2_in_progress') return 'revision_2';
  return 'original';
}

export const ALL_STATUSES: ProjectStatus[] = Object.keys(TRANSITIONS) as ProjectStatus[];
