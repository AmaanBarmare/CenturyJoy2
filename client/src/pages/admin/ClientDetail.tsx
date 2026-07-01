import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { ClientDetail } from '../../types';

export default function AdminClientDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await endpoints.adminClientDetail(id)); }
      catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [id, toast]);

  if (loading) return <PortalLayout title="Client" back="/admin/clients"><Loading /></PortalLayout>;
  if (!data) return <PortalLayout title="Client" back="/admin/clients"><div className="empty">Client not found.</div></PortalLayout>;

  const { client, projects, stats } = data;

  return (
    <PortalLayout title={client.name} subtitle={client.company_name ?? 'Client account'} back="/admin/clients">
      <div className="detail-grid">
        <div className="detail-main">
          <div className="summary-row">
            <div className="stat"><div className="num">{stats.total}</div><div className="lab">Total projects</div></div>
            <div className="stat accent"><div className="num">{stats.active}</div><div className="lab">Active</div></div>
            <div className="stat"><div className="num">{stats.completed}</div><div className="lab">Completed</div></div>
          </div>

          <div className="section-label">Projects</div>
          {projects.length === 0 ? (
            <div className="card card-pad empty"><div className="ttl">No projects yet</div><p>This client has not submitted a project.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Reference</th><th>Project</th><th>Views</th><th>Submitted</th><th>Status</th><th className="right">Action</th></tr></thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} onClick={() => navigate(`/app/projects/${p.id}`)}>
                      <td className="cell-ref">{p.reference_number}</td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td className="mono">{p.number_of_views}</td>
                      <td>{formatDate(p.created_at)}</td>
                      <td><StatusBadge status={p.status} role="studio" /></td>
                      <td className="right"><span className="btn btn-ghost btn-sm">Open →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="detail-side">
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>Account</div>
            <div className="kv"><span className="meta-k">Email</span><span>{client.email}</span></div>
            {client.phone && <div className="kv"><span className="meta-k">Phone</span><span>{client.phone}</span></div>}
            {client.company_name && <div className="kv"><span className="meta-k">Company</span><span>{client.company_name}</span></div>}
            <div className="kv"><span className="meta-k">Joined</span><span>{formatDate(client.created_at)}</span></div>
            <div className="kv"><span className="meta-k">Last login</span><span>{client.last_login_at ? formatDate(client.last_login_at) : '—'}</span></div>
            <div className="kv"><span className="meta-k">Status</span><span>{client.is_active ? 'Active' : 'Inactive'}</span></div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
