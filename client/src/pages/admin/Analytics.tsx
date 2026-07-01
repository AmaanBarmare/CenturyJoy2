import { useEffect, useState } from 'react';
import { PortalLayout } from '../../components/PortalLayout';
import { Loading } from '../../components/Loading';
import { endpoints, apiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { PROJECT_TYPE_LABEL, SERVICE_LABEL } from '../../lib/format';
import { statusLabel, statusColor } from '../../lib/status';
import type { Analytics, MonthPoint, ProjectStatus } from '../../types';

/** Vertical bar chart for a 6-month series. Values are always shown as text. */
function MonthBars({ title, data, accent }: { title: string; data: MonthPoint[]; accent?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const empty = data.every((d) => d.count === 0);
  return (
    <figure className="chart-card" aria-label={`${title}: ${data.map((d) => `${d.label} ${d.count}`).join(', ')}`}>
      <figcaption className="card-title">{title}</figcaption>
      {empty ? (
        <div className="chart-empty">No data in this period.</div>
      ) : (
        <div className="bars" role="img" aria-hidden="true">
          {data.map((d) => (
            <div className="bar-col" key={d.key}>
              <div className="bar-val">{d.count}</div>
              <div className="bar-track">
                <div className={`bar-fill ${accent ? 'accent' : ''}`} style={{ height: `${(d.count / max) * 100}%` }} />
              </div>
              <div className="bar-x">{d.label}</div>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}

/** Horizontal breakdown bars for categorical counts. */
function Breakdown({ title, rows }: { title: string; rows: { key: string; label: string; count: number; color?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <figure className="chart-card" aria-label={`${title}: ${rows.map((r) => `${r.label} ${r.count}`).join(', ')}`}>
      <figcaption className="card-title">{title}</figcaption>
      {rows.length === 0 ? (
        <div className="chart-empty">No data yet.</div>
      ) : (
        <div className="hbars">
          {rows.map((r) => (
            <div className="hbar" key={r.key}>
              <div className="hbar-label">{r.label}</div>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: `${(r.count / max) * 100}%`, background: r.color ?? 'var(--red)' }} />
              </div>
              <div className="hbar-val mono">{r.count}</div>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}

const STATUS_DOT: Record<string, string> = {
  amber: 'var(--st-amber-dot)', blue: 'var(--st-blue-dot)', violet: 'var(--st-violet-dot)',
  emerald: 'var(--st-emerald-dot)', green: 'var(--st-green-dot)', slate: 'var(--st-slate-dot)',
};

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await endpoints.adminAnalytics()); }
      catch (err) { toast(apiError(err), 'error'); }
      finally { setLoading(false); }
    })();
  }, [toast]);

  if (loading) return <PortalLayout title="Analytics"><Loading /></PortalLayout>;
  if (!data) return <PortalLayout title="Analytics"><div className="empty">Could not load analytics.</div></PortalLayout>;

  const t = data.totals;
  const statusRows = Object.entries(data.byStatus)
    .sort((a, b) => b[1] - a[1])
    .map(([k, count]) => ({ key: k, label: statusLabel(k as ProjectStatus, 'studio'), count, color: STATUS_DOT[statusColor(k as ProjectStatus)] }));
  const typeRows = Object.entries(data.byType)
    .sort((a, b) => b[1] - a[1])
    .map(([k, count]) => ({ key: k, label: PROJECT_TYPE_LABEL[k] ?? k, count }));
  const serviceRows = Object.entries(data.services)
    .sort((a, b) => b[1] - a[1])
    .map(([k, count]) => ({ key: k, label: SERVICE_LABEL[k] ?? k, count }));

  return (
    <PortalLayout title="Analytics" subtitle="Studio performance and demand at a glance">
      <div className="kpi-grid">
        <div className="stat"><div className="num">{t.projects}</div><div className="lab">Total projects</div></div>
        <div className="stat accent"><div className="num">{t.active}</div><div className="lab">Active</div></div>
        <div className="stat"><div className="num">{t.completed}</div><div className="lab">Completed</div></div>
        <div className="stat"><div className="num">{t.clients}</div><div className="lab">Clients</div></div>
        <div className="stat"><div className="num">{data.avgCompletionDays ?? '—'}</div><div className="lab">Avg days to complete</div></div>
        <div className="stat"><div className="num">{data.avgRevisions}</div><div className="lab">Avg revisions</div></div>
      </div>

      <div className="chart-grid">
        <MonthBars title="Projects received" data={data.receivedByMonth} accent />
        <MonthBars title="New client registrations" data={data.registrationsByMonth} />
        <Breakdown title="By status" rows={statusRows} />
        <Breakdown title="By project type" rows={typeRows} />
        <Breakdown title="Services requested" rows={serviceRows} />
      </div>
    </PortalLayout>
  );
}
