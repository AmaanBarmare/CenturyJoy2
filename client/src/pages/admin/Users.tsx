import { useEffect, useState } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { Loading } from '../../components/Loading';
import { Modal } from '../../components/Modal';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { Role, UserRow } from '../../types';

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'client' as Role, companyName: '', phone: '' });
  const [tempResult, setTempResult] = useState<{ email: string; tempPassword: string } | null>(null);

  const load = async () => {
    try { setUsers(await endpoints.adminUsers()); }
    catch (err) { toast(apiError(err), 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const create = async () => {
    setBusy(true);
    try {
      const { user, tempPassword } = await endpoints.adminCreateUser(form);
      setCreateOpen(false);
      setForm({ name: '', email: '', role: 'client', companyName: '', phone: '' });
      setTempResult({ email: user.email, tempPassword });
      toast('User created. Welcome email queued.', 'success');
      await load();
    } catch (err) { toast(apiError(err), 'error'); }
    finally { setBusy(false); }
  };

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); toast(ok, 'success'); await load(); }
    catch (err) { toast(apiError(err), 'error'); }
    finally { setBusy(false); }
  };

  const reset = async (u: UserRow) => {
    setBusy(true);
    try {
      const { tempPassword } = await endpoints.adminResetPassword(u.id);
      setTempResult({ email: u.email, tempPassword });
      toast('Password reset. New temporary password issued.', 'success');
    } catch (err) { toast(apiError(err), 'error'); }
    finally { setBusy(false); }
  };

  return (
    <PortalLayout
      title="Users"
      subtitle="Provision and manage portal accounts"
      actions={<button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>+ Create user</button>}
    >
      {loading ? <Loading /> : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th><th className="right">Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 600 }}>{u.name}{u.company_name ? <div className="faint" style={{ fontSize: 11 }}>{u.company_name}</div> : null}</td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{u.email}</td>
                  <td><span className="badge slate"><span className="dot" />{u.role}</span></td>
                  <td>{u.is_active ? <span className="badge green"><span className="dot" />Active</span> : <span className="badge amber"><span className="dot" />Inactive</span>}</td>
                  <td className="muted">{formatDate(u.last_login_at)}</td>
                  <td className="right">
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => reset(u)}>Reset password</button>
                      {u.is_active
                        ? <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => act(() => endpoints.adminDeactivate(u.id), 'User deactivated.')}>Deactivate</button>
                        : <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act(() => endpoints.adminReactivate(u.id), 'User reactivated.')}>Reactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <Modal title="Create user" onClose={() => !busy && setCreateOpen(false)}
          footer={<><button className="btn btn-ghost" disabled={busy} onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy || !form.name.trim() || !form.email.trim()} onClick={create}>{busy ? <span className="spinner" /> : 'Create & send invite'}</button></>}>
          <div className="field"><label>Full name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Role</label>
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="client">Client</option><option value="studio">Studio</option><option value="admin">Admin</option>
            </select>
          </div>
          <div className="field"><label>Company (optional)</label><input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
          <div className="field"><label>Phone (optional)</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </Modal>
      )}

      {tempResult && (
        <Modal title="Temporary password issued" onClose={() => setTempResult(null)}
          footer={<button className="btn btn-primary" onClick={() => setTempResult(null)}>Done</button>}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>A welcome email with these details was queued. Share securely if needed.</p>
          <div className="auth-note"><div>Email: <b>{tempResult.email}</b></div><div style={{ marginTop: 6 }}>Temporary password: <b className="mono">{tempResult.tempPassword}</b></div></div>
          <p className="muted" style={{ fontSize: 12.5 }}>The user must set a new password on first sign-in.</p>
        </Modal>
      )}
    </PortalLayout>
  );
}
