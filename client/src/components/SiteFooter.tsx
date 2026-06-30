import { Link } from 'react-router-dom';
import { BrandLogo } from './Logo';

/* Shared marketing footer — same on every public page (DESIGN.md §1).
   Contact routes to the home page's Get In Touch section via the URL hash;
   ScrollToHash handles the smooth scroll, even when coming from another page. */
const LINKS: { label: string; to: string }[] = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/#contact' },
];

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <BrandLogo light height={28} />
          <nav className="foot-links">
            {LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          </nav>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Century Plyboards (India) Ltd. All rights reserved.</span>
          <div className="foot-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
