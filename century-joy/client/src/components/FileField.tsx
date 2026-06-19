import { useRef, useState } from 'react';
import { formatBytes } from '../lib/format';

interface Props {
  label: string;
  accept: string; // e.g. ".dwg,.pdf"
  multiple?: boolean;
  required?: boolean;
  maxMB: number;
  files: File[];
  onChange: (files: File[]) => void;
  hint?: string;
  isImage?: boolean;
}

function extOk(name: string, accept: string): boolean {
  const exts = accept.split(',').map((s) => s.trim().toLowerCase());
  return exts.some((e) => name.toLowerCase().endsWith(e));
}

export function FileField({ label, accept, multiple, required, maxMB, files, onChange, hint, isImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');

  const add = (incoming: FileList | null) => {
    if (!incoming) return;
    setErr('');
    const accepted: File[] = [];
    for (const f of Array.from(incoming)) {
      if (!extOk(f.name, accept)) { setErr(`${f.name}: only ${accept} allowed.`); continue; }
      if (f.size > maxMB * 1024 * 1024) { setErr(`${f.name}: exceeds ${maxMB} MB.`); continue; }
      accepted.push(f);
    }
    if (!accepted.length) return;
    onChange(multiple ? [...files, ...accepted] : [accepted[0]]);
  };

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="field">
      <label>{label} {required && <span style={{ color: 'var(--red)' }}>*</span>}{!required && <span className="faint" style={{ fontWeight: 400 }}> (optional)</span>}</label>
      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
      >
        <div className="dz-title">Drop {multiple ? 'files' : 'a file'} or click to browse</div>
        <div className="dz-sub">{accept.toUpperCase().replace(/\./g, '')} · up to {maxMB} MB each</div>
        <input
          ref={inputRef} type="file" accept={accept} multiple={multiple} hidden
          onChange={(e) => { add(e.target.files); e.target.value = ''; }}
        />
      </div>
      {hint && <div className="hint">{hint}</div>}
      {err && <div className="error">{err}</div>}
      {files.map((f, i) => (
        <div className="filechip" key={`${f.name}-${i}`}>
          {isImage ? <img className="thumb" src={URL.createObjectURL(f)} alt="" /> : null}
          <div style={{ minWidth: 0 }}>
            <div className="fc-name">{f.name}</div>
            <div className="fc-size">{formatBytes(f.size)}</div>
          </div>
          <button type="button" className="fc-x" onClick={() => remove(i)} aria-label="Remove">×</button>
        </div>
      ))}
    </div>
  );
}
