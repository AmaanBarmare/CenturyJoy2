export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const CATEGORY_LABEL: Record<string, string> = {
  plan_master: 'Master / Site Plan',
  plan_floor: 'Floor Plan',
  elevation: 'Elevation',
  sections: 'Sections',
  rcp_layouts: 'RCP Layouts',
  references: 'References',
};

export const ITERATION_LABEL: Record<string, string> = {
  original: 'Original',
  revision_1: 'Revision 1',
  revision_2: 'Revision 2',
};
