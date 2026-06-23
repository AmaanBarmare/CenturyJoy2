import { supabase } from '../lib/supabase';
import type { Role, User } from '../types';

const TABLE = 'users';

export const usersRepo = {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as User) ?? null;
  },

  async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return (data as (User & { password_hash: string }) | null) ?? null;
  },

  async getPasswordHash(id: string): Promise<string | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('password_hash')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data?.password_hash as string) ?? null;
  },

  async list(): Promise<User[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as User[]) ?? [];
  },

  async listActiveByRole(role: Role): Promise<User[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('role', role)
      .eq('is_active', true);
    if (error) throw error;
    return (data as User[]) ?? [];
  },

  async findManyByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.from(TABLE).select('*').in('id', ids);
    if (error) throw error;
    return (data as User[]) ?? [];
  },

  async countActiveAdmins(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('is_active', true);
    if (error) throw error;
    return count ?? 0;
  },

  async create(input: {
    email: string;
    name: string;
    role: Role;
    password_hash: string;
    company_name?: string | null;
    phone?: string | null;
    created_by?: string | null;
  }): Promise<User> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role,
        password_hash: input.password_hash,
        company_name: input.company_name ?? null,
        phone: input.phone ?? null,
        created_by: input.created_by ?? null,
        must_change_password: true,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as User;
  },

  async update(id: string, patch: Record<string, unknown>): Promise<User> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as User;
  },
};
