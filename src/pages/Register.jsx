import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import { useStore, useToast } from '../store/AppStore.jsx';

const COUNTRIES = ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'India', 'United Arab Emirates', 'Singapore', 'Australia'];

export default function Register() {
  const { dispatch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', phone: '', country: 'United Kingdom', password: '', confirm: '', terms: false });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const next = (e) => {
    e.preventDefault();
    setErr('');
    if (step === 1) {
      if (!f.firstName || !f.lastName) return setErr('Enter your first and last name.');
      if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.');
      return setStep(2);
    }
    if (f.password.length < 8) return setErr('Password must be at least 8 characters.');
    if (f.password !== f.confirm) return setErr('Passwords do not match.');
    if (!f.terms) return setErr('Please accept the client agreement.');
    dispatch({ type: 'login', user: { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone, country: f.country } });
    toast('Account created. Welcome to NovaTrade');
    nav('/dashboard');
  };

  return (
    <AuthShell story={{ title: 'Open your trader workspace.', text: 'Two quick steps. Verification and funding happen inside the portal when you are ready.' }}>
      <header className="auth-head">
        <span className="auth-head__mark" />
        <p className="eyebrow">Step {step} of 2</p>
        <h1>{step === 1 ? 'Create a trader account' : 'Secure your account'}</h1>
        <p>{step === 1 ? 'Tell us who you are.' : 'Choose a password and confirm the agreement.'}</p>
      </header>
      <div className="steps-dots">
        <span className="is-on" />
        <span className={step === 2 ? 'is-on' : ''} />
      </div>
      <form className="auth-form" onSubmit={next} noValidate>
        {step === 1 ? (
          <>
            <div className="form-row">
              <label>
                First name
                <input value={f.firstName} onChange={set('firstName')} autoComplete="given-name" />
              </label>
              <label>
                Last name
                <input value={f.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </label>
            </div>
            <label>
              Email
              <input type="email" value={f.email} onChange={set('email')} autoComplete="email" />
            </label>
            <div className="form-row">
              <label>
                Phone
                <input value={f.phone} onChange={set('phone')} placeholder="+44 7700 900000" />
              </label>
              <label>
                Country
                <select value={f.country} onChange={set('country')}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          </>
        ) : (
          <>
            <label>
              Password
              <input type="password" value={f.password} onChange={set('password')} autoComplete="new-password" />
            </label>
            <label>
              Confirm password
              <input type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </label>
            <label className="check">
              <input type="checkbox" checked={f.terms} onChange={set('terms')} />
              <span>I agree to the client agreement and risk disclosure.</span>
            </label>
          </>
        )}
        {err && <p className="form-error">{err}</p>}
        <div className="auth-actions">
          {step === 2 && (
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
          )}
          <button className="auth-submit" type="submit">
            <span>{step === 1 ? 'Continue' : 'Create account'}</span>
            <span className="auth-submit__arrow">→</span>
          </button>
        </div>
      </form>
      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
