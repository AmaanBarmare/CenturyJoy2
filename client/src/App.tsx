import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import { FullScreenLoading } from './components/Loading';
import { ScrollToHash } from './components/ScrollToHash';
import type { Role } from './types';

// Eager: the public entry points most visitors hit first.
import LandingV2 from './pages/LandingV2';
import Login from './pages/Login';

// Lazy: split secondary + authenticated routes into their own chunks so the
// landing page never downloads the portal/admin code on first load.
const Landing = lazy(() => import('./pages/Landing'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));
const NewProject = lazy(() => import('./pages/client/NewProject'));
const StudioDashboard = lazy(() => import('./pages/studio/Dashboard'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const AdminBoard = lazy(() => import('./pages/admin/Board'));
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminClientDetail = lazy(() => import('./pages/admin/ClientDetail'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminAudit = lazy(() => import('./pages/admin/AuditLog'));

function homeFor(role: Role) {
  return role === 'client' ? '/client' : role === 'studio' ? '/studio' : '/admin';
}

function Protected({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <FullScreenLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (user.mustChangePassword) return <Navigate to="/set-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeFor(user.role)} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoading />}>
    <ScrollToHash />
    <Routes>
      <Route path="/" element={<LandingV2 />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/v1" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/app" element={<RoleRedirect />} />
      <Route path="/app/projects/:id" element={<Protected><ProjectDetail /></Protected>} />

      <Route path="/client" element={<Protected roles={['client', 'admin']}><ClientDashboard /></Protected>} />
      <Route path="/client/new" element={<Protected roles={['client', 'admin']}><NewProject /></Protected>} />
      <Route path="/client/projects/:id" element={<Protected><ProjectDetail /></Protected>} />

      <Route path="/studio" element={<Protected roles={['studio', 'admin']}><StudioDashboard /></Protected>} />
      <Route path="/studio/projects/:id" element={<Protected roles={['studio', 'admin']}><ProjectDetail /></Protected>} />

      <Route path="/admin" element={<Protected roles={['admin']}><AdminProjects /></Protected>} />
      <Route path="/admin/board" element={<Protected roles={['admin']}><AdminBoard /></Protected>} />
      <Route path="/admin/clients" element={<Protected roles={['admin']}><AdminClients /></Protected>} />
      <Route path="/admin/clients/:id" element={<Protected roles={['admin']}><AdminClientDetail /></Protected>} />
      <Route path="/admin/analytics" element={<Protected roles={['admin']}><AdminAnalytics /></Protected>} />
      <Route path="/admin/users" element={<Protected roles={['admin']}><AdminUsers /></Protected>} />
      <Route path="/admin/audit" element={<Protected roles={['admin']}><AdminAudit /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
