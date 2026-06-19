import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wordmark } from './Logo';
import type { Role } from '../types';

interface NavItem { to: string; label: string; ix: string; cta?: boolean; end?: boolean }

const NAV: Record<Role, NavItem[]> = {
  client: [
    { to: '/client', label: 'Dashboard', ix: '01', end: true },
    { to: '/client/new', label: 'New Project', ix: '02', cta: true },
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
  children: ReactNode;
}

export function PortalLayout({ title, subtitle, actions, children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const items = NAV[user.role];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <Wordmark to={user.role === 'client' ? '/client' : `/${user.role}`} />
        </div>
        <nav className="rnav">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (it.cta ? 'cta' : isActive ? 'active' : '')}>
              <span className="ix">{it.ix}</span>
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="ruser">
          <div className="nm">{user.name}</div>
          <div className="rl">{user.role}</div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          {actions && <div className="row">{actions}</div>}
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
