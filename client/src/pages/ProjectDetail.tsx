import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortalLayout } from '../components/PortalLayout';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressTracker } from '../components/ProgressTracker';
import { Loading } from '../components/Loading';
import { Modal } from '../components/Modal';
import { DeliverableUploader } from '../components/DeliverableUploader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { endpoints, apiError } from '../lib/api';
import { CATEGORY_LABEL, ITERATION_LABEL, BRIEF_LABEL, PROJECT_TYPE_LABEL, SERVICE_LABEL, formatBytes, formatDate, formatDateTime } from '../lib/format';
import { statusLabel } from '../lib/status';
import { groupChunkedFiles, downloadReassembled } from '../lib/chunk';
import type { ProjectDetail as Detail, ProjectStatus } from '../types';

const BRIEF_KEYS = [
  'brief_design_intent',
  'brief_client_requirements',
  'brief_preferred_style',
  'brief_material_preferences',
  'brief_special_instructions',
] as const;

export default function ProjectDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dl, setDl] = useState<string | null>(null);

  const [revModal, setRevModal] = useState(false);
  const [revNotes, setRevNotes] = useState('');
  const [uploader, setUploader] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [ovModal, setOvModal] = useState(false);
  const [ovStatus, setOvStatus] = useState<ProjectStatus>('pending');
  const [ovReason, setOvReason] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await endpoints.getProject(id));
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PortalLayout title="Project"><Loading /></PortalLayout>;
  if (!data || !user) return <PortalLayout title="Project"><div className="empty">Project not found.</div></PortalLayout>;

  const { project: p, files, deliverables, history, revisions, canRequestRevision } = data;
  const role = user.role;
  const backTo = role === 'client' ? '/client' : role === 'studio' ? '/studio' : '/admin';

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); toast(ok, 'success'); await load(); }
    catch (err) { toast(apiError(err), 'error'); }
    finally { setBusy(false); setRevModal(false); setFlagModal(false); setOvModal(false); }
  };

  // Fetch + re-join a chunked 3D model, then save the original file.
  const reassemble = async (key: string, name: string, parts: { downloadUrl: string }[]) => {
    setDl(key);
    try { await downloadReassembled(name, parts); }
    catch (err) { toast(apiError(err), 'error'); }
    finally { setDl(null); }
  };

  // studio action set
  const studioActions = () => {
    const s = p.status;
    const A: React.ReactNode[] = [];
    if (s === 'pending') A.push(<button key="acc" className="btn btn-primary btn-block" disabled={busy} onClick={() => run(() => endpoints.accept(p.id), 'Project accepted.')}>Accept project</button>);
    if (s === 'accepted') A.push(<button key="beg" className="btn btn-primary btn-block" disabled={busy} onClick={() => run(() => endpoints.studioStatus(p.id, 'in_progress'), 'Work started.')}>Begin work</button>);
    if (s === 'revision_1_requested') A.push(<button key="r1" className="btn btn-primary btn-block" disabled={busy} onClick={() => run(() => endpoints.studioStatus(p.id, 'revision_1_in_progress'), 'Revision 1 started.')}>Begin Revision 1</button>);
    if (s === 'revision_2_requested') A.push(<button key="r2" className="btn btn-primary btn-block" disabled={busy} onClick={() => run(() => endpoints.studioStatus(p.id, 'revision_2_in_progress'), 'Revision 2 started.')}>Begin Revision 2</button>);
    if (s === 'in_progress' || s === 'revision_1_in_progress' || s === 'revision_2_in_progress')
      A.push(<button key="up" className="btn btn-primary btn-block" onClick={() => setUploader(true)}>Upload deliverables</button>);
    if (s === 'first_draft_submitted' || s === 'revision_1_submitted' || s === 'revision_2_submitted')
      A.push(<button key="comp" className="btn btn-primary btn-block" disabled={busy} onClick={() => run(() => endpoints.complete(p.id), 'Project marked complete.')}>Mark as completed</button>);
    if (s === 'completed') A.push(<button key="close" className="btn btn-outline btn-block" disabled={busy} onClick={() => run(() => endpoints.close(p.id), 'Project closed.')}>Close project</button>);
    if (s !== 'closed') A.push(<button key="flag" className="btn btn-danger btn-block" onClick={() => setFlagModal(true)}>Flag an issue</button>);
    return A;
  };

  const ALL_STATUSES: ProjectStatus[] = ['pending','accepted','in_progress','first_draft_submitted','revision_1_requested','revision_1_in_progress','revision_1_submitted','revision_2_requested','revision_2_in_progress','revision_2_submitted','completed','closed'];

  return (
    <PortalLayout
      title={p.title}
      subtitle={`${p.reference_number} · Submitted ${formatDate(p.created_at)}`}
      back={backTo}
    >
      <div className="detail-grid">
        <div className="detail-main">
          {/* Progress */}
          <div className="card card-pad">
            <div className="card-head"><div className="card-title">Progress</div><StatusBadge status={p.status} role={role} /></div>
            <ProgressTracker status={p.status} />
          </div>

          {/* Requirements */}
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 14 }}>Requirements</div>
            <div className="meta-grid">
              <div><div className="meta-k">Views requested</div><div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{p.number_of_views}</div></div>
              {p.project_type && <div><div className="meta-k">Type</div><div style={{ fontWeight: 600 }}>{PROJECT_TYPE_LABEL[p.project_type] ?? p.project_type}</div></div>}
              {role !== 'client' && <div><div className="meta-k">Client</div><div style={{ fontWeight: 600 }}>{p.client_name}{p.company_name ? ` · ${p.company_name}` : ''}</div></div>}
            </div>

            {p.services && p.services.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="meta-k" style={{ marginBottom: 8 }}>Services</div>
                <div className="chips">
                  {p.services.map((s) => <span key={s} className="chip static">{SERVICE_LABEL[s] ?? s}</span>)}
                </div>
              </div>
            )}

            {BRIEF_KEYS.some((k) => p[k]) ? (
              <div className="brief-list">
                {BRIEF_KEYS.filter((k) => p[k]).map((k) => (
                  <div className="brief-item" key={k}>
                    <div className="meta-k">{BRIEF_LABEL[k]}</div>
                    <p style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{p[k]}</p>
                  </div>
                ))}
              </div>
            ) : p.concept_note ? (
              <div style={{ marginTop: 18 }}><div className="meta-k">Concept note</div><p style={{ marginTop: 6 }}>{p.concept_note}</p></div>
            ) : null}
          </div>

          {/* Submitted files */}
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 14 }}>Submitted files</div>
            {files.length === 0 ? <p className="muted">No files.</p> : (
              Object.entries(groupBy(files, (f) => f.category)).map(([cat, list]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div className="meta-k" style={{ marginBottom: 6 }}>{CATEGORY_LABEL[cat] ?? cat}</div>
                  {groupChunkedFiles(list).map((g) => (
                    <div className="filechip" key={g.key}>
                      <div style={{ minWidth: 0 }}>
                        <div className="fc-name">{g.displayName}</div>
                        <div className="fc-size">{formatBytes(g.totalBytes)}{g.isChunked ? ` · ${g.items.length} parts` : ''}</div>
                      </div>
                      {g.isChunked ? (
                        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} disabled={dl === g.key} onClick={() => reassemble(g.key, g.displayName, g.items)}>
                          {dl === g.key ? <><span className="spinner" /> Joining…</> : 'Download'}
                        </button>
                      ) : (
                        <a className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} href={g.items[0].downloadUrl} target="_blank" rel="noreferrer">Download</a>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="card card-pad">
              <div className="card-title" style={{ marginBottom: 14 }}>Deliverables</div>
              {Object.entries(groupBy(deliverables, (d) => d.iteration)).map(([it, list]) => (
                <div key={it} style={{ marginBottom: 18 }}>
                  <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>{ITERATION_LABEL[it] ?? it}</div>
                  <div className="deliverable-grid">
                    {list.sort((a, b) => a.viewNumber - b.viewNumber).map((d) => (
                      <a className="dtile" key={d.id} href={d.downloadUrl} target="_blank" rel="noreferrer">
                        <img src={d.downloadUrl} alt={`View ${d.viewNumber}`} />
                        <div className="meta"><div className="vn">VIEW {String(d.viewNumber).padStart(2, '0')}</div><div className="nm">{d.originalName}</div></div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revisions */}
          {revisions.length > 0 && (
            <div className="card card-pad">
              <div className="card-title" style={{ marginBottom: 14 }}>Revision requests</div>
              {revisions.map((r) => (
                <div key={r.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--line)' }}>
                  <div style={{ fontWeight: 600 }}>Revision {r.revision_number} · <span className="muted" style={{ fontWeight: 400 }}>{formatDate(r.created_at)}</span></div>
                  {r.notes && <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{r.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>Activity</div>
            <div className="timeline">
              {history.map((h) => (
                <div className="tl-item" key={h.id}>
                  <div className="tl-dot" />
                  <div>
                    <div className="tl-main">{statusLabel(h.to_status as ProjectStatus, role)}{h.reason ? <span className="muted"> — {h.reason}</span> : ''}</div>
                    <div className="tl-time">{formatDateTime(h.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side actions */}
        <div className="detail-side">
          {role === 'client' && (
            <div className="card card-pad">
              <div className="card-title" style={{ marginBottom: 10 }}>Revisions</div>
              <p className="muted" style={{ fontSize: 13 }}>{p.revisions_used} of {p.revisions_allowed} revisions used.</p>
              {canRequestRevision ? (
                <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => setRevModal(true)}>Request a revision</button>
              ) : p.revisions_used >= p.revisions_allowed ? (
                <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Maximum revisions reached. The studio team will be in touch via email.</p>
              ) : (
                <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>A revision can be requested once a draft is delivered.</p>
              )}
            </div>
          )}

          {role === 'studio' && p.status !== 'closed' && (
            <div className="card card-pad stack" style={{ gap: 10 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>Studio actions</div>
              {studioActions()}
            </div>
          )}

          {role === 'admin' && (
            <div className="card card-pad stack" style={{ gap: 10 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>Admin controls</div>
              <button className="btn btn-outline btn-block" onClick={() => { setOvStatus(p.status); setOvModal(true); }}>Override status</button>
              <button className="btn btn-danger btn-block" disabled={busy} onClick={() => { if (confirm('Soft-delete this project? It will be hidden from all views but retained for audit.')) run(() => endpoints.adminDelete(p.id).then(() => navigate('/admin')), 'Project deleted.'); }}>Delete project</button>
            </div>
          )}

          <div className="card card-pad">
            <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Follow-up</div>
            <p className="muted" style={{ fontSize: 13 }}>All follow-up communication happens by email. You'll receive a notification at each milestone.</p>
          </div>
        </div>
      </div>

      {/* Revision modal */}
      {revModal && (
        <Modal title="Request a revision" onClose={() => !busy && setRevModal(false)}
          footer={<><button className="btn btn-ghost" disabled={busy} onClick={() => setRevModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy} onClick={() => run(() => endpoints.requestRevision(p.id, revNotes), 'Revision requested. The studio team has been notified.')}>{busy ? <span className="spinner" /> : 'Submit request'}</button></>}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Add optional notes for the studio team. They'll follow up by email.</p>
          <div className="field">
            <label>Revision notes <span className="counter">{revNotes.length}/500</span></label>
            <textarea className="textarea" maxLength={500} value={revNotes} onChange={(e) => setRevNotes(e.target.value)} placeholder="What would you like changed?" />
          </div>
        </Modal>
      )}

      {/* Flag modal */}
      {flagModal && (
        <Modal title="Flag an issue to admin" onClose={() => !busy && setFlagModal(false)}
          footer={<><button className="btn btn-ghost" disabled={busy} onClick={() => setFlagModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy || !flagReason.trim()} onClick={() => run(() => endpoints.flag(p.id, flagReason), 'Issue flagged to admin.')}>{busy ? <span className="spinner" /> : 'Send flag'}</button></>}>
          <div className="field">
            <label>What's the issue?</label>
            <textarea className="textarea" maxLength={500} value={flagReason} onChange={(e) => setFlagReason(e.target.value)} placeholder="e.g. The submitted DWG is corrupt and cannot be opened." />
          </div>
        </Modal>
      )}

      {/* Admin override modal */}
      {ovModal && (
        <Modal title="Override status" onClose={() => !busy && setOvModal(false)}
          footer={<><button className="btn btn-ghost" disabled={busy} onClick={() => setOvModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy || !ovReason.trim()} onClick={() => run(() => endpoints.adminOverride(p.id, ovStatus, ovReason), 'Status overridden.')}>{busy ? <span className="spinner" /> : 'Apply override'}</button></>}>
          <div className="field">
            <label>New status</label>
            <select className="select" value={ovStatus} onChange={(e) => setOvStatus(e.target.value as ProjectStatus)}>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s, 'studio')}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Reason (required)</label>
            <textarea className="textarea" maxLength={500} value={ovReason} onChange={(e) => setOvReason(e.target.value)} placeholder="Why is this override necessary?" />
          </div>
        </Modal>
      )}

      {uploader && (
        <DeliverableUploader projectId={p.id} defaultViews={p.number_of_views} onClose={() => setUploader(false)} onDone={() => { setUploader(false); load(); }} />
      )}
    </PortalLayout>
  );
}

function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
