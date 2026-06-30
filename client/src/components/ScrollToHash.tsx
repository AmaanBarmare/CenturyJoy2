import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Smoothly scrolls to the element matching the URL hash whenever the location
   changes — including after navigating in from another page (e.g. footer/nav
   "Contact" → /#contact lands on the home page's Get In Touch section). Retries
   across a few frames so it still works while the target section is mounting. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    let tries = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 60) {
        frame = requestAnimationFrame(tryScroll);
      }
    };

    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
