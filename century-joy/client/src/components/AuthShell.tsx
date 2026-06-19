import type { ReactNode } from 'react';
import { Wordmark } from './Logo';

const HERO = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-brand">
        <div className="ab-bg"><img src={HERO} alt="" /></div>
        <Wordmark />
        <div>
          <div className="ab-tag">Bring your designs to life before they become reality.</div>
          <p className="ab-sub">
            Photorealistic 3D visualisation for architects and interior designers — submit a project,
            track every stage, receive your renders.
          </p>
        </div>
        <div className="ab-foot">Your vision. Our visual expertise.</div>
      </div>
      <div className="auth-form">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
