import { supabase } from '../lib/supabase';
import type { Deliverable, Iteration } from '../types';

const TABLE = 'deliverables';

export const deliverablesRepo = {
  async insert(input: {
    project_id: string;
    view_number: number;
    iteration: Iteration;
    original_name: string;
    storage_key: string;
    file_size_bytes: number;
    mime_type: string;
    uploaded_by: string;
  }): Promise<Deliverable> {
    const { data, error } = await supabase.from(TABLE).insert(input).select('*').single();
    if (error) throw error;
    return data as Deliverable;
  },

  async findById(id: string): Promise<Deliverable | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as Deliverable) ?? null;
  },

  async markConfirmed(id: string) {
    const { error } = await supabase.from(TABLE).update({ is_confirmed: true }).eq('id', id);
    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async listConfirmed(projectId: string): Promise<Deliverable[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('project_id', projectId)
      .eq('is_confirmed', true)
      .order('view_number', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Deliverable[]) ?? [];
  },
};
