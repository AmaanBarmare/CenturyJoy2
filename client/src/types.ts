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
  | 'models_3d'
  | 'references';

export type ProjectType = 'residential' | 'commercial' | 'hospitality' | 'retail' | 'other';
export type ServiceType = 'interior' | 'exterior' | 'material_visualisation' | 'multiple_views';

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
  project_type?: ProjectType | null;
  services?: ServiceType[] | null;
  concept_note: string | null;
  brief_design_intent?: string | null;
  brief_client_requirements?: string | null;
  brief_preferred_style?: string | null;
  brief_material_preferences?: string | null;
  brief_special_instructions?: string | null;
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

// ── Admin: Clients (mini-CRM) ─────────────────────────────
export interface ClientRow extends UserRow {
  projects_total: number;
  projects_active: number;
  projects_completed: number;
  last_project_at: string | null;
}

export interface ClientDetail {
  client: UserRow;
  projects: Project[];
  stats: { total: number; active: number; completed: number };
}

// ── Admin: Analytics ──────────────────────────────────────
export interface MonthPoint { key: string; label: string; count: number; }

export interface Analytics {
  totals: { clients: number; studio: number; projects: number; active: number; completed: number };
  receivedByMonth: MonthPoint[];
  registrationsByMonth: MonthPoint[];
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  services: Record<string, number>;
  avgCompletionDays: number | null;
  avgRevisions: number;
}

// ── Admin: Production board ────────────────────────────────
export type BoardProject = Project & { client_name?: string };
export interface Board {
  active: BoardProject[];
  delivery: BoardProject[];
}
