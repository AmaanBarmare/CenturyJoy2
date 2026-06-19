import { trackerState } from '../lib/status';
import type { ProjectStatus } from '../types';

export function ProgressTracker({ status }: { status: ProjectStatus }) {
  const { steps, caption } = trackerState(status);
  return (
    <div>
      <div className="tracker">
        <div className="line" />
        {steps.map((s, i) => (
          <div key={s.label} className={`step ${s.state}`}>
            <div className="circ">{s.state === 'done' ? '✓' : String(i + 1).padStart(2, '0')}</div>
            <div className={`lbl ${s.state === 'future' ? 'fade' : ''}`}>{s.label}</div>
          </div>
        ))}
      </div>
      {caption && <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{caption}</p>}
    </div>
  );
}
