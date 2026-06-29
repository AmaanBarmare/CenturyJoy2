import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/Logo';
import { ChatWidget } from '../components/ChatWidget';
import { SOCIALS } from '../components/Socials';

/* ── helpers & content ─────────────────────────────────── */
const IMG = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const REQUEST_ACCESS = 'mailto:3DServices@centuryply.com?subject=Century%20Joy%20access%20request';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'why', label: 'Why Us' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'insights', label: 'Insights' },
  { id: 'contact', label: 'Contact' },
];

const MARQUEE = ['Architects', 'Interior Designers', 'Design Influencers', 'Photorealistic Renders', 'Virtual Walkthroughs', 'Material Visualisation'];

const HERO_SHOTS = [
  { id: 'photo-1564078516393-cf04bd966897', cap: 'Residential · Living Room' },
  { id: 'photo-1749930206000-179d0b85aa7e', cap: 'Luxury Interior' },
  { id: 'photo-1599696848652-f0ff23bc911f', cap: 'Material & Finish Study' },
  { id: 'photo-1606744824163-985d376605aa', cap: 'Presentation Visual' },
];

const SERVICES = [
  { n: '01', tag: 'Interior', img: 'photo-1613545325278-f24b0cae1224', title: 'Interior Rendering', body: 'Transform interior concepts into realistic visual experiences that let clients feel a space before it exists.', short: 'Photorealistic interior spaces with precise material and lighting accuracy.', chips: ['Living spaces', 'Bedrooms', 'Kitchens', 'Luxury interiors'] },
  { n: '02', tag: 'Exterior', img: 'photo-1536501483244-925da0b87089', title: 'Exterior Rendering', body: 'Present architectural concepts with realistic surroundings, materials and finishes.', short: 'Complete architectural visualisations shown in context and surroundings.', chips: ['Residential', 'Commercial', 'Facade studies'] },
  { n: '03', tag: 'Material', img: 'photo-1581783748410-2c5377ad72ee', title: 'Material & Finish Visualisation', body: 'Help clients understand the impact of colours, textures and surface finishes, rendered true to life.', short: 'True-to-life colour, texture and finish studies for confident choices.', chips: ['Colours', 'Textures', 'Finishes', 'Combinations'] },
  { n: '04', tag: 'Presentation', img: 'photo-1606744824163-985d376605aa', title: 'Presentation Visuals', body: 'Professional-quality visuals crafted to win the room, for meetings, proposals and presentations.', short: 'Compelling visual narratives crafted to win meetings and pitches.', chips: ['Client meetings', 'Proposals', 'Presentations'] },
];

const WHY = [
  { ic: 'spark', t: 'Photorealistic Quality', p: 'A dedicated studio team turns your brief into visuals detailed enough that clients mistake them for photographs.' },
  { ic: 'bolt', t: 'Built for Speed', p: 'Most first drafts land within 48 hours, so a tight deadline never costs you the room.' },
  { ic: 'revise', t: 'Two Free Revisions', p: 'Every project includes two revision rounds at no extra cost, tracked on your dashboard.' },
  { ic: 'shield', t: 'Confidential & Secure', p: 'Your drawings stay private. Protected storage and signed links guard every file you share.' },
  { ic: 'layers', t: 'True Material Accuracy', p: 'See exact Century Ply colours, textures and finishes rendered faithfully before anything is built.' },
];

const GALLERY = [
  { cat: 'Residential', img: 'photo-1564078516393-cf04bd966897', t: 'Residential', s: 'Living Rooms · Bedrooms · Kitchens' },
  { cat: 'Commercial', img: 'photo-1478979464727-af7d24e18554', t: 'Commercial', s: 'Offices · Retail · Workspaces' },
  { cat: 'Hospitality', img: 'photo-1621293954908-907159247fc8', t: 'Hospitality', s: 'Hotels · Restaurants · Experiences' },
  { cat: 'Architectural', img: 'photo-1536501483244-925da0b87089', t: 'Architectural', s: 'Facades · Exteriors · Massing' },
  { cat: 'Interiors', img: 'photo-1599696848652-f0ff23bc911f', t: 'Interiors', s: 'Materials · Finishes · Styling' },
];

const PROCESS = [
  { n: '01', t: 'Register & Access', p: 'Receive your invite and sign in to the Century Joy portal.' },
  { n: '02', t: 'Submit Request', p: 'Share project details, requirements and expected outcomes.' },
  { n: '03', t: 'Upload Materials', p: 'Upload drawings, plans and reference images.', fmt: ['.DWG', 'PDF', 'JPG'] },
  { n: '04', t: 'Visualisation', p: 'Our studio team builds realistic renders from your brief.' },
  { n: '05', t: 'Review & Revise', p: 'Review the draft and request up to two revisions.' },
  { n: '06', t: 'Final Delivery', p: 'Download your completed high-resolution renders.' },
];

const TESTIMONIALS = [
  { q: 'The renders closed the project in a single client meeting. They genuinely could not believe it was not a photograph.', nm: 'Ananya Rao', rl: 'Principal Architect · Studio Verge', i: 'AR' },
  { q: 'Turnaround was the real surprise. First drafts in two days, revisions handled overnight. It has changed how we pitch.', nm: 'Rohan Mehta', rl: 'Interior Designer · Mehta & Co.', i: 'RM' },
  { q: 'Material accuracy is unmatched. Clients finally see the exact Century Ply finish before a single board is cut.', nm: 'Priya Nair', rl: 'Design Lead · Aether Interiors', i: 'PN' },
  { q: 'We brief once and get back visuals that feel finished. The lighting and material detail are genuinely studio quality.', nm: 'Kabir Shah', rl: 'Architect · Form & Field', i: 'KS' },
  { q: 'Clients approve faster when they can step inside the design. Century Joy has shortened our sign-off cycle dramatically.', nm: 'Meera Iyer', rl: 'Interior Designer · Habitat Studio', i: 'MI' },
];

const BLOGS = [
  { cat: 'Visualisation', img: 'photo-1613545325278-f24b0cae1224', t: 'Five Ways Photoreal Renders Win More Client Approvals', p: 'Why a single convincing image often does more than a folder of drawings, and how to brief for it.', read: '6 min read' },
  { cat: 'Process', img: 'photo-1536501483244-925da0b87089', t: 'From CAD to Camera-Ready: Inside Our Render Pipeline', p: 'A look at how a set of plans becomes a finished, presentation-grade visualisation, step by step.', read: '8 min read' },
  { cat: 'Materials', img: 'photo-1581783748410-2c5377ad72ee', t: 'Choosing the Right Finish: Reading Light in 3D', p: 'How textures and finishes behave under different lighting, and what that means for your specification.', read: '5 min read' },
];

const FAQ: [string, string][] = [
  ['What projects can be submitted?', 'Residential, commercial, hospitality and architectural visualisation projects are all welcome.'],
  ['What files can I upload?', 'CAD drawings (.dwg), PDFs, and reference images (.jpg) covering your plans, elevations and any moodboards.'],
  ['How long does a visualisation take?', 'Most first drafts are delivered within 48 hours. More complex scenes can take a little longer, and you will always see an ETA on your dashboard.'],
  ['Can I request modifications?', 'Yes. Each project includes up to two revision rounds at no extra cost, tracked on your dashboard.'],
  ['How do I get access?', 'Century Joy is invite-only for Century Ply partners. Request access and our team will set up your account, or simply sign in if you already have one.'],
  ['How do I track my request?', 'Every status update is visible on your portal, with email notifications at each milestone from brief to final delivery.'],
];

/* ── line icons (single stroke family) ─────────────────── */
function Icon({ name }: { name: string }) {
  const p: Record<string, JSX.Element> = {
    spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
    revise: <><path d="M21 3v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 9" /><path d="M3 21v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 15" /></>,
    shield: <><path d="M12 3l8 3.5v5c0 5-3.4 8-8 9.5-4.6-1.5-8-4.5-8-9.5v-5z" /><path d="m9 12 2 2 4-4" /></>,
    layers: <><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></>,
  };
  return <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
}

function Star() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9z" /></svg>;
}

/* ============================================================
   INTRO GATE
   ============================================================ */
function Gate({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const enter = () => { setLeaving(true); setTimeout(onEnter, 700); };

  return (
    <div className={`gate ${leaving ? 'leaving' : ''}`}>
      <video className="gate__video" autoPlay muted loop playsInline preload="auto" poster="/videos/intro-poster.jpg">
        <source src="/videos/intro.webm" type="video/webm" />
        <source src="/videos/intro.mp4" type="video/mp4" />
      </video>
      <div className="gate__scrim" />

      <div className="gate__top">
        <div className="gate__top-in">
          <BrandLogo light height={30} />
          <nav className="gate__nav">
            <Link to="/login" className="btn btn-red btn-sm">Log in <span className="ar">→</span></Link>
          </nav>
        </div>
      </div>

      <div className="gate__mid">
        <div className="gate__kicker">Visualisation Studio</div>
        <h1 className="gate__title">Step Inside Your Design<br /><em>Before It Is Built</em></h1>
        <p className="gate__sub">Photorealistic 3D visualisation for architects and interior designers. Your vision, brought to life frame by frame.</p>
      </div>

      <div className="gate__bottom">
        <button className="gate__enter" onClick={enter} aria-label="Enter the site">
          Enter the Experience
          <span className="ar">→</span>
        </button>
        <div className="gate__cue"><span className="line" /><span className="hint">Click to explore</span></div>
      </div>
    </div>
  );
}

/* ============================================================
   BEFORE / AFTER SLIDER  (concept sketch ↔ photoreal render)
   ============================================================ */
function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromX = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    const move = (e: PointerEvent) => { if (dragging.current) setFromX(e.clientX); };
    const up = () => { dragging.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <div
      className="ba"
      ref={wrapRef}
      onPointerDown={(e) => { dragging.current = true; setFromX(e.clientX); }}
    >
      {/* render = base layer (revealed on the right) */}
      <img className="ba-img" src="/images/render.webp" alt="Photorealistic interior render" draggable={false} />
      {/* sketch = top layer, clipped to the left of the handle */}
      <img
        className="ba-img ba-sketch"
        src="/images/sketch.webp"
        alt="Concept sketch of the same interior"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="ba-tag ba-tag-l" style={{ opacity: pos > 12 ? 1 : 0 }}>Concept Sketch</span>
      <span className="ba-tag ba-tag-r" style={{ opacity: pos < 88 ? 1 : 0 }}>Photoreal Render</span>

      <div className="ba-line" style={{ left: `${pos}%` }} aria-hidden="true" />
      <button
        type="button"
        className="ba-grip"
        style={{ left: `${pos}%` }}
        role="slider"
        aria-label="Drag to compare the concept sketch and the photoreal render"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onPointerDown={(e) => { dragging.current = true; e.stopPropagation(); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { setPos((p) => Math.max(0, p - 4)); e.preventDefault(); }
          else if (e.key === 'ArrowRight') { setPos((p) => Math.min(100, p + 4)); e.preventDefault(); }
          else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
          else if (e.key === 'End') { setPos(100); e.preventDefault(); }
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6-4 6 4 6" /><path d="m15 6 4 6-4 6" /></svg>
      </button>
    </div>
  );
}

/* ============================================================
   LANDING (white)
   ============================================================ */
function Landing() {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [ti, setTi] = useState(0);
  const [svc, setSvc] = useState(0);
  const [swap, setSwap] = useState(false);
  const filmRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // switch service tab; when triggered from the summary grid, bring the tabs/panel back into view
  const goSvc = (i: number) => {
    setSvc(i);
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hero rotation: loop forward only (wraps 4 -> 1), never reverses
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setHi((prev) => (prev + 1) % HERO_SHOTS.length);
    }, 4200);
    return () => clearInterval(t);
  }, [reduce]);

  // testimonial carousel: constant 5s per slide (re-arms on any change)
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setTi((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearTimeout(t);
  }, [ti, reduce]);
  const tgo = (d: number) => setTi((p) => (p + d + TESTIMONIALS.length) % TESTIMONIALS.length);
  useEffect(() => { setSwap(true); const t = setTimeout(() => setSwap(false), 520); return () => clearTimeout(t); }, [ti]);

  useEffect(() => {
    const nav = navRef.current;
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 30);

    // reveal: bulletproof, scroll-driven; every .rv ends fully visible
    const reveal = () => {
      const h = window.innerHeight * 0.9;
      document.querySelectorAll('.lv2 .rv:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < h) el.classList.add('in');
      });
    };
    onScroll(); reveal();
    window.addEventListener('scroll', () => { onScroll(); reveal(); }, { passive: true });
    window.addEventListener('resize', reveal);

    // process stepper: fill 01 -> 06 sequentially when scrolled in
    const timers: ReturnType<typeof setTimeout>[] = [];
    const procObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const psteps = document.querySelector('.lv2 .psteps');
        const steps = [...document.querySelectorAll('.lv2 .psteps .pstp')];
        if (e.isIntersecting) {
          timers.forEach(clearTimeout); timers.length = 0;
          steps.forEach((s) => s.classList.remove('on'));
          psteps?.classList.remove('run');
          void (psteps as HTMLElement | null)?.offsetWidth;
          psteps?.classList.add('run');
          steps.forEach((s, i) => {
            if (reduce) s.classList.add('on');
            else timers.push(setTimeout(() => s.classList.add('on'), 200 + i * 260));
          });
        } else {
          timers.forEach(clearTimeout); timers.length = 0;
          psteps?.classList.remove('run');
          steps.forEach((s) => s.classList.remove('on'));
        }
      }),
      { threshold: 0.4 },
    );
    const procEl = document.getElementById('process');
    if (procEl) procObs.observe(procEl);

    return () => {
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
      procObs.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; }, [menuOpen]);

  // gallery filmstrip: custom scrollbar that reflects position and is draggable
  useEffect(() => {
    const film = filmRef.current, thumb = thumbRef.current, bar = barRef.current;
    if (!film || !thumb || !bar) return;
    const sync = () => {
      const max = film.scrollWidth - film.clientWidth;
      const ratio = film.clientWidth / film.scrollWidth;
      const w = Math.max(ratio * 100, 14);
      thumb.style.width = `${w}%`;
      thumb.style.left = `${(max > 0 ? film.scrollLeft / max : 0) * (100 - w)}%`;
    };
    sync();
    film.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    let dragging = false, startX = 0, startLeft = 0;
    const down = (e: PointerEvent) => { dragging = true; startX = e.clientX; startLeft = film.scrollLeft; thumb.setPointerCapture(e.pointerId); e.preventDefault(); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      film.scrollLeft = startLeft + (dx / bar.clientWidth) * film.scrollWidth;
    };
    const up = () => { dragging = false; };
    thumb.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      film.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      thumb.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const t = TESTIMONIALS[ti];

  return (
    <div className="lv2">
      {/* NAV */}
      <header className="nav" ref={navRef}>
        <div className="wrap nav-in">
          <BrandLogo height={30} />
          <div className="nav-links">
            {NAV.map((n) => <a key={n.id} className="txt" href={`#${n.id}`}>{n.label}</a>)}
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
        {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
        <Link to="/login" className="btn btn-red" onClick={() => setMenuOpen(false)}>Log in <span className="ar">→</span></Link>
      </nav>

      {/* HERO */}
      <section className="sec hero" id="top">
        <div className="wrap hero-grid">
          <div className="rv">
            <div className="tstack">
              <div className="hero-tags"><span>Architects</span><span>Interior Designers</span><span>Design Influencers</span></div>
              <h1>Bring Your Designs <em>To Life</em> Before They <em>Become Reality</em></h1>
              <p className="lead">Century Joy is a dedicated visualisation service that helps architects and interior designers present their ideas with greater clarity, impact and confidence.</p>
            </div>
            <div className="hero-cta">
              <a href="#about" className="btn btn-red btn-sm">Discover more <span className="ar">→</span></a>
            </div>
            <div className="hero-trust">
              <div className="ht"><div className="n">500+</div><div className="l">Projects rendered</div></div>
              <div className="ht"><div className="n">48 hrs</div><div className="l">Typical first draft</div></div>
              <div className="ht"><div className="n">2</div><div className="l">Free revisions</div></div>
            </div>
          </div>

          <div className="hero-shot rv d1">
            {HERO_SHOTS.map((s, i) => (
              <div key={s.id} className={`slide ${i === hi ? 'on' : ''}`} data-i={i}>
                <img src={IMG(s.id, 1200)} alt={s.cap} loading={i === 0 ? 'eager' : 'lazy'} />
              </div>
            ))}
            <div className="badge2">
              <span className="cap">{HERO_SHOTS[hi].cap}</span>
              <span className="hero-dots">
                {HERO_SHOTS.map((s, i) => (
                  <button key={s.id} className={i === hi ? 'on' : ''} aria-label={`Show ${s.cap}`} onClick={() => setHi(i)} />
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="mtrack">{[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}</div>
      </div>

      {/* ABOUT */}
      <section className="sec" id="about">
        <div className="wrap about-grid">
          <div className="tstack rv">
            <span className="eyebrow">About Century Joy</span>
            <h2>Where Design Meets <span className="red">Visual Storytelling</span></h2>
            <p className="lead">Great designs deserve to be experienced, not just explained.</p>
            <p>An exclusive design-support service that turns sketches and project models into compelling, photorealistic visuals that drive faster decisions and stronger client engagement.</p>
          </div>
          <div className="about-img rv d1"><img src={IMG('photo-1599696848652-f0ff23bc911f', 1100)} alt="Photoreal interior visualisation" /></div>
        </div>
      </section>

      {/* WHY CHOOSE US - sticky intro + uniform feature rows */}
      <section className="sec tint" id="why">
        <div className="wrap why2">
          <div className="why2-intro rv">
            <div className="tstack">
              <span className="eyebrow">Why Century Joy</span>
              <h2>Why Studios <span className="red">Choose Us</span></h2>
              <p className="lead">Everything a design practice needs to present with confidence: quality, speed and trust, in one place.</p>
            </div>
            <div className="why2-stats">
              <div><div className="n">500+</div><div className="l">Projects rendered</div></div>
              <div><div className="n">48 hrs</div><div className="l">Typical first draft</div></div>
              <div><div className="n">2</div><div className="l">Free revisions</div></div>
            </div>
          </div>
          <div className="why2-list rv d1">
            {WHY.map((w) => (
              <div className="wrow" key={w.t}>
                <div className="wic"><Icon name={w.ic} /></div>
                <div className="wtxt"><h3>{w.t}</h3><p>{w.p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES - tabbed editorial showcase */}
      <section className="sec" id="services">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">Services Offered</span>
            <h2>Visualising Every <span className="red">Design Possibility</span></h2>
          </div>

          {/* tab nav */}
          <div className="svc2-tabs rv" role="tablist" aria-label="Services" ref={tabsRef}>
            {SERVICES.map((s, i) => (
              <button
                key={s.n}
                type="button"
                role="tab"
                id={`svc2-tab-${i}`}
                aria-selected={svc === i}
                aria-controls={`svc2-panel-${i}`}
                className={`svc2-tab ${svc === i ? 'on' : ''}`}
                onClick={() => setSvc(i)}
              >
                <span className="svc2-tnum">{s.n}</span>{s.title}
              </button>
            ))}
          </div>

          {/* active panel */}
          <div className="svc2-stage rv">
            {SERVICES.map((s, i) => (
              <div
                key={s.n}
                id={`svc2-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`svc2-tab-${i}`}
                hidden={svc !== i}
                className={`svc2-panel ${svc === i ? 'on' : ''}`}
              >
                <div className="svc2-media">
                  <span className="svc2-ghost" aria-hidden="true">{s.n}</span>
                  <div className="svc2-mat"><img src={IMG(s.img, 1200)} alt={s.title} loading="lazy" /></div>
                </div>
                <div className="svc2-content">
                  <p className="svc2-kicker">{s.n} — {s.tag}</p>
                  <h3 className="svc2-name">{s.title}</h3>
                  <div className="svc2-rule" aria-hidden="true" />
                  <p className="svc2-desc">{s.body}</p>
                  <p className="svc2-ideal">Ideal For</p>
                  <div className="svc2-chips">{s.chips.map((c) => <span key={c}>{c}</span>)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* summary grid */}
          <div className="svc2-summary rv" aria-label="All services at a glance">
            {SERVICES.map((s, i) => (
              <button
                key={s.n}
                type="button"
                className={`svc2-sum ${svc === i ? 'on' : ''}`}
                onClick={() => goSvc(i)}
              >
                <span className="svc2-snum">{s.n}</span>
                <span className="svc2-sname">{s.title}</span>
                <span className="svc2-sdesc">{s.short}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY - filmstrip */}
      <section className="sec tint" id="work">
        <div className="wrap">
          <div className="gal-head rv">
            <div className="tstack">
              <span className="eyebrow">Sample Gallery</span>
              <h2>Explore Possibilities Through <span className="red">Visualisation</span></h2>
            </div>
            <span className="gal-hint">Scroll to browse</span>
          </div>
        </div>
        <div className="wrap">
          <div className="film rv" ref={filmRef}>
            {GALLERY.map((g) => (
              <a className="gcard" href={REQUEST_ACCESS} key={g.cat}>
                <img src={IMG(g.img, 900)} alt={`${g.t} render`} loading="lazy" />
                <span className="tagc">{g.cat}</span>
                <div className="cap"><div className="t">{g.t}</div><div className="s">{g.s}</div></div>
              </a>
            ))}
          </div>
          <div className="film-bar rv" ref={barRef}><div className="film-thumb" ref={thumbRef} /></div>
        </div>
      </section>

      {/* HOW IT WORKS - stepper (variation 1) */}
      <section className="sec" id="process">
        <div className="wrap">
          <div className="shead center rv">
            <span className="eyebrow">How It Works</span>
            <h2>A Seamless Journey from <span className="red">Concept to Creation</span></h2>
          </div>
          <div className="psteps rv">
            {PROCESS.map((s) => (
              <div className="pstp" key={s.n}>
                <div className="pc">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
                {s.fmt && <div className="fmt">{s.fmt.map((f) => <span key={f}>{f}</span>)}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - carousel */}
      <section className="sec tint" id="testimonials">
        <div className="wrap">
          <div className="shead center rv">
            <span className="eyebrow">Testimonials</span>
            <h2>Loved by Designers <span className="red">&amp; Architects</span></h2>
            <p className="lead">Real words from the studios and practices who present with Century Joy.</p>
          </div>
          <div className="tcar rv">
            <button className="tarrow" onClick={() => tgo(-1)} aria-label="Previous testimonial">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <div className="tstage">
              <figure className={`tbig ${swap ? 'swap' : ''}`} key={ti}>
                <span className="tquote" aria-hidden="true">&rdquo;</span>
                <div className="tstars"><Star /><Star /><Star /><Star /><Star /></div>
                <blockquote>{t.q}</blockquote>
                <figcaption className="twho">
                  <span className="tav">{t.i}</span>
                  <span><span className="tnm">{t.nm}</span><br /><span className="trl">{t.rl}</span></span>
                </figcaption>
              </figure>
            </div>
            <button className="tarrow" onClick={() => tgo(1)} aria-label="Next testimonial">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>
          <div className="tdots">
            {TESTIMONIALS.map((tt, i) => (
              <button key={tt.nm} className={i === ti ? 'on' : ''} aria-label={`Testimonial ${i + 1}`} onClick={() => setTi(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* BLOGS */}
      <section className="sec" id="insights">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">From the Studio</span>
            <h2>Latest Articles <span className="red">&amp; Insights</span></h2>
          </div>
          <div className="bgrid">
            {BLOGS.map((b, i) => (
              <a className={`bcard rv ${i === 1 ? 'd1' : i === 2 ? 'd2' : ''}`} href={REQUEST_ACCESS} key={b.t}>
                <div className="bimg"><img src={IMG(b.img, 900)} alt={b.t} loading="lazy" /><span className="bcat">{b.cat}</span></div>
                <div className="bbody">
                  <h3>{b.t}</h3>
                  <p>{b.p}</p>
                  <div className="bfoot">
                    <span className="meta">{b.read}</span>
                    <span className="more">Read more <span className="ar">→</span></span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec tint" id="faq">
        <div className="wrap faq-grid">
          <div className="tstack rv">
            <span className="eyebrow">FAQ</span>
            <h2>Frequently Asked <span className="red">Questions</span></h2>
          </div>
          <div className="rv d1">
            {FAQ.map(([q, a], i) => (
              <details className="faq" key={q} open={i === 0}>
                <summary>{q}<span className="pl" /></summary>
                <div className="ans"><p>{a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - collage band (variation 1) */}
      <section className="sec cta-band">
        <div className="wrap">
          <div className="shead center rv">
            <span className="eyebrow">From Concept to Render</span>
            <h2>Where a Sketch Becomes <span className="red">Reality</span></h2>
            <p className="lead">Drag the handle to reveal the same interior transform from concept sketch to photoreal render.</p>
          </div>
          <div className="rv"><BeforeAfter /></div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="sec contact" id="contact">
        <div className="wrap c-grid">
          <div className="tstack rv">
            <span className="eyebrow">Get In Touch</span>
            <h2>Your vision.<br />Our visual expertise.</h2>
            <p className="lead">Already a partner? Sign in to submit your first request. New here? Request access and our team will be in touch.</p>
          </div>
          <div className="c-info rv d1">
            <div className="h">Need assistance? We are here to help</div>
            <div><div className="k">Email</div><div className="v">3DServices@centuryply.com</div></div>
            <div><div className="k">Phone</div><div className="v">9004901699</div></div>
            <div><div className="k">Support Hours</div><div className="v">9:30 AM to 5:30 PM IST</div></div>
            <div className="c-social">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
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

      <ChatWidget />
    </div>
  );
}

/* ============================================================
   PAGE: gate, then landing
   ============================================================ */
export default function LandingV2() {
  const [entered, setEntered] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.length > 1) return true;
    try { return sessionStorage.getItem('cj_entered') === '1'; } catch { return false; }
  });

  useEffect(() => {
    document.body.style.overflow = entered ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [entered]);

  const enter = () => {
    try { sessionStorage.setItem('cj_entered', '1'); } catch { /* ignore */ }
    window.scrollTo(0, 0);
    setEntered(true);
  };

  return (
    <>
      <Landing />
      {!entered && <Gate onEnter={enter} />}
    </>
  );
}
