import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './Logo';

/* Shared marketing nav — identical on Landing, Gallery, About, Services so the
   header is consistent everywhere (see DESIGN.md §1). Page links are SPA routes;
   Contact jumps to the landing's contact section. `current` highlights the page. */
const LINKS: { label: string; to: string }[] = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/#contact' },
];

export function SiteNav({ current, light = false }: { current?: string; light?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const renderLink = (l: (typeof LINKS)[number], onClick?: () => void) => {
    const cls = `txt ${current === l.label ? 'cur' : ''}`.trim();
    return <Link key={l.to} className={cls} to={l.to} onClick={onClick}>{l.label}</Link>;
  };

  return (
    <>
      <header className={`nav ${light ? 'nav-light' : ''} ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-in">
          <BrandLogo light={light} height={30} />
          <div className="nav-links">
            {LINKS.map((l) => renderLink(l))}
            <div className="nav-cta">
              <Link to="/login" className="btn btn-red btn-sm">Log in <span className="ar">→</span></Link>
            </div>
            <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
          </div>
        </div>
      </header>

      <div className={`lv2-scrim ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
      <nav className={`lv2-drawer ${menuOpen ? 'open' : ''}`}>
        <button className="x" aria-label="Close menu" onClick={() => setMenuOpen(false)}>✕</button>
        {LINKS.map((l) => renderLink(l, () => setMenuOpen(false)))}
        <Link to="/login" className="btn btn-red" onClick={() => setMenuOpen(false)}>Log in <span className="ar">→</span></Link>
      </nav>
    </>
  );
}
