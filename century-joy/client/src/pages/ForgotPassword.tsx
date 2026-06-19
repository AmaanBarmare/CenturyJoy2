import { useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints, apiError } from '../lib/api';
import { AuthShell } from '../components/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await endpoints.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1>Reset password</h1>
      {sent ? (
        <>
          <p className="lead">
            If an account exists for <b>{email}</b>, a reset link is on its way. The link expires in 30 minutes.
          </p>
          <p className="alt"><Link to="/login">Back to sign in</Link></p>
        </>
      ) : (
        <>
          <p className="lead">Enter your email and we'll send you a link to reset your password.</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? <span className="spinner" /> : 'Send reset link'}
            </button>
          </form>
          <p className="alt"><Link to="/login">Back to sign in</Link></p>
        </>
      )}
    </AuthShell>
  );
}
