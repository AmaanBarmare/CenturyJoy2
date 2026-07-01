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
  | 'models_3d'      // NEW
  | 'references';

export type ProjectType = 'residential' | 'commercial' | 'hospitality' | 'retail' | 'other';        // NEW
export type ServiceType = 'interior' | 'exterior' | 'material_visualisation' | 'multiple_views';     // NEW

export type Iteration = 'original' | 'revision_1' | 'revision_2';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  company_name: string | null;
  phone: string | null;
  failed_login_count: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  created_by: string | null;
}

export interface Project {
  id: string;
  reference_number: string;
  client_id: string;
  title: string;
  status: ProjectStatus;
  project_type: ProjectType | null;
  services: ServiceType[] | null;
  concept_note: string | null;                    // kept (legacy)
  brief_design_intent: string | null;
  brief_client_requirements: string | null;
  brief_preferred_style: string | null;
  brief_material_preferences: string | null;
  brief_special_instructions: string | null;
  number_of_views: number;
  revisions_used: number;
  revisions_allowed: number;
  is_deleted: boolean;
  accepted_at: string | null;
  accepted_by: string | null;
  completed_at: string | null;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  category: FileCategory;
  original_name: string;
  storage_key: string;
  file_size_bytes: number;
  mime_type: string;
  is_confirmed: boolean;
  uploaded_by: string;
  created_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  view_number: number;
  iteration: Iteration;
  original_name: string;
  storage_key: string;
  file_size_bytes: number;
  mime_type: string;
  is_confirmed: boolean;
  uploaded_by: string;
  created_at: string;
}

export interface RequestUser {
  id: string;
  role: Role;
  email: string;
  name: string;
}
