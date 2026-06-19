import { statusColor, statusLabel } from '../lib/status';
import type { ProjectStatus, Role } from '../types';

export function StatusBadge({ status, role }: { status: ProjectStatus; role: Role }) {
  return (
    <span className={`badge ${statusColor(status)}`}>
      <span className="dot" />
      {statusLabel(status, role)}
    </span>
  );
}
