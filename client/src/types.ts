export type Role = 'client' | 'studio' | 'admin';

export type ProjectStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'first_draft_submitted'
  | 'revision_1_requested'
  | 'revision_1_in_progress'
  | 'revision_1_submitted'
  | 'revision_2_requested'
  | 'revision_2_in_progress'
  | 'revision_2_submitted'
  | 'completed'
  | 'closed';

export type FileCategory =
  | 'plan_master'
  | 'plan_floor'
  | 'elevation'
  | 'sections'
  | 'rcp_layouts'
  | 'references';

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  mustChangePassword?: boolean;
}

export interface Project {
  id: string;
  reference_number: string;
  client_id: string;
  client_name?: string;
  company_name?: string | null;
  title: string;
  status: ProjectStatus;
  concept_note: string | null;
  number_of_views: number;
  revisions_used: number;
  revisions_allowed: number;
  accepted_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  id: string;
  category: FileCategory;
  originalName: string;
  sizeBytes: number;
  downloadUrl: string;
}

export interface DeliverableItem {
  id: string;
  viewNumber: number;
  iteration: 'original' | 'revision_1' | 'revision_2';
  originalName: string;
  sizeBytes: number;
  downloadUrl: string;
}

export interface HistoryItem {
  id: string;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  created_at: string;
}

export interface RevisionItem {
  id: string;
  revision_number: number;
  notes: string | null;
  created_at: string;
}

export interface ProjectDetail {
  project: Project;
  files: FileItem[];
  deliverables: DeliverableItem[];
  history: HistoryItem[];
  revisions: RevisionItem[];
  canRequestRevision: boolean;
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

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AuditEntry {
  id: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  created_at: string;
}
