import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { Project, ProjectStatus } from '../../types';

type Tab = 'pending' | 'active' | 'completed' | 'all';
const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending Review' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

const ACTIVE: ProjectStatus[] = ['accepted', 'in_progress', 'first_draft_submitted', 'revision_1_requested', 'revision_1_in_progress', 'revision_1_submitted', 'revision_2_requested', 'revision_2_in_progress', 'revision_2_submitted'];

export default function StudioDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [all, setAll] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await endpoints.studioProjects({ page: 1 });
        setAll(data.projects);
      } catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [toast]);

  const rows = useMemo(() => {
    let r = all;
    if (tab === 'pending') r = r.filter((p) => p.status === 'pending');
    else if (tab === 'active') r = r.filter((p) => ACTIVE.includes(p.status));
    else if (tab === 'completed') r = r.filter((p) => p.status === 'completed' || p.status === 'closed');
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((p) => p.title.toLowerCase().includes(s) || p.reference_number.toLowerCase().includes(s) || (p.client_name ?? '').toLowerCase().includes(s));
    }
    return r;
  }, [all, tab, q]);

  const count = (t: Tab) =>
    t === 'pending' ? all.filter((p) => p.status === 'pending').length
    : t === 'active' ? all.filter((p) => ACTIVE.includes(p.status)).length
    : t === 'completed' ? all.filter((p) => p.status === 'completed' || p.status === 'closed').length
    : all.length;

  return (
    <PortalLayout
      title="Project Queue"
      subtitle="Review submissions, produce renders, deliver to clients"
      actions={<input className="input" style={{ width: 220 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />}
    >
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label} <span className="faint">({count(t.key)})</span>
          </button>
        ))}
      </div>

      {loading ? <Loading /> : rows.length === 0 ? (
        <div className="card card-pad empty"><div className="ttl">Nothing here</div><p>No projects match this view.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Reference</th><th>Client</th><th>Project</th><th>Submitted</th><th>Views</th><th>Status</th><th>Rev.</th><th className="right">Action</th></tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/studio/projects/${p.id}`)}>
                  <td className="cell-ref">{p.reference_number}</td>
                  <td>{p.client_name}{p.company_name ? <div className="faint" style={{ fontSize: 11 }}>{p.company_name}</div> : null}</td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>{formatDate(p.created_at)}</td>
                  <td>{p.number_of_views}</td>
                  <td><StatusBadge status={p.status} role="studio" /></td>
                  <td className="mono">{p.revisions_used}/{p.revisions_allowed}</td>
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
