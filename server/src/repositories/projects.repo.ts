import { supabase } from '../lib/supabase';
import type { Project, ProjectStatus } from '../types';

const TABLE = 'projects';

export interface ProjectListFilters {
  status?: ProjectStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const projectsRepo = {
  async create(input: {
    client_id: string;
    title: string;
    concept_note: string;
    number_of_views: number;
  }): Promise<Project> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        client_id: input.client_id,
        title: input.title,
        concept_note: input.concept_note,
        number_of_views: input.number_of_views,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as Project;
  },

  async findById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();
    if (error) throw error;
    return (data as Project) ?? null;
  },

  async update(id: string, patch: Record<string, unknown>): Promise<Project> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Project;
  },

  async listForClient(clientId: string, page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    return { rows: (data as Project[]) ?? [], total: count ?? 0 };
  },

  async listAll(filters: ProjectListFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    let q = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);
    if (filters.status) q = q.eq('status', filters.status);
    if (filters.search) q = q.ilike('title', `%${filters.search}%`);
    q = q.order('created_at', { ascending: false }).range(from, from + pageSize - 1);
    const { data, error, count } = await q;
    if (error) throw error;
    return { rows: (data as Project[]) ?? [], total: count ?? 0 };
  },

  async clientSummary(clientId: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('status')
      .eq('client_id', clientId)
      .eq('is_deleted', false);
    if (error) throw error;
    const rows = (data as { status: ProjectStatus }[]) ?? [];
    const total = rows.length;
    const completed = rows.filter((r) => r.status === 'completed' || r.status === 'closed').length;
    return { total, active: total - completed, completed };
  },
};

export const historyRepo = {
  async add(input: {
    project_id: string;
    from_status: string | null;
    to_status: string;
    changed_by: string;
    reason?: string | null;
  }) {
    const { error } = await supabase.from('project_status_history').insert({
      project_id: input.project_id,
      from_status: input.from_status,
      to_status: input.to_status,
      changed_by: input.changed_by,
      reason: input.reason ?? null,
    });
    if (error) throw error;
  },
  async listForProject(projectId: string) {
    const { data, error } = await supabase
      .from('project_status_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const revisionsRepo = {
  async add(input: { project_id: string; revision_number: number; requested_by: string; notes: string | null }) {
    const { error } = await supabase.from('revision_requests').insert(input);
    if (error) throw error;
  },
  async listForProject(projectId: string) {
    const { data, error } = await supabase
      .from('revision_requests')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};
