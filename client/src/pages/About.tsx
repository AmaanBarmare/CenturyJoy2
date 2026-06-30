import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav';
import { SiteFooter } from '../components/SiteFooter';
import { ChatWidget } from '../components/ChatWidget';

const REQUEST_ACCESS = 'mailto:3DServices@centuryply.com?subject=Century%20Joy%20access%20request';

const STATS = [
  { n: '60', e: '+', l: 'Years of Ply Heritage' },
  { n: '2', e: '', l: 'Free Revision Rounds' },
  { n: '100', e: '%', l: 'Material-True Rendering' },
];

const PRINCIPLES = [
  { n: '01', t: 'Craft Before Speed', p: 'We take the time to understand every material, light condition and spatial relationship before a single frame is rendered. Precision is not optional, it is the product.' },
  { n: '02', t: 'Material Truth', p: 'Plywood, veneer, laminate, stone and glass each have their own language. Our renders speak it fluently, drawing on decades of material knowledge from the Century Ply universe.' },
  { n: '03', t: 'Light as Story', p: 'The same room, lit differently, tells a different story. We treat light not as a technical setting but as a narrative device that shapes atmosphere, depth and emotion.' },
];

export default function About() {
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
      <SiteNav current="About" />

      {/* HERO */}
      <section className="sec ph a-hero">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">About</span>
            <h1>The Studio Behind <em>the Vision</em></h1>
            <p className="lead">Century Joy is Century Ply&rsquo;s dedicated 3D visualisation studio. We translate architectural and interior intent into immersive, photorealistic imagery that moves a project from concept to conviction.</p>
          </div>
          <div className="a-hero-media rv d1">
            <img src="/gallery/interiors/interior-32.webp" alt="Photorealistic living room visualisation" />
          </div>
        </div>
      </section>

      {/* BELIEF STATEMENT */}
      <section className="sec tint a-statement">
        <div className="wrap">
          <div className="inner rv">
            <span className="eyebrow">Our Belief</span>
            <h2>We believe every great design deserves to be <span className="red">experienced</span> before it is built.</h2>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="sec">
        <div className="wrap a-story">
          <div className="a-story-img rv">
            <img src="/gallery/interiors/interior-15.webp" alt="Material and finish study render" />
          </div>
          <div className="a-story-body rv d1">
            <span className="eyebrow">Our Story</span>
            <h2>Born from a legacy of <span className="red">material excellence</span></h2>
            <p>For over six decades, Century Ply has shaped the interiors of India&rsquo;s most distinctive homes, institutions and commercial spaces. Century Joy is the natural extension of that legacy, a studio dedicated to visualising the full material richness of architecture and interior design.</p>
            <p>We combine deep product knowledge with world-class rendering craft to produce imagery that does more than impress. It convinces, it communicates, and it lets a client experience a space long before a single panel is placed.</p>
            <p>Our work serves architects, interior designers and design influencers who understand that a great render is not decoration. It is decision-making made visual.</p>
            <div className="pull">
              <p>A render is not a picture of a room. It is a promise of how the room will feel to live in.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="sec tint">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">By the Numbers</span>
            <h2>Heritage you can <span className="red">build on</span></h2>
          </div>
          <div className="a-stats rv d1">
            {STATS.map((s) => (
              <div className="a-stat" key={s.l}>
                <div className="num-d">{s.n}<em>{s.e}</em></div>
                <div className="bar" />
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="eyebrow">How We Work</span>
            <h2>The principles behind <span className="red">every frame</span></h2>
          </div>
          <div className="a-principles rv d1">
            {PRINCIPLES.map((p) => (
              <div className="a-principle" key={p.n}>
                <div className="pn">{p.n}</div>
                <h3>{p.t}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WIDE IMAGE BAND */}
      <section className="sec">
        <div className="wrap">
          <div className="a-band-img rv">
            <img src="/gallery/exteriors/exterior-05.webp" alt="Architectural facade visualisation" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec cta2">
        <div className="wrap">
          <div className="inner rv">
            <span className="eyebrow">Start the Conversation</span>
            <h2>Ready to see your vision <span className="red">rendered?</span></h2>
            <p className="lead">From a single interior render to a complete set of presentation visuals, let us bring your space to life before it is built.</p>
            <div className="row">
              <Link to="/services" className="btn btn-white">Explore services <span className="ar">→</span></Link>
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
