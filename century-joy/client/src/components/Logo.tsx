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

/**
 * Brand logo lockup (CenturyJoy -05/-06). Use `light` on dark surfaces
 * (the white cut) and the default colour cut on light surfaces.
 */
export function BrandLogo({
  light = false,
  height = 30,
  to = '/',
  className = '',
}: { light?: boolean; height?: number; to?: string; className?: string }) {
  return (
    <Link to={to} className={`brand-logo ${className}`} aria-label="Century Joy home">
      <img src={light ? '/logo-light.png' : '/logo.png'} alt="Century Joy" style={{ height, width: 'auto', display: 'block' }} />
    </Link>
  );
}
