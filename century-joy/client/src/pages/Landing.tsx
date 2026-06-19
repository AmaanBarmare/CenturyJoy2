import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../components/Logo';

const IMG = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const REQUEST_ACCESS = 'mailto:3DServices@centuryply.com?subject=Century%20Joy%20access%20request';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
];

const SERVICES = [
  { n: '01', img: 'photo-1613545325278-f24b0cae1224', title: 'Interior Rendering', body: 'Transform interior concepts into realistic visual experiences that let clients feel a space before it exists.', chips: ['Living spaces', 'Bedrooms', 'Kitchens', 'Luxury interiors'] },
  { n: '02', img: 'photo-1536501483244-925da0b87089', title: 'Exterior Rendering', body: 'Present architectural concepts with realistic surroundings, materials and finishes.', chips: ['Residential', 'Commercial', 'Facade studies'] },
  { n: '03', img: 'photo-1581783748410-2c5377ad72ee', title: 'Material & Finish Visualisation', body: 'Help clients understand the impact of colours, textures and surface finishes, rendered true to life.', chips: ['Colours', 'Textures', 'Finishes', 'Combinations'] },
  { n: '04', img: 'photo-1606744824163-985d376605aa', title: 'Presentation Visuals', body: 'Professional-quality visuals crafted to win the room, for meetings, proposals and presentations.', chips: ['Client meetings', 'Proposals', 'Presentations'] },
];

const PROCESS = [
  { n: '01', t: 'Register & Access', p: 'Receive your invite and sign in to the Century Joy portal.' },
  { n: '02', t: 'Submit Request', p: 'Share project details, requirements and expected outcomes.' },
  { n: '03', t: 'Upload Materials', p: 'Upload drawings, plans and reference images.', fmt: ['.DWG', 'PDF', 'JPG'] },
  { n: '04', t: 'Visualisation', p: 'Our studio team builds realistic renders from your brief.' },
  { n: '05', t: 'Review & Revise', p: 'Review the draft, request up to two revisions.' },
  { n: '06', t: 'Final Delivery', p: 'Download your completed high-resolution renders.' },
];

const FAQ = [
  ['What projects can be submitted?', 'Residential, commercial, hospitality and architectural visualisation projects.'],
  ['What files can I upload?', 'CAD drawings (.dwg), PDFs, and reference images (.jpg) for your plans and elevations.'],
  ['Can I request modifications?', 'Yes. Each project includes up to two revision rounds, tracked on your dashboard.'],
  ['How do I track my request?', 'Every status update is visible on your portal, with email notifications at each milestone.'],
];

export default function Landing() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // reveal on scroll
    const revealObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), revealObs.unobserve(e.target))),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.landing .rv').forEach((el) => revealObs.observe(el));

    // active dot
    const dots = [...document.querySelectorAll('.dotnav a')];
    const dotObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) dots.forEach((d) => d.classList.toggle('active', d.getAttribute('data-i') === e.target.id));
      }),
      { rootMargin: '-45% 0px -55% 0px' },
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) dotObs.observe(el); });

    // sticky image swap for services
    const sis = [...document.querySelectorAll('.sticky-img .si')];
    const blockObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const i = (e.target as HTMLElement).dataset.i;
          sis.forEach((s) => s.classList.toggle('on', (s as HTMLElement).dataset.i === i));
        }
      }),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    document.querySelectorAll('.svc-b').forEach((b) => blockObs.observe(b));

    // process stepper — fill 01 -> 06 sequentially when it scrolls into view
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const procObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        document.querySelector('.psteps')?.classList.add('run');
        const steps = [...document.querySelectorAll('.psteps .pstp')];
        steps.forEach((s, i) => {
          if (reduce) s.classList.add('on');
          else timers.push(setTimeout(() => s.classList.add('on'), 200 + i * 260));
        });
        procObs.disconnect();
      }),
      { threshold: 0.45 },
    );
    const procEl = document.getElementById('process');
    if (procEl) procObs.observe(procEl);

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObs.disconnect(); dotObs.disconnect(); blockObs.disconnect(); procObs.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="landing">
      <header className="lnav" ref={navRef}>
        <div className="lwrap lnav-in">
          <Wordmark />
          <nav className="links">
            {SECTIONS.slice(1).map((s) => (
              <a key={s.id} className="ln-link" href={`#${s.id}`}>{s.label}</a>
            ))}
          </nav>
          <div className="lnav-cta">
            <a className="ln-link" href={REQUEST_ACCESS}>Request access</a>
            <Link to="/login" className="btn btn-primary btn-sm">Log in</Link>
          </div>
        </div>
      </header>

      <nav className="dotnav">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} data-i={s.id} className={s.id === 'hero' ? 'active' : ''}>
            <span className="dlbl">{s.label}</span><span className="ddot" />
          </a>
        ))}
      </nav>

      {/* HERO */}
      <section className="panel full hero" id="hero">
        <div className="hero-bg"><img src={IMG('photo-1749930206000-179d0b85aa7e', 2000)} alt="Photoreal residential interior render" /></div>
        <div className="lwrap hero-c">
          <div className="tags"><span>Architects</span><span>Interior Designers</span><span>Design Influencers</span></div>
          <h1>Bring Your Designs <em>to Life</em> Before They Become Reality</h1>
          <div className="hero-bottom">
            <div>
              <p className="sub">Century Joy is a dedicated visualisation service that helps architects and interior designers present their ideas with greater clarity, impact and confidence.</p>
              <p className="hero-support">Your vision. Our visual expertise.</p>
            </div>
            <div className="cta-row">
              <Link to="/login" className="btn btn-primary">Log in <span className="ar">→</span></Link>
              <a href={REQUEST_ACCESS} className="btn btn-line">Request access</a>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="panel light" id="about">
        <div className="lwrap lsec">
          <div className="about-grid">
            <div className="rv">
              <span className="eyebrow">About Century Joy</span>
              <h2>Where Design Meets <span className="red">Visual Storytelling</span></h2>
              <p className="big">Great designs deserve to be experienced, not just explained.</p>
              <p className="body">An exclusive design-support service that turns sketches and project models into compelling, photorealistic visuals, driving faster decisions and stronger client engagement.</p>
            </div>
            <div className="ab-img rv"><img src={IMG('photo-1599696848652-f0ff23bc911f', 1100)} alt="Photoreal interior visualisation" /></div>
          </div>
          <div className="benefits rv">
            <div className="ben"><div className="n">01</div><h3>Showcase designs before execution</h3></div>
            <div className="ben"><div className="n">02</div><h3>Communicate materials, textures & finishes</h3></div>
            <div className="ben"><div className="n">03</div><h3>Create impactful client presentations</h3></div>
            <div className="ben"><div className="n">04</div><h3>Reduce interpretation gaps</h3></div>
          </div>
        </div>
      </section>

      {/* SERVICES — sticky image split */}
      <section className="panel" id="services">
        <div className="lwrap lsec">
          <div className="svc-head rv">
            <span className="eyebrow">Services Offered</span>
            <h2>Visualising Every Design Possibility</h2>
          </div>
          <div className="split">
            <div className="sticky-img" aria-hidden="true">
              <div className="frame">
                {SERVICES.map((s, i) => (
                  <div key={s.n} className={`si ${i === 0 ? 'on' : ''}`} data-i={String(i)}>
                    <img src={IMG(s.img, 1200)} alt="" />
                  </div>
                ))}
              </div>
            </div>
            <div className="svc-blocks">
              {SERVICES.map((s, i) => (
                <div className="svc-b" data-i={String(i)} key={s.n}>
                  <div className="mimg"><img src={IMG(s.img, 900)} alt={s.title} /></div>
                  <div className="bn">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <div className="chips">{s.chips.map((c) => <span key={c}>{c}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="panel" id="gallery">
        <div className="lwrap lsec">
          <div className="gal-head rv">
            <div>
              <span className="eyebrow">Sample Gallery</span>
              <h2>Explore Possibilities Through Visualisation</h2>
            </div>
          </div>
          <div className="gal rv">
            <a className="gtile g-a" href={REQUEST_ACCESS}>
              <img src={IMG('photo-1564078516393-cf04bd966897', 1400)} alt="Residential render" />
              <span className="tagc">Residential</span>
              <div className="cap"><div className="t">Residential</div><div className="s">Living Rooms · Bedrooms · Kitchens · Luxury Homes</div></div>
            </a>
            <a className="gtile g-b" href={REQUEST_ACCESS}>
              <img src={IMG('photo-1478979464727-af7d24e18554', 1200)} alt="Commercial render" />
              <span className="tagc">Commercial</span>
              <div className="cap"><div className="t">Commercial</div><div className="s">Offices · Retail · Workspaces</div></div>
            </a>
            <a className="gtile g-c" href={REQUEST_ACCESS}>
              <img src={IMG('photo-1621293954908-907159247fc8', 1200)} alt="Hospitality render" />
              <span className="tagc">Hospitality</span>
              <div className="cap"><div className="t">Hospitality</div><div className="s">Hotels · Restaurants · Experiences</div></div>
            </a>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="panel" id="process">
        <div className="lwrap lsec">
          <div className="proc-head rv">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>How It Works</span>
            <h2>A Seamless Journey from Concept to Creation</h2>
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

      {/* FAQ */}
      <section className="panel light">
        <div className="lwrap lsec faq-in">
          <div className="rv">
            <span className="eyebrow">FAQ</span>
            <h2 style={{ marginTop: 16 }}>Frequently Asked Questions</h2>
          </div>
          <div className="rv">
            {FAQ.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary>{q}<span className="pl" /></summary>
                <div className="ans">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="panel contact" id="contact">
        <div className="lwrap lsec c-grid">
          <div className="rv">
            <span className="eyebrow dim" style={{ color: 'rgba(255,255,255,.7)' }}>Get Started</span>
            <h2 style={{ marginTop: 16 }}>Your vision.<br />Our visual expertise.</h2>
            <p className="support">Already a partner? Sign in to submit your first request. New here? Request access and our team will be in touch.</p>
            <div className="cta-row">
              <Link to="/login" className="btn btn-bone">Log in <span className="ar">→</span></Link>
              <a href={REQUEST_ACCESS} className="btn btn-line" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>Request access</a>
            </div>
          </div>
          <div className="c-info rv">
            <div className="h">Need assistance? We are here to help</div>
            <div className="row2"><div className="k">Email</div><div className="v">3DServices@centuryply.com</div></div>
            <div className="row2"><div className="k">Phone</div><div className="v">9004901699</div></div>
            <div className="row2"><div className="k">Support Hours</div><div className="v">9:30 AM – 5:30 PM IST</div></div>
          </div>
        </div>
      </section>

      <footer className="lfoot">
        <div className="lwrap lf">
          <Wordmark />
          <span>© {new Date().getFullYear()} Century Plyboards (India) Ltd. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
