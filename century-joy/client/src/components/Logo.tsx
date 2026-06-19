import { Link } from 'react-router-dom';

/** Text wordmark that adapts to any background: "Century" red, "Joy" currentColor. */
export function Wordmark({ to = '/', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`wordmark ${className}`} aria-label="Century Joy home">
      <span className="wm-1">Century</span>
      <span className="wm-2">Joy</span>
    </Link>
  );
}

/** Full PNG lockup (star + CENTURY Joy). Best on light backgrounds. */
export function LogoImg({ height = 64 }: { height?: number }) {
  return <img src="/CenturyJoy.png" alt="Century Joy" style={{ height, width: 'auto' }} />;
}
