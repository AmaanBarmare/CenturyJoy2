import { useState, type ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Role } from '../types';

type IconName = 'grid' | 'plus' | 'list' | 'users' | 'doc';

const ICONS: Record<IconName, ReactNode> = {
  grid: (<><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  list: (<><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></>),
  users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" /></>),
  doc: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>),
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

interface NavItem { to: string; label: string; icon: IconName; cta?: boolean; end?: boolean }

const NAV: Record<Role, NavItem[]> = {
  client: [
    { to: '/client', label: 'Dashboard', icon: 'grid', end: true },
    { to: '/client/new', label: 'New Project', icon: 'plus', cta: true },
  ],
  studio: [{ to: '/studio', label: 'Project Queue', icon: 'list', end: true }],
  admin: [
    { to: '/admin', label: 'Projects', icon: 'grid', end: true },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/audit', label: 'Audit Log', icon: 'doc' },
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
  const { theme } = useTheme();
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
            <Link to={home} className="brand-logo" aria-label="Century Joy home">
              <img src={theme === 'dark' ? '/logo-light.png' : '/logo.png'} alt="Century Joy" style={{ height: 26, width: 'auto', display: 'block' }} />
            </Link>
          )}
          <button className="collapse-btn" onClick={toggle} aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="rnav">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} title={it.label}
              className={({ isActive }) => (it.cta ? 'cta' : isActive ? 'active' : '')}>
              <span className="nav-ic"><Icon name={it.icon} /></span>
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
          <button className="signout" onClick={handleLogout} aria-label="Sign out" title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div className="tb-left">
            {back && (
              <button className="btn-back" onClick={() => navigate(back)} aria-label="Back" title="Back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1>{title}</h1>
              {subtitle && <div className="sub">{subtitle}</div>}
            </div>
          </div>
          <div className="tb-right">
            {actions && <div className="row">{actions}</div>}
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
