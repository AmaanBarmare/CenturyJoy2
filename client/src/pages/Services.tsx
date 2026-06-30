import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav';
import { SiteFooter } from '../components/SiteFooter';
import { ChatWidget } from '../components/ChatWidget';

const REQUEST_ACCESS = 'mailto:3DServices@centuryply.com?subject=Century%20Joy%20access%20request';

const SERVICES = [
  {
    n: '01',
    name: 'Interior Rendering',
    tag: 'Residential · Commercial',
    img: '/gallery/interiors/interior-04.webp',
    body: 'We bring interiors to life with material accuracy, considered light and a sense of atmosphere that photographs of built spaces struggle to match. Every render captures the character of the specified materials within a fully realised space.',
    bullets: ['Living, dining and bedroom renders', 'Kitchen and bathroom detailing', 'Commercial and retail interiors', 'Furniture and millwork close-ups'],
  },
  {
    n: '02',
    name: 'Exterior Rendering',
    tag: 'Architectural · Facade',
    img: '/gallery/exteriors/exterior-07.webp',
    body: 'We present architectural concepts with realistic surroundings, materials and finishes, giving developers, architects and planners a faithful image of the final structure before a brick is laid.',
    bullets: ['Facade and elevation renders', 'Residential and commercial buildings', 'Day, dusk and night lighting variants', 'Site and context views'],
  },
  {
    n: '03',
    name: 'Material & Finish Visualisation',
    tag: 'Texture · Finish',
    img: '/gallery/interiors/interior-13.webp',
    body: 'We help clients understand the impact of colours, textures and surface finishes, rendered true to life. See the exact look of a material in context before committing to it.',
    bullets: ['Panel, veneer and laminate studies', 'Colour and finish variants', 'Surface and texture close-ups', 'Material combination boards'],
  },
  {
    n: '04',
    name: 'Presentation Visuals',
    tag: 'Pitch · Proposal',
    img: '/gallery/interiors/interior-26.webp',
    body: 'Professional-quality visuals crafted to win the room, for meetings, proposals and presentations. We compose each image to communicate design intent with clarity and confidence.',
    bullets: ['Client meeting visuals', 'Proposal and pitch decks', 'Hero shots and key views', 'High-resolution exports'],
  },
];

const STEPS = [
  { n: '01', t: 'Brief & Scope', p: 'We receive your drawings, references and material specifications. A clear brief is the foundation of a precise render.' },
  { n: '02', t: 'Modelling & Setup', p: 'Our artists build the 3D scene, assemble materials and establish camera angles for your review before rendering begins.' },
  { n: '03', t: 'Render & Lighting', p: 'We apply final lighting, run high-resolution renders and refine the image through post-processing to reach the intended result.' },
  { n: '04', t: 'Review & Delivery', p: 'Final files are delivered in your required formats, with revision rounds included so the output meets your expectations.' },
];

const SERVE = [
  { t: 'Architects', p: 'Exterior and interior renders for client pitches, approvals and award entries.', ic: 'building' },
  { t: 'Interior Designers', p: 'Concept renders and material studies that communicate intent before installation.', ic: 'sofa' },
  { t: 'Developers', p: 'Sales-launch imagery and presentation visuals for residential and commercial projects.', ic: 'towers' },
  { t: 'Design Influencers', p: 'Standout visuals that bring concepts to life for audiences and collaborators.', ic: 'spark' },
];

function ServeIcon({ name }: { name: string }) {
  const paths: Record<string, JSX.Element> = {
    building: <><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" /><path d="M15 9h4a1 1 0 0 1 1 1v11" /><path d="M8 8h3M8 12h3M8 16h3" /><path d="M3 21h18" /></>,
    sofa: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M3 11a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2" /><path d="M5 16v3M19 16v3" /></>,
    towers: <><path d="M3 21V9l6-3v15" /><path d="M9 21V4l6 2v15" /><path d="M15 21v-9l6 2v7" /><path d="M2 21h20" /></>,
    spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  };
  return <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Services() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const reveal = () => {
      const h = window.innerHeight * 0.92;
      document.querySelectorAll('.lv2 .rv:not(.in)').forEach((el) => {
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
  }, []);

  return (
    <div className="lv2">
      <SiteNav current="Services" />

      {/* HERO */}
      <section className="sec ph">
        <div className="wrap">
          <div className="s-hero-grid">
            <div className="tstack rv">
              <span className="eyebrow">What We Offer</span>
              <h1>Visualisation Built for the <em>Discerning Eye</em></h1>
            </div>
            <p className="lead rv d1">From a single interior render to a full set of presentation visuals, every service is designed to communicate architectural and material intent with photorealistic precision.</p>
          </div>
          <div className="s-hero-trust rv d2">
            <div className="s-count"><div className="num-d">4<em>+</em></div><div className="l">Core Services</div></div>
            <div className="s-count"><div className="num-d">2</div><div className="l">Free Revisions</div></div>
            <div className="s-count"><div className="num-d">100<em>%</em></div><div className="l">Material-True Rendering</div></div>
          </div>
        </div>
      </section>

      {/* INTRO BAND */}
      <section className="sec tint">
        <div className="wrap s-intro-grid">
          <span className="eyebrow rv">Our Services</span>
          <p className="lead rv d1">We cover every stage of visual communication, from early concept exploration to final, presentation-ready imagery that helps your clients decide with confidence.</p>
        </div>
      </section>

      {/* SERVICE ROWS */}
      <section className="sec">
        <div className="wrap">
          <div className="s-list">
            {SERVICES.map((s) => (
              <div className="s-row" key={s.n}>
                <div className="s-row-top rv">
                  <span className="s-row-num">{s.n}</span>
                  <h2 className="s-row-name">{s.name}</h2>
                  <span className="s-row-tag">{s.tag}</span>
                </div>
                <div className="s-row-body">
                  <div className="s-row-desc rv">
                    <p>{s.body}</p>
                    <div className="s-row-bullets">
                      {s.bullets.map((b) => <div className="s-bullet" key={b}>{b}</div>)}
                    </div>
                  </div>
                  <div className="s-row-media rv d1">
                    <img src={s.img} alt={s.name} loading="lazy" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="sec tint">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">How It Works</span>
            <h2>How a project <span className="red">comes to life</span></h2>
          </div>
          <div className="s-steps rv">
            {STEPS.map((s) => (
              <div className="s-step" key={s.n}>
                <div className="sn">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">Who We Serve</span>
            <h2>Built for everyone who <span className="red">shapes space</span></h2>
          </div>
          <div className="s-serve-grid rv d1">
            {SERVE.map((s) => (
              <div className="s-serve-card" key={s.t}>
                <div className="s-serve-ic"><ServeIcon name={s.ic} /></div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec cta2">
        <div className="wrap">
          <div className="inner rv">
            <span className="eyebrow">Start a Project</span>
            <h2>Let us render your <span className="red">next project</span></h2>
            <p className="lead">Already a partner? Sign in to submit your first request. New to Century Joy? Request access and our team will be in touch.</p>
            <div className="row">
              <Link to="/login" className="btn btn-white">Log in <span className="ar">→</span></Link>
              <a href={REQUEST_ACCESS} className="btn btn-ghost">Request access</a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
