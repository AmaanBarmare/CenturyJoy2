import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { ClientRow } from '../../types';

export default function AdminClients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try { setClients(await endpoints.adminClients()); }
      catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [toast]);

  const rows = useMemo(() => {
    if (!q.trim()) return clients;
    const s = q.toLowerCase();
    return clients.filter((c) =>
      c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.company_name ?? '').toLowerCase().includes(s));
  }, [clients, q]);

  const totals = useMemo(() => ({
    clients: clients.length,
    active: clients.reduce((a, c) => a + c.projects_active, 0),
    completed: clients.reduce((a, c) => a + c.projects_completed, 0),
  }), [clients]);

  return (
    <PortalLayout
      title="Clients"
      subtitle="Every client account and their project activity"
      actions={<input className="input" style={{ width: 220, maxWidth: '50vw' }} placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} />}
    >
      {loading ? <Loading /> : (
        <>
          <div className="summary-row">
            <div className="stat"><div className="num">{totals.clients}</div><div className="lab">Clients</div></div>
            <div className="stat accent"><div className="num">{totals.active}</div><div className="lab">Active projects</div></div>
            <div className="stat"><div className="num">{totals.completed}</div><div className="lab">Completed</div></div>
          </div>

          {rows.length === 0 ? (
            <div className="card card-pad empty"><div className="ttl">No clients</div><p>{q ? 'No clients match your search.' : 'Client accounts will appear here.'}</p></div>
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Client</th><th>Email</th><th className="right">Total</th><th className="right">Active</th><th className="right">Done</th><th>Last project</th><th className="right">Action</th></tr></thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} onClick={() => navigate(`/admin/clients/${c.id}`)}>
                      <td>
                        <div className="proj-cell">
                          <span className="proj-glyph">{c.name.charAt(0).toUpperCase()}</span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ fontWeight: 600, display: 'block' }}>{c.name}</span>
                            {c.company_name && <span className="faint" style={{ fontSize: 12 }}>{c.company_name}</span>}
                          </span>
                        </div>
                      </td>
                      <td className="muted">{c.email}</td>
                      <td className="right mono">{c.projects_total}</td>
                      <td className="right mono" style={{ color: c.projects_active ? 'var(--red)' : undefined, fontWeight: c.projects_active ? 700 : 400 }}>{c.projects_active}</td>
                      <td className="right mono">{c.projects_completed}</td>
                      <td>{c.last_project_at ? formatDate(c.last_project_at) : '—'}</td>
                      <td className="right"><span className="btn btn-ghost btn-sm">View →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PortalLayout>
  );
}
