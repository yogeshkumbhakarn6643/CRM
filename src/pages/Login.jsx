import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import { Icon } from '../components/Icons.jsx';
import { useStore, useToast } from '../store/AppStore.jsx';
import { DEMO_LOGIN } from '../data/seed.js';

export default function Login() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState(DEMO_LOGIN.email);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (state.auth.loggedIn) return <Navigate to="/dashboard" replace />;

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    setTimeout(() => {
      dispatch({ type: 'login', user: email !== state.user.email ? { email } : undefined });
      toast(`Welcome back, ${state.user.firstName}`);
      nav(loc.state?.from || '/dashboard', { replace: true });
    }, 650);
  };

  return (
    <AuthShell>
      <header className="auth-head">
        <span className="auth-head__mark" />
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your workspace</h1>
        <p>Use your account details to continue.</p>
      </header>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <div className="auth-field">
          <div className="auth-field__row">
            <label htmlFor="pw">Password</label>
            <button type="button" className="text-btn" onClick={() => toast('Password reset link sent to your email (demo)', 'info')}>
              Forgot password?
            </button>
          </div>
          <div className="auth-password">
            <input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="auth-password__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <Icon.eyeOff width={19} height={19} /> : <Icon.eye width={19} height={19} />}
            </button>
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy} aria-busy={busy}>
          <span>{busy ? 'Signing in…' : 'Sign in'}</span>
          <span className="auth-submit__arrow">→</span>
        </button>
        <button
          type="button"
          className="demo-fill"
          onClick={() => {
            setEmail(DEMO_LOGIN.email);
            setPassword(DEMO_LOGIN.password);
          }}
        >
          <b>Demo access</b>
          <span>
            {DEMO_LOGIN.email} · {DEMO_LOGIN.password}
          </span>
        </button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/register">Create a trader account</Link>
      </p>
    </AuthShell>
  );
}
