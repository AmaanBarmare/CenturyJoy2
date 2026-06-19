import { badRequest, conflict, notFound } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { usersRepo } from '../repositories/users.repo';
import { projectsRepo, historyRepo } from '../repositories/projects.repo';
import { refreshTokensRepo } from '../repositories/tokens.repo';
import { hashPassword, generateTempPassword } from '../lib/password';
import { writeAudit } from '../lib/audit';
import { enqueueEmail } from './email.service';
import type { ProjectStatus, RequestUser, Role } from '../types';

function publicUser(u: any) {
  // strip password_hash
  const { password_hash, ...rest } = u;
  return rest;
}

export const adminService = {
  async listUsers() {
    const users = await usersRepo.list();
    return users.map(publicUser);
  },

  async createUser(
    input: { name: string; email: string; role: Role; companyName?: string; phone?: string },
    by: RequestUser,
  ) {
    const existing = await usersRepo.findByEmail(input.email);
    if (existing) throw conflict('A user with this email already exists.');
    const tempPassword = generateTempPassword();
    const password_hash = await hashPassword(tempPassword);
    const user = await usersRepo.create({
      email: input.email,
      name: input.name,
      role: input.role,
      password_hash,
      company_name: input.companyName ?? null,
      phone: input.phone ?? null,
      created_by: by.id,
    });
    await writeAudit({ user: by, action: 'user_created', entityType: 'user', entityId: user.id, metadata: { role: input.role } });
    await enqueueEmail({
      template: 'account_created',
      recipientEmail: user.email,
      payload: { name: user.name, email: user.email, tempPassword },
    });
    return { user: publicUser(user), tempPassword };
  },

  async updateUser(id: string, patch: { name?: string; role?: Role; companyName?: string | null; phone?: string | null }, by: RequestUser) {
    const target = await usersRepo.findById(id);
    if (!target) throw notFound('User not found');
    // Guard: don't demote the last active admin.
    if (patch.role && patch.role !== 'admin' && target.role === 'admin') {
      const admins = await usersRepo.countActiveAdmins();
      if (admins <= 1) throw badRequest('Cannot change the role of the last remaining admin.');
    }
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.role !== undefined) dbPatch.role = patch.role;
    if (patch.companyName !== undefined) dbPatch.company_name = patch.companyName;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    const updated = await usersRepo.update(id, dbPatch);
    await writeAudit({ user: by, action: 'user_updated', entityType: 'user', entityId: id, metadata: patch });
    return publicUser(updated);
  },

  async resetPassword(id: string, by: RequestUser) {
    const target = await usersRepo.findById(id);
    if (!target) throw notFound('User not found');
    const tempPassword = generateTempPassword();
    const password_hash = await hashPassword(tempPassword);
    await usersRepo.update(id, { password_hash, must_change_password: true, failed_login_count: 0, locked_until: null });
    await refreshTokensRepo.revokeAllForUser(id);
    await writeAudit({ user: by, action: 'password_reset_by_admin', entityType: 'user', entityId: id });
    await enqueueEmail({
      template: 'account_created',
      recipientEmail: target.email,
      payload: { name: target.name, email: target.email, tempPassword },
    });
    return { tempPassword };
  },

  async deactivate(id: string, by: RequestUser) {
    const target = await usersRepo.findById(id);
    if (!target) throw notFound('User not found');
    if (target.role === 'admin') {
      const admins = await usersRepo.countActiveAdmins();
      if (admins <= 1) throw badRequest('Cannot deactivate the last remaining admin.');
    }
    const updated = await usersRepo.update(id, { is_active: false });
    await refreshTokensRepo.revokeAllForUser(id);
    await writeAudit({ user: by, action: 'user_deactivated', entityType: 'user', entityId: id });
    return publicUser(updated);
  },

  async reactivate(id: string, by: RequestUser) {
    const target = await usersRepo.findById(id);
    if (!target) throw notFound('User not found');
    const updated = await usersRepo.update(id, { is_active: true });
    await writeAudit({ user: by, action: 'user_reactivated', entityType: 'user', entityId: id });
    return publicUser(updated);
  },

  async overrideStatus(id: string, toStatus: ProjectStatus, reason: string, by: RequestUser) {
    const project = await projectsRepo.findById(id);
    if (!project) throw notFound('Project not found');
    await projectsRepo.update(id, { status: toStatus });
    await historyRepo.add({ project_id: id, from_status: project.status, to_status: toStatus, changed_by: by.id, reason });
    await writeAudit({ user: by, action: 'admin_status_override', entityType: 'project', entityId: id, metadata: { from: project.status, to: toStatus, reason } });
    return { status: toStatus };
  },

  async softDelete(id: string, by: RequestUser) {
    const project = await projectsRepo.findById(id);
    if (!project) throw notFound('Project not found');
    await projectsRepo.update(id, { is_deleted: true });
    await writeAudit({ user: by, action: 'project_soft_deleted', entityType: 'project', entityId: id });
    return { ok: true };
  },

  async auditLog(filters: { userId?: string; action?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const fromIdx = (page - 1) * pageSize;
    let q = supabase.from('audit_log').select('*', { count: 'exact' });
    if (filters.userId) q = q.eq('user_id', filters.userId);
    if (filters.action) q = q.eq('action', filters.action);
    if (filters.from) q = q.gte('created_at', filters.from);
    if (filters.to) q = q.lte('created_at', filters.to);
    q = q.order('created_at', { ascending: false }).range(fromIdx, fromIdx + pageSize - 1);
    const { data, error, count } = await q;
    if (error) throw error;
    return { entries: data ?? [], total: count ?? 0, page, pageSize };
  },

  async auditExportCsv(from: string, to: string): Promise<string> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error) throw error;
    const rows = data ?? [];
    const header = ['created_at', 'user_email', 'user_role', 'action', 'entity_type', 'entity_id', 'ip_address'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [header.join(',')];
    for (const r of rows as any[]) {
      lines.push(header.map((h) => esc(r[h])).join(','));
    }
    return lines.join('\n');
  },
};
