import { supabase } from '../lib/supabase';

export const refreshTokensRepo = {
  async create(input: {
    user_id: string;
    token_hash: string;
    expires_at: string;
    ip_address?: string | null;
    user_agent?: string | null;
  }) {
    const { error } = await supabase.from('refresh_tokens').insert({
      user_id: input.user_id,
      token_hash: input.token_hash,
      expires_at: input.expires_at,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
    });
    if (error) throw error;
  },

  async findValidByHash(token_hash: string) {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token_hash', token_hash)
      .is('revoked_at', null)
      .maybeSingle();
    if (error) throw error;
    return data as
      | { id: string; user_id: string; expires_at: string; revoked_at: string | null }
      | null;
  },

  async revoke(id: string) {
    const { error } = await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async revokeAllForUser(user_id: string) {
    const { error } = await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .is('revoked_at', null);
    if (error) throw error;
  },

  /** Active = not revoked and not expired. Used for the 3-session limit. */
  async listActiveForUser(user_id: string) {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('id, created_at')
      .eq('user_id', user_id)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as { id: string; created_at: string }[]) ?? [];
  },
};

export const resetTokensRepo = {
  async create(input: { user_id: string; token_hash: string; expires_at: string }) {
    const { error } = await supabase.from('password_reset_tokens').insert(input);
    if (error) throw error;
  },
  async findValidByHash(token_hash: string) {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', token_hash)
      .is('used_at', null)
      .maybeSingle();
    if (error) throw error;
    return data as { id: string; user_id: string; expires_at: string } | null;
  },
  async markUsed(id: string) {
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};
