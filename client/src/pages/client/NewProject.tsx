import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { FileField } from '../../components/FileField';
import { Modal } from '../../components/Modal';
import { endpoints, apiError } from '../../lib/api';
import { uploadToSigned } from '../../lib/upload';
import { expandForUpload, type UploadUnit } from '../../lib/chunk';
import { useToast } from '../../context/ToastContext';
import { SERVICE_LABEL, PROJECT_TYPE_LABEL } from '../../lib/format';
import type { FileCategory, ProjectType, ServiceType } from '../../types';

type FileMap = Record<FileCategory, File[]>;
const EMPTY: FileMap = { plan_master: [], plan_floor: [], elevation: [], sections: [], rcp_layouts: [], models_3d: [], references: [] };
const DWG_PDF = '.dwg,.pdf';

const PROJECT_TYPES: ProjectType[] = ['residential', 'commercial', 'hospitality', 'retail', 'other'];
const SERVICES: ServiceType[] = ['interior', 'exterior', 'material_visualisation', 'multiple_views'];

export default function NewProject() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [services, setServices] = useState<ServiceType[]>([]);
  const [views, setViews] = useState(3);

  const [designIntent, setDesignIntent] = useState('');
  const [clientRequirements, setClientRequirements] = useState('');
  const [preferredStyle, setPreferredStyle] = useState('');
  const [materialPreferences, setMaterialPreferences] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [files, setFiles] = useState<FileMap>(EMPTY);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const set = (cat: FileCategory) => (f: File[]) => setFiles((m) => ({ ...m, [cat]: f }));
  const toggleService = (s: ServiceType) =>
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const mandatoryOk =
    title.trim().length > 0 &&
    projectType !== '' &&
    services.length > 0 &&
    designIntent.trim().length > 0 &&
    files.plan_master.length === 1 &&
    files.plan_floor.length > 0 &&
    files.elevation.length > 0 &&
    files.rcp_layouts.length > 0;

  const allFiles: { category: FileCategory; file: File }[] = (Object.keys(files) as FileCategory[])
    .flatMap((cat) => files[cat].map((file) => ({ category: cat, file })));

  // Expand into upload units — large 3D models split into __partIofN chunks.
  const uploadUnits: UploadUnit[] = useMemo(
    () => allFiles.flatMap(({ category, file }) => expandForUpload(category, file)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files],
  );
  const splitCount = uploadUnits.length - allFiles.length;

  const submit = async () => {
    setBusy(true);
    setProgress('Creating project…');
    try {
      const { project, uploads } = await endpoints.createProject({
        title: title.trim(),
        projectType: projectType as ProjectType,
        services,
        numberOfViews: views,
        designIntent: designIntent.trim(),
        clientRequirements: clientRequirements.trim(),
        preferredStyle: preferredStyle.trim(),
        materialPreferences: materialPreferences.trim(),
        specialInstructions: specialInstructions.trim(),
        files: uploadUnits.map((u) => ({ category: u.category, originalName: u.originalName, sizeBytes: u.sizeBytes })),
      });

      // uploads come back in the same order as the units we sent
      for (let i = 0; i < uploads.length; i++) {
        setProgress(`Uploading file ${i + 1} of ${uploads.length}…`);
        await uploadToSigned(uploads[i], uploadUnits[i].blob);
        await endpoints.confirmUpload(uploads[i].fileId);
      }

      setProgress('Notifying the studio team…');
      await endpoints.submitProject(project.id);

      toast(`Project ${project.reference_number} submitted.`, 'success');
      navigate(`/client/projects/${project.id}`);
    } catch (err) {
      toast(apiError(err), 'error');
      setBusy(false);
      setConfirm(false);
    }
  };

  const req = <span style={{ color: 'var(--red)' }}>*</span>;

  return (
    <PortalLayout title="New Project Request" subtitle="Tell us about the project, then submit your drawings" back="/client">
      <div className="form-flow">
        {/* 1 — Project details */}
        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 18 }}>Project details</div>

          <div className="field">
            <label>Project Title {req}<span className="counter">{title.length}/100</span></label>
            <input className="input" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mehta Residence — Living & Dining" />
          </div>

          <div className="field">
            <label>Project Type {req}</label>
            <div className="chips" role="radiogroup" aria-label="Project type">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={projectType === t}
                  className={`chip ${projectType === t ? 'on' : ''}`}
                  onClick={() => setProjectType(t)}
                >
                  {PROJECT_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Services Required {req}<span className="hint" style={{ float: 'right', marginTop: 0 }}>Select one or more</span></label>
            <div className="chips" role="group" aria-label="Services required">
              {SERVICES.map((s) => {
                const on = services.includes(s);
                return (
                  <button key={s} type="button" aria-pressed={on} className={`chip ${on ? 'on' : ''}`} onClick={() => toggleService(s)}>
                    <span className="chip-tick" aria-hidden="true">{on ? '✓' : '+'}</span>
                    {SERVICE_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Number of Rendered Views {req}</label>
            <select className="select" value={views} onChange={(e) => setViews(Number(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} view{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>

        {/* 2 — Design brief */}
        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 4 }}>Design brief</div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Describe the vision. Only design intent is required — the more you share, the closer the first draft.</p>

          <div className="field">
            <label>Design Intent {req}<span className="counter">{designIntent.length}/2000</span></label>
            <textarea className="textarea" maxLength={2000} value={designIntent} onChange={(e) => setDesignIntent(e.target.value)} placeholder="The look, mood and intent you're after." />
          </div>

          <details className="disclose">
            <summary>Add more to your brief <span className="faint" style={{ fontWeight: 400 }}>(optional)</span></summary>
            <div className="disclose-body">
              <div className="field">
                <label>Client Requirements<span className="counter">{clientRequirements.length}/2000</span></label>
                <textarea className="textarea" maxLength={2000} value={clientRequirements} onChange={(e) => setClientRequirements(e.target.value)} placeholder="Functional needs, must-haves, constraints." />
              </div>
              <div className="field">
                <label>Preferred Style<span className="counter">{preferredStyle.length}/2000</span></label>
                <textarea className="textarea" maxLength={2000} value={preferredStyle} onChange={(e) => setPreferredStyle(e.target.value)} placeholder="e.g. warm contemporary, minimal, art-deco." />
              </div>
              <div className="field">
                <label>Material Preferences<span className="counter">{materialPreferences.length}/2000</span></label>
                <textarea className="textarea" maxLength={2000} value={materialPreferences} onChange={(e) => setMaterialPreferences(e.target.value)} placeholder="Finishes, timbers, stones, palettes to feature or avoid." />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Special Instructions<span className="counter">{specialInstructions.length}/2000</span></label>
                <textarea className="textarea" maxLength={2000} value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Anything else the studio should know." />
              </div>
            </div>
          </details>
        </div>

        {/* 3 — Drawings & files */}
        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 18 }}>Drawings &amp; files</div>

          <FileField label="Master / Site Plan" accept={DWG_PDF} required maxMB={100} files={files.plan_master} onChange={set('plan_master')} hint="A single .dwg or .pdf file." />
          <FileField label="Floor Plan" accept={DWG_PDF} required multiple maxMB={100} files={files.plan_floor} onChange={set('plan_floor')} />
          <FileField label="Elevation" accept={DWG_PDF} required multiple maxMB={100} files={files.elevation} onChange={set('elevation')} />
          <FileField label="Sections" accept={DWG_PDF} multiple maxMB={100} files={files.sections} onChange={set('sections')} />
          <FileField label="RCP Layouts" accept={DWG_PDF} required multiple maxMB={100} files={files.rcp_layouts} onChange={set('rcp_layouts')} />
          <FileField label="3D Models" accept=".skp,.max" multiple maxMB={500} files={files.models_3d} onChange={set('models_3d')} hint="SketchUp (.skp) or 3ds Max (.max). Large files are split automatically for upload." />
          <FileField label="References" accept=".jpg,.jpeg,.png" multiple maxMB={10} files={files.references} onChange={set('references')} isImage hint="Mood or reference images (.jpg / .png)." />

          <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={!mandatoryOk} onClick={() => setConfirm(true)}>
            Review &amp; Submit
          </button>
          {!mandatoryOk && <p className="hint" style={{ marginTop: 10, textAlign: 'center' }}>Complete all required fields (*) to continue.</p>}
        </div>
      </div>

      {confirm && (
        <Modal
          title="Confirm submission"
          onClose={() => !busy && setConfirm(false)}
          footer={
            <>
              <button className="btn btn-ghost" disabled={busy} onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy} onClick={submit}>
                {busy ? <><span className="spinner" /> {progress}</> : 'Confirm & submit'}
              </button>
            </>
          }
        >
          <p style={{ marginBottom: 14 }}>Please review before submitting. Once submitted, the studio team is notified by email.</p>
          <table className="tbl summary-tbl" style={{ fontSize: 13 }}>
            <tbody>
              <tr><td style={{ fontWeight: 600 }}>Title</td><td>{title}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Type</td><td>{projectType ? PROJECT_TYPE_LABEL[projectType] : '—'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Services</td><td>{services.map((s) => SERVICE_LABEL[s]).join(', ') || '—'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Views requested</td><td>{views}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Master / Site Plan</td><td>{files.plan_master.length} file</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Floor Plans</td><td>{files.plan_floor.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Elevations</td><td>{files.elevation.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Sections</td><td>{files.sections.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>RCP Layouts</td><td>{files.rcp_layouts.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>3D Models</td><td>{files.models_3d.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>References</td><td>{files.references.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Files to upload</td><td>{uploadUnits.length}{splitCount > 0 ? ` (incl. ${splitCount} split part${splitCount > 1 ? 's' : ''})` : ''}</td></tr>
            </tbody>
          </table>
        </Modal>
      )}
    </PortalLayout>
  );
}
