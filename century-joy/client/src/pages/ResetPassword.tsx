import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { endpoints, apiError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { isStrongPassword, PASSWORD_RULE } from '../lib/password';
import { AuthShell } from '../components/AuthShell';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) return setError('This reset link is missing its token.');
    if (!isStrongPassword(newPassword)) return setError(PASSWORD_RULE);
    if (newPassword !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await endpoints.resetPassword(token, newPassword);
      toast('Password reset. Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1>Choose a new password</h1>
      <p className="lead">Enter a new password for your account.</p>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
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
          {busy ? <span className="spinner" /> : 'Reset password'}
        </button>
      </form>
      <p className="alt"><Link to="/login">Back to sign in</Link></p>
    </AuthShell>
  );
}
