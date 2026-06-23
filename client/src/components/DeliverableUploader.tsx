import { useState } from 'react';
import { Modal } from './Modal';
import { FileField } from './FileField';
import { endpoints, apiError } from '../lib/api';
import { uploadToSigned } from '../lib/upload';
import { useToast } from '../context/ToastContext';

interface Props {
  projectId: string;
  defaultViews: number;
  onClose: () => void;
  onDone: () => void;
}

export function DeliverableUploader({ projectId, defaultViews, onClose, onDone }: Props) {
  const { toast } = useToast();
  const [slots, setSlots] = useState<File[][]>(() => Array.from({ length: defaultViews }, () => []));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const setSlot = (i: number) => (f: File[]) => setSlots((s) => s.map((v, idx) => (idx === i ? f : v)));
  const addView = () => slots.length < 10 && setSlots((s) => [...s, []]);

  const entries = slots.flatMap((fileList, i) =>
    fileList.map((file) => ({ viewNumber: i + 1, file })),
  );
  const ready = entries.length > 0;

  const submit = async () => {
    setBusy(true);
    setProgress('Preparing upload…');
    try {
      const uploads = await endpoints.presignDeliverables(
        projectId,
        entries.map((e) => ({ viewNumber: e.viewNumber, originalName: e.file.name, sizeBytes: e.file.size })),
      );
      for (let i = 0; i < uploads.length; i++) {
        setProgress(`Uploading ${i + 1} of ${uploads.length}…`);
        await uploadToSigned(uploads[i], entries[i].file);
      }
      setProgress('Finalising…');
      await endpoints.confirmDeliverables(projectId, uploads.map((u) => u.fileId));
      toast('Deliverables uploaded. The client has been notified.', 'success');
      onDone();
    } catch (err) {
      toast(apiError(err), 'error');
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Upload deliverables"
      onClose={() => !busy && onClose()}
      footer={
        <>
          <button className="btn btn-ghost" disabled={busy} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!ready || busy} onClick={submit}>
            {busy ? <><span className="spinner" /> {progress}</> : `Submit ${entries.length} file${entries.length === 1 ? '' : 's'}`}
          </button>
        </>
      }
    >
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        Add the rendered views as .jpg files. All views are submitted together; the project status advances automatically.
      </p>
      {slots.map((f, i) => (
        <FileField
          key={i}
          label={`View ${String(i + 1).padStart(2, '0')}`}
          accept=".jpg,.jpeg"
          multiple
          maxMB={20}
          files={f}
          onChange={setSlot(i)}
          isImage
        />
      ))}
      {slots.length < 10 && (
        <button className="btn btn-outline btn-sm" onClick={addView}>+ Add View</button>
      )}
    </Modal>
  );
}
