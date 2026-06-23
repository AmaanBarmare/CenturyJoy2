export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="page-loading">
      <span className="spinner" style={{ marginRight: 10 }} /> {label}
    </div>
  );
}

export function FullScreenLoading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text-dim)' }}>
      <span className="spinner" />
    </div>
  );
}
