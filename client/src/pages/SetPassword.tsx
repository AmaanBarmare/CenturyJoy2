import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { endpoints, apiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isStrongPassword, PASSWORD_RULE } from '../lib/password';
import { AuthShell } from '../components/AuthShell';

export default function SetPassword() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const loc = useLocation();
  const presetEmail = (loc.state as { email?: string })?.email || user?.email || '';

  const [email, setEmail] = useState(presetEmail);
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isStrongPassword(newPassword)) return setError(PASSWORD_RULE);
    if (newPassword !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await endpoints.setPassword(email, currentPassword, newPassword);
      await logout();
      toast('Password updated. Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1>Set your password</h1>
      <p className="lead">First time here? Choose a new password to secure your account.</p>
      <div className="auth-note">
        Enter the <b>temporary password</b> from your welcome email, then choose a new one.
      </div>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Temporary password</label>
          <input className="input" type="password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="field">
          <label>New password</label>
          <input className="input" type="password" required value={newPassword} onChange={(e) => setNew(e.target.value)} />
          <div className="hint">{PASSWORD_RULE}</div>
        </div>
        <div className="field">
          <label>Confirm new password</label>
          <input className="input" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Set password & continue'}
        </button>
      </form>
      <p className="alt"><Link to="/login">Back to sign in</Link></p>
    </AuthShell>
  );
}
