import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wordmark } from './Logo';
import type { Role } from '../types';

interface NavItem { to: string; label: string; ix: string; cta?: boolean; end?: boolean }

const NAV: Record<Role, NavItem[]> = {
  client: [
    { to: '/client', label: 'Dashboard', ix: '01', end: true },
    { to: '/client/new', label: 'New Project', ix: '+', cta: true },
  ],
  studio: [{ to: '/studio', label: 'Project Queue', ix: '01', end: true }],
  admin: [
    { to: '/admin', label: 'Projects', ix: '01', end: true },
    { to: '/admin/users', label: 'Users', ix: '02' },
    { to: '/admin/audit', label: 'Audit Log', ix: '03' },
  ],
};

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: string;
  children: ReactNode;
}

export function PortalLayout({ title, subtitle, actions, back, children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('cj_nav_collapsed') === '1');

  if (!user) return null;
  const items = NAV[user.role];
  const home = user.role === 'client' ? '/client' : `/${user.role}`;

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem('cj_nav_collapsed', c ? '0' : '1');
      return !c;
    });
  };
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className="rail">
        <div className="rail-top">
          {collapsed ? (
            <NavLink to={home} className="rail-mark" aria-label="Century Joy home">CJ</NavLink>
          ) : (
            <Wordmark to={home} />
          )}
          <button className="collapse-btn" onClick={toggle} aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="rnav">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} title={it.label}
              className={({ isActive }) => (it.cta ? 'cta' : isActive ? 'active' : '')}>
              <span className="ix">{it.ix}</span>
              <span className="label">{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ruser">
          <div className="avatar" title={user.name}>{user.name.charAt(0).toUpperCase()}</div>
          <div className="ruser-info">
            <div className="nm">{user.name}</div>
            <div className="rl">{user.role}</div>
          </div>
          <button className="signout" onClick={handleLogout} aria-label="Sign out" title="Sign out">⎋</button>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div className="tb-left">
            {back && (
              <button className="btn-back" onClick={() => navigate(back)} aria-label="Back" title="Back">←</button>
            )}
            <div>
              <h1>{title}</h1>
              {subtitle && <div className="sub">{subtitle}</div>}
            </div>
          </div>
          {actions && <div className="row">{actions}</div>}
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
