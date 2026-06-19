import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../components/PortalLayout';
import { FileField } from '../../components/FileField';
import { Modal } from '../../components/Modal';
import { endpoints, apiError } from '../../lib/api';
import { uploadToSigned } from '../../lib/upload';
import { useToast } from '../../context/ToastContext';
import type { FileCategory } from '../../types';

type FileMap = Record<FileCategory, File[]>;
const EMPTY: FileMap = { plan_master: [], plan_floor: [], elevation: [], sections: [], rcp_layouts: [], references: [] };
const DWG_PDF = '.dwg,.pdf';

export default function NewProject() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [views, setViews] = useState(3);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<FileMap>(EMPTY);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const set = (cat: FileCategory) => (f: File[]) => setFiles((m) => ({ ...m, [cat]: f }));

  const mandatoryOk =
    title.trim().length > 0 &&
    note.trim().length > 0 &&
    files.plan_master.length === 1 &&
    files.plan_floor.length > 0 &&
    files.elevation.length > 0 &&
    files.rcp_layouts.length > 0;

  const allFiles: { category: FileCategory; file: File }[] = (Object.keys(files) as FileCategory[])
    .flatMap((cat) => files[cat].map((file) => ({ category: cat, file })));

  const submit = async () => {
    setBusy(true);
    setProgress('Creating project…');
    try {
      const { project, uploads } = await endpoints.createProject({
        title: title.trim(),
        conceptNote: note.trim(),
        numberOfViews: views,
        files: allFiles.map((f) => ({ category: f.category, originalName: f.file.name, sizeBytes: f.file.size })),
      });

      // uploads come back in the same order as the files we sent
      for (let i = 0; i < uploads.length; i++) {
        setProgress(`Uploading file ${i + 1} of ${uploads.length}…`);
        await uploadToSigned(uploads[i], allFiles[i].file);
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

  return (
    <PortalLayout title="New Project Request" subtitle="Submit your drawings and visualisation requirements" back="/client">
      <div className="card card-pad" style={{ maxWidth: 760 }}>
        <div className="field">
          <label>Project Title <span style={{ color: 'var(--red)' }}>*</span>
            <span className="counter">{title.length}/100</span>
          </label>
          <input className="input" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mehta Residence — Living & Dining" />
        </div>

        <FileField label="Master / Site Plan" accept={DWG_PDF} required maxMB={100} files={files.plan_master} onChange={set('plan_master')} hint="A single .dwg or .pdf file." />
        <FileField label="Floor Plan" accept={DWG_PDF} required multiple maxMB={100} files={files.plan_floor} onChange={set('plan_floor')} />
        <FileField label="Elevation" accept={DWG_PDF} required multiple maxMB={100} files={files.elevation} onChange={set('elevation')} />
        <FileField label="Sections" accept={DWG_PDF} multiple maxMB={100} files={files.sections} onChange={set('sections')} />
        <FileField label="RCP Layouts" accept={DWG_PDF} required multiple maxMB={100} files={files.rcp_layouts} onChange={set('rcp_layouts')} />

        <div className="field">
          <label>Number of Rendered Views <span style={{ color: 'var(--red)' }}>*</span></label>
          <select className="select" value={views} onChange={(e) => setViews(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} view{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <FileField label="References" accept=".jpg,.jpeg" multiple maxMB={10} files={files.references} onChange={set('references')} isImage hint="Mood or reference images (.jpg)." />

        <div className="field">
          <label>Client Concept Note <span style={{ color: 'var(--red)' }}>*</span>
            <span className="counter">{note.length}/250</span>
          </label>
          <textarea className="textarea" maxLength={250} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the look, mood and intent you're after." />
        </div>

        <button className="btn btn-primary" disabled={!mandatoryOk} onClick={() => setConfirm(true)}>
          Review & Submit
        </button>
        {!mandatoryOk && <p className="hint" style={{ marginTop: 10 }}>Complete all required fields (*) to continue.</p>}
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
          <table className="tbl" style={{ fontSize: 13 }}>
            <tbody>
              <tr><td style={{ fontWeight: 600 }}>Title</td><td>{title}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Views requested</td><td>{views}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Master / Site Plan</td><td>{files.plan_master.length} file</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Floor Plans</td><td>{files.plan_floor.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Elevations</td><td>{files.elevation.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Sections</td><td>{files.sections.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>RCP Layouts</td><td>{files.rcp_layouts.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>References</td><td>{files.references.length}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Total files</td><td>{allFiles.length}</td></tr>
            </tbody>
          </table>
        </Modal>
      )}
    </PortalLayout>
  );
}
