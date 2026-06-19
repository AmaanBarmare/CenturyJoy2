import { supabase } from '../lib/supabase';
import type { FileCategory, ProjectFile } from '../types';

const TABLE = 'project_files';

export const filesRepo = {
  async insert(input: {
    project_id: string;
    category: FileCategory;
    original_name: string;
    storage_key: string;
    file_size_bytes: number;
    mime_type: string;
    uploaded_by: string;
  }): Promise<ProjectFile> {
    const { data, error } = await supabase.from(TABLE).insert(input).select('*').single();
    if (error) throw error;
    return data as ProjectFile;
  },

  async findById(id: string): Promise<ProjectFile | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as ProjectFile) ?? null;
  },

  async markConfirmed(id: string, mime_type: string) {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_confirmed: true, mime_type })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async listConfirmed(projectId: string): Promise<ProjectFile[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('project_id', projectId)
      .eq('is_confirmed', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as ProjectFile[]) ?? [];
  },
};
