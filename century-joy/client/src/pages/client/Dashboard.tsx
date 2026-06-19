import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { Project } from '../../types';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, completed: 0 });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [list, sum] = await Promise.all([endpoints.listMyProjects(page), endpoints.mySummary()]);
        setProjects(list.projects);
        setTotal(list.total);
        setSummary(sum);
      } catch (err) {
        toast(apiError(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, toast]);

  const pages = Math.max(1, Math.ceil(total / 10));

  return (
    <PortalLayout
      title="Your Projects"
      subtitle="Submit drawings and track your 3D visualisation requests"
      actions={<Link to="/client/new" className="btn btn-primary btn-sm">+ New Project</Link>}
    >
      <div className="summary-row">
        <div className="stat accent"><div className="num">{summary.active}</div><div className="lab">Active</div></div>
        <div className="stat"><div className="num">{summary.completed}</div><div className="lab">Completed</div></div>
        <div className="stat"><div className="num">{summary.total}</div><div className="lab">Total</div></div>
      </div>

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <div className="card card-pad empty">
          <div className="ttl">No projects yet</div>
          <p>Submit your first project to get started with Century Joy.</p>
          <Link to="/client/new" className="btn btn-primary" style={{ marginTop: 16 }}>+ New Project Request</Link>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Reference</th><th>Project</th><th>Submitted</th><th>Status</th><th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/client/projects/${p.id}`)}>
                    <td className="cell-ref">{p.reference_number}</td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{formatDate(p.created_at)}</td>
                    <td><StatusBadge status={p.status} role="client" /></td>
                    <td className="right"><span className="btn btn-ghost btn-sm">View →</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="muted" style={{ fontSize: 13 }}>Page {page} of {pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </PortalLayout>
  );
}
