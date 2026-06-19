import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import { FullScreenLoading } from './components/Loading';
import type { Role } from './types';

import Landing from './pages/Landing';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProjectDetail from './pages/ProjectDetail';
import ClientDashboard from './pages/client/Dashboard';
import NewProject from './pages/client/NewProject';
import StudioDashboard from './pages/studio/Dashboard';
import AdminProjects from './pages/admin/Projects';
import AdminUsers from './pages/admin/Users';
import AdminAudit from './pages/admin/AuditLog';

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
    <Routes>
      <Route path="/" element={<Landing />} />
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
      <Route path="/admin/users" element={<Protected roles={['admin']}><AdminUsers /></Protected>} />
      <Route path="/admin/audit" element={<Protected roles={['admin']}><AdminAudit /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
