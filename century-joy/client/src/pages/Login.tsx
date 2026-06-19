import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { AuthShell } from '../components/AuthShell';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      if (user.mustChangePassword) {
        navigate('/set-password', { state: { email } });
      } else {
        navigate(user.role === 'client' ? '/client' : `/${user.role}`);
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1>Sign in</h1>
      <p className="lead">Welcome back. Enter your credentials to access your portal.</p>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Sign in'}
        </button>
      </form>
      <p className="alt"><Link to="/forgot-password">Forgot your password?</Link></p>
    </AuthShell>
  );
}
