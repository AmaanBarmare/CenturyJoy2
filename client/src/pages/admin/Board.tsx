import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';
import type { Board, BoardProject, ProjectStatus } from '../../types';

// Active statuses grouped into production phases (columns).
const COLUMNS: { key: string; label: string; statuses: ProjectStatus[] }[] = [
  { key: 'new', label: 'New', statuses: ['pending', 'accepted'] },
  { key: 'prod', label: 'In Production', statuses: ['in_progress', 'revision_1_in_progress', 'revision_2_in_progress'] },
  { key: 'review', label: 'Awaiting Review', statuses: ['first_draft_submitted', 'revision_1_submitted', 'revision_2_submitted'] },
  { key: 'rev', label: 'Revisions Requested', statuses: ['revision_1_requested', 'revision_2_requested'] },
];

function Card({ p, onOpen }: { p: BoardProject; onOpen: () => void }) {
  return (
    <button className="board-card" onClick={onOpen}>
      <div className="cell-ref">{p.reference_number}</div>
      <div className="bc-title">{p.title}</div>
      <div className="bc-client faint">{p.client_name}</div>
      <div style={{ marginTop: 10 }}><StatusBadge status={p.status} role="studio" /></div>
    </button>
  );
}

export default function AdminBoard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await endpoints.adminBoard()); }
      catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [toast]);

  if (loading) return <PortalLayout title="Production Board"><Loading /></PortalLayout>;
  if (!data) return <PortalLayout title="Production Board"><div className="empty">Could not load the board.</div></PortalLayout>;

  const open = (id: string) => navigate(`/app/projects/${id}`);
  const columns = COLUMNS.map((c) => ({ ...c, items: data.active.filter((p) => c.statuses.includes(p.status)) }));

  return (
    <PortalLayout title="Production Board" subtitle={`${data.active.length} active · ${data.delivery.length} in delivery`}>
      <div className="board">
        {columns.map((c) => (
          <section className="board-col" key={c.key}>
            <header className="board-head"><span>{c.label}</span><span className="board-count">{c.items.length}</span></header>
            <div className="board-list">
              {c.items.length === 0 ? (
                <div className="board-empty">Nothing here</div>
              ) : (
                c.items.map((p) => <Card key={p.id} p={p} onOpen={() => open(p.id)} />)
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>Delivery &amp; closure queue</div>
      {data.delivery.length === 0 ? (
        <div className="card card-pad empty"><div className="ttl">Nothing to deliver</div><p>Completed and closed projects will appear here.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Reference</th><th>Client</th><th>Project</th><th>Submitted</th><th>Status</th><th className="right">Action</th></tr></thead>
            <tbody>
              {data.delivery.map((p) => (
                <tr key={p.id} onClick={() => open(p.id)}>
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
