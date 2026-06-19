import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { Project } from '../../types';

export default function AdminProjects() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [all, setAll] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try { setAll((await endpoints.adminProjects({ page: 1 })).projects); }
      catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [toast]);

  const rows = useMemo(() => {
    if (!q.trim()) return all;
    const s = q.toLowerCase();
    return all.filter((p) => p.title.toLowerCase().includes(s) || p.reference_number.toLowerCase().includes(s) || (p.client_name ?? '').toLowerCase().includes(s));
  }, [all, q]);

  return (
    <PortalLayout
      title="All Projects"
      subtitle="Oversight across every client and studio project"
      actions={<input className="input" style={{ width: 220 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />}
    >
      {loading ? <Loading /> : rows.length === 0 ? (
        <div className="card card-pad empty"><div className="ttl">No projects</div></div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Reference</th><th>Client</th><th>Project</th><th>Created</th><th>Status</th><th className="right">Action</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/app/projects/${p.id}`)}>
                  <td className="cell-ref">{p.reference_number}</td>
                  <td>{p.client_name}</td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>{formatDate(p.created_at)}</td>
                  <td><StatusBadge status={p.status} role="studio" /></td>
                  <td className="right"><span className="btn btn-ghost btn-sm">Open →</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PortalLayout>
  );
}
