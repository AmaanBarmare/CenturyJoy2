import { useEffect, useState } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { Loading } from '../../components/Loading';
import { api, endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../lib/format';
import type { AuditEntry } from '../../types';

function actionLabel(a: string) {
  return a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AuditLog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const d = await endpoints.adminAudit({ page }); setEntries(d.entries); setTotal(d.total); }
      catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [page, toast]);

  const exportCsv = async () => {
    try {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const res = await api.get('/admin/audit-log/export', { params: { from, to }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'century-joy-audit-log.csv'; a.click();
      URL.revokeObjectURL(url);
      toast('Audit log exported.', 'success');
    } catch (err) { toast(apiError(err), 'error'); }
  };

  const pages = Math.max(1, Math.ceil(total / 50));

  return (
    <PortalLayout
      title="Audit Log"
      subtitle="Every significant platform action, retained for 12 months"
      actions={<button className="btn btn-outline btn-sm" onClick={exportCsv}>Export CSV (12 mo)</button>}
    >
      {loading ? <Loading /> : entries.length === 0 ? (
        <div className="card card-pad empty"><div className="ttl">No activity yet</div></div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>When</th><th>User</th><th>Role</th><th>Action</th><th>Entity</th><th>IP</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} style={{ cursor: 'default' }}>
                    <td className="muted">{formatDateTime(e.created_at)}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{e.user_email ?? '—'}</td>
                    <td><span className="faint" style={{ textTransform: 'capitalize' }}>{e.user_role ?? '—'}</span></td>
                    <td style={{ fontWeight: 600 }}>{actionLabel(e.action)}</td>
                    <td className="muted">{e.entity_type ?? '—'}</td>
                    <td className="mono faint" style={{ fontSize: 11 }}>{e.ip_address ?? '—'}</td>
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
