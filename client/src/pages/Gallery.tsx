import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/Logo';
import { ChatWidget } from '../components/ChatWidget';

/* ── nav (links back to the landing sections) ──────────────── */
const NAV = [
  { id: 'about', label: 'About' },
  { id: 'why', label: 'Why Us' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

type Cat = 'Interiors' | 'Exteriors' | 'Walkthroughs';
type Item = { src: string; title: string; cat: Cat; type: 'image' | 'video'; poster?: string };

/* ── gallery content (optimised assets in /public/gallery) ─── */
const ITEMS: Item[] = [
  { src: '/videos/anantham.mp4', poster: '/videos/anantham-poster.webp', title: 'Visualisation Showreel', cat: 'Walkthroughs', type: 'video' },

  { src: '/gallery/interiors/interior-04.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-11.webp', title: 'Kitchen & Dining', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-19.webp', title: 'Master Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-03.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-06.webp', title: 'Indoor Games Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-22.webp', title: 'Bathroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-01.webp', title: 'Dining Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-16.webp', title: 'Rooftop Bar', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-09.webp', title: 'Powder Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-14.webp', title: 'Sky Lounge', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-08.webp', title: 'Kids Play Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-18.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-13.webp', title: 'Modular Kitchen', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-24.webp', title: 'Master Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-02.webp', title: 'Living & Dining', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-26.webp', title: 'Landscaped Atrium', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-21.webp', title: 'Home Bar', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-10.webp', title: 'Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-07.webp', title: 'Pool Courtyard', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-25.webp', title: 'Entrance Lobby', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-12.webp', title: 'Lounge', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-17.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-23.webp', title: 'Kitchen', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-15.webp', title: 'Display Cabinetry', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-20.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-27.webp', title: 'Dining Room', cat: 'Interiors', type: 'image' },

  { src: '/gallery/exteriors/exterior-07.webp', title: 'Residential Building', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-03.webp', title: 'Commercial Complex', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-05.webp', title: 'Commercial Facade · Night', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-02.webp', title: 'Commercial Building', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-06.webp', title: 'Commercial Facade · Night', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-04.webp', title: 'Commercial Building', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-01.webp', title: 'Industrial Facility', cat: 'Exteriors', type: 'image' },

  // ── Anantham 3D deck (extracted from PDF, deduped) ──
  { src: '/gallery/interiors/interior-28.webp', title: 'Foyer', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-29.webp', title: 'Living & Dining', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-30.webp', title: 'Staircase Hall', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-31.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-32.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-33.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-34.webp', title: 'Home Bar', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-35.webp', title: 'Lounge', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-36.webp', title: 'Dining Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-37.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-38.webp', title: 'Master Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-39.webp', title: 'Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-40.webp', title: 'Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-41.webp', title: 'Dining Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-42.webp', title: 'Dining Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-43.webp', title: 'Master Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-44.webp', title: 'Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-45.webp', title: 'Master Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-46.webp', title: 'Modular Kitchen', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-47.webp', title: 'Kitchen', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-48.webp', title: 'Master Bedroom', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-49.webp', title: 'Living Room', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-50.webp', title: 'Garage', cat: 'Interiors', type: 'image' },
  { src: '/gallery/interiors/interior-51.webp', title: 'Master Bedroom · Sunset', cat: 'Interiors', type: 'image' },
  { src: '/gallery/exteriors/exterior-08.webp', title: 'Rooftop Pool', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-09.webp', title: 'Rooftop Terrace', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-10.webp', title: 'Rooftop Pool', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-11.webp', title: 'Rooftop Deck', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-12.webp', title: 'Rooftop Lounge', cat: 'Exteriors', type: 'image' },
  { src: '/gallery/exteriors/exterior-13.webp', title: 'Residential Tower · Dusk', cat: 'Exteriors', type: 'image' },
];

const FILTERS = ['All', 'Interiors', 'Exteriors', 'Walkthroughs'] as const;
type Filter = (typeof FILTERS)[number];

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}

export default function Gallery() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('All');
  const [scrolled, setScrolled] = useState(false);
  const [lb, setLb] = useState<number | null>(null); // index into `shown`

  const shown = useMemo(
    () => (filter === 'All' ? ITEMS : ITEMS.filter((i) => i.cat === filter)),
    [filter],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // reveal-on-scroll for the grid cards
  useEffect(() => {
    const reveal = () => {
      const h = window.innerHeight * 0.92;
      document.querySelectorAll('.gp .rv:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < h) el.classList.add('in');
      });
    };
    reveal();
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
    return () => {
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
    };
  }, [shown]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || lb !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, lb]);

  const close = () => setLb(null);
  const step = (d: number) => setLb((i) => (i === null ? i : (i + d + shown.length) % shown.length));

  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lb, shown.length]);

  const active = lb !== null ? shown[lb] : null;

  return (
    <div className="lv2 gp">
      {/* NAV */}
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-in">
          <BrandLogo height={30} />
          <div className="nav-links">
            {NAV.map((n) => <a key={n.id} className="txt" href={`/#${n.id}`}>{n.label}</a>)}
            <a className="txt gp-current" href="/gallery">Gallery</a>
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
        {NAV.map((n) => <a key={n.id} href={`/#${n.id}`} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
        <a href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
        <Link to="/login" className="btn btn-red" onClick={() => setMenuOpen(false)}>Log in <span className="ar">→</span></Link>
      </nav>

      {/* HERO */}
      <section className="sec gp-hero">
        <div className="wrap">
          <div className="shead center rv">
            <span className="eyebrow">Gallery</span>
            <h1>A Window Into <span className="red">Our Work</span></h1>
            <p className="lead">A selection of photorealistic interior and exterior visualisations crafted for architects and interior designers, from concept to camera-ready render.</p>
          </div>

          <div className="gp-filters rv" role="tablist" aria-label="Filter gallery">
            {FILTERS.map((f) => {
              const n = f === 'All' ? ITEMS.length : ITEMS.filter((i) => i.cat === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  className={`gp-filter ${filter === f ? 'on' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}<span className="gp-count">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="sec gp-gridsec">
        <div className="wrap">
          <div className="gp-grid">
            {shown.map((it, i) => (
              <button
                key={it.src}
                type="button"
                className="gp-card rv"
                onClick={() => setLb(i)}
                aria-label={`View ${it.title}`}
              >
                {/* grid loads a small thumbnail; the lightbox loads the full-res asset */}
                {it.type === 'video'
                  ? <img src={it.poster} alt={it.title} loading="lazy" />
                  : <img src={it.src.replace(/\/([^/]+)$/, '/thumb/$1')} alt={it.title} loading="lazy" />}
                <span className="gp-chip">{it.cat === 'Walkthroughs' ? 'Walkthrough' : it.cat.replace(/s$/, '')}</span>
                {it.type === 'video' && <span className="gp-play"><PlayIcon /></span>}
                <span className="gp-cap"><span className="t">{it.title}</span></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap f-in">
          <BrandLogo light height={28} />
          <span>© {new Date().getFullYear()} Century Plyboards (India) Ltd. All rights reserved.</span>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {active && (
        <div className="gp-lb" onClick={close}>
          <button className="gp-lb-x" aria-label="Close" onClick={close}>✕</button>
          <button className="gp-lb-nav prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
          </button>
          <div className="gp-lb-stage" onClick={(e) => e.stopPropagation()}>
            {active.type === 'video'
              ? <video src={active.src} poster={active.poster} controls autoPlay playsInline />
              : <img src={active.src} alt={active.title} />}
            <div className="gp-lb-cap">
              <span className="t">{active.title}</span>
              <span className="m">{active.cat === 'Walkthroughs' ? 'Walkthrough' : active.cat.replace(/s$/, '')} · {(lb ?? 0) + 1} / {shown.length}</span>
            </div>
          </div>
          <button className="gp-lb-nav next" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>
      )}

      <ChatWidget />
    </div>
  );
}
