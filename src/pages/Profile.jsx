import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, Field, Meter, Modal, PageHead, Panel, Tabs, Toggle } from '../components/ui.jsx';
import { date, fullName, initials } from '../utils/format.js';

function Personal() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState(state.user);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const fields = [
    ['firstName', 'First name'],
    ['lastName', 'Last name'],
    ['email', 'Email', 'email'],
    ['phone', 'Phone'],
    ['dob', 'Date of birth', 'date'],
    ['country', 'Country'],
    ['city', 'City'],
    ['address', 'Address'],
    ['postcode', 'Postcode'],
  ];
  return (
    <Panel
      title="Personal details"
      action={
        edit ? (
          <div className="panel-tools">
            <button className="btn btn--ghost btn--sm" onClick={() => (setF(state.user), setEdit(false))}>
              Cancel
            </button>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                dispatch({ type: 'user', user: f });
                setEdit(false);
                toast('Profile updated');
              }}
            >
              Save changes
            </button>
          </div>
        ) : (
          <button className="btn btn--secondary btn--sm" onClick={() => setEdit(true)}>
            Edit
          </button>
        )
      }
    >
      {edit ? (
        <div className="form-grid">
          {fields.map(([k, l, type]) => (
            <Field key={k} label={l}>
              <input type={type || 'text'} value={f[k]} onChange={set(k)} />
            </Field>
          ))}
        </div>
      ) : (
        <dl className="facts facts--grid">
          {fields.map(([k, l]) => (
            <div key={k}>
              <dt>{l}</dt>
              <dd>{k === 'dob' ? date(state.user[k]) : state.user[k]}</dd>
            </div>
          ))}
          <div>
            <dt>Client ID</dt>
            <dd>{state.user.clientId}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{date(state.user.memberSince)}</dd>
          </div>
        </dl>
      )}
      <p className="muted small">Changes to legal name or address may require new verification documents.</p>
    </Panel>
  );
}

function Verification() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const fileRef = useRef(null);
  const [target, setTarget] = useState(null);
  const [quiz, setQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const { kyc } = state;
  const done = kyc.steps.filter((s) => s.state === 'done').length;

  const QUESTIONS = [
    { id: 'q1', q: 'How familiar are you with leveraged products?', o: ['New to them', 'Some experience', 'Experienced'] },
    { id: 'q2', q: 'What happens if margin level falls too low?', o: ['Positions may be closed automatically', 'Nothing happens', 'My balance is doubled'] },
    { id: 'q3', q: 'What share of your savings do you plan to fund?', o: ['Under 10%', '10% - 25%', 'Over 25%'] },
  ];

  return (
    <>
      <Panel
        eyebrow="Identity"
        title={kyc.status === 'verified' ? 'You are fully verified' : 'Verification progress'}
        action={<Badge status={kyc.status}>{kyc.status === 'verified' ? 'Verified' : 'In review'}</Badge>}
      >
        <div className="kyc-progress">
          <div className="kyc-progress__head">
            <span>
              {done} of {kyc.steps.length} steps
            </span>
            <b>{Math.round((done / kyc.steps.length) * 100)}%</b>
          </div>
          <Meter value={done} total={kyc.steps.length} />
        </div>
        <ol className="kyc-steps">
          {kyc.steps.map((s, i) => (
            <li key={s.id} className={`is-${s.state}`}>
              <span className="kyc-steps__mark">{s.state === 'done' ? <Icon.check width={14} height={14} /> : i + 1}</span>
              <span className="kyc-steps__text">
                <b>{s.label}</b>
                <small>{s.state === 'done' ? (s.file ? `Uploaded: ${s.file}` : 'Complete') : s.state === 'pending' ? 'Waiting for your document' : 'Not started'}</small>
              </span>
              {s.state !== 'done' &&
                (s.id === 'questionnaire' ? (
                  <button className="btn btn--secondary btn--sm" onClick={() => setQuiz(true)}>
                    Start
                  </button>
                ) : (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      setTarget(s.id);
                      fileRef.current?.click();
                    }}
                  >
                    <Icon.upload width={15} height={15} /> Upload
                  </button>
                ))}
            </li>
          ))}
        </ol>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && target) {
              dispatch({ type: 'kycUpload', id: target, file: file.name });
              toast(`${file.name} uploaded`);
            }
            e.target.value = '';
          }}
        />
      </Panel>
      <Panel title="Accepted documents">
        <div className="doc-grid">
          <div>
            <b>Identity</b>
            <p>Passport, national ID card or driving licence. All four corners visible.</p>
          </div>
          <div>
            <b>Address</b>
            <p>Utility bill or bank statement from the last 3 months with your full name.</p>
          </div>
        </div>
      </Panel>

      <Modal
        open={quiz}
        onClose={() => setQuiz(false)}
        title="Suitability questionnaire"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setQuiz(false)}>
              Later
            </button>
            <button
              className="btn btn--primary"
              disabled={Object.keys(answers).length < QUESTIONS.length}
              onClick={() => {
                dispatch({ type: 'kycUpload', id: 'questionnaire', file: null });
                setQuiz(false);
                toast('Questionnaire submitted');
              }}
            >
              Submit answers
            </button>
          </>
        }
      >
        {QUESTIONS.map((q) => (
          <fieldset key={q.id} className="quiz">
            <legend>{q.q}</legend>
            {q.o.map((o) => (
              <label key={o} className={`radio-card ${answers[q.id] === o ? 'is-selected' : ''}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === o} onChange={() => setAnswers({ ...answers, [q.id]: o })} />
                {o}
              </label>
            ))}
          </fieldset>
        ))}
      </Modal>
    </>
  );
}

function Security() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [tfa, setTfa] = useState(false);
  const [code, setCode] = useState('');
  const strength = [pw.next.length >= 8, /[A-Z]/.test(pw.next), /\d/.test(pw.next), /[^\w]/.test(pw.next)].filter(Boolean).length;
  const sessions = [
    { device: 'Chrome on Windows', place: 'Manchester, UK', when: 'Active now', current: true },
    { device: 'Safari on iPhone', place: 'Manchester, UK', when: '2 hours ago' },
    { device: 'Firefox on macOS', place: 'London, UK', when: '4 days ago' },
  ];
  const [list, setList] = useState(sessions);

  return (
    <>
      <div className="two-col">
        <Panel title="Change password">
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              setPw({ current: '', next: '', confirm: '' });
              toast('Password changed');
            }}
          >
            <Field label="Current password">
              <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
            </Field>
            <Field label="New password">
              <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
            </Field>
            <div className="strength" data-level={strength}>
              <span />
              <span />
              <span />
              <span />
              <small>{['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]}</small>
            </div>
            <Field label="Confirm new password" error={pw.confirm && pw.confirm !== pw.next ? 'Passwords do not match' : ''}>
              <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
            </Field>
            <button className="btn btn--primary" disabled={!pw.current || strength < 3 || pw.next !== pw.confirm}>
              Update password
            </button>
          </form>
        </Panel>
        <Panel title="Two-step login">
          <div className="security-state">
            <span className={`security-state__icon ${state.user.twoFactor ? 'is-on' : ''}`}>
              <Icon.shield />
            </span>
            <div>
              <b>{state.user.twoFactor ? 'Enabled' : 'Not enabled'}</b>
              <p className="muted">{state.user.twoFactor ? 'A code from your authenticator app is required at sign-in.' : 'Add an authenticator app for a second layer of protection.'}</p>
            </div>
          </div>
          {state.user.twoFactor ? (
            <button
              className="btn btn--secondary btn--block"
              onClick={() => {
                dispatch({ type: 'user', user: { twoFactor: false } });
                toast('Two-step login disabled', 'info');
              }}
            >
              Disable
            </button>
          ) : (
            <button className="btn btn--primary btn--block" onClick={() => setTfa(true)}>
              Set up authenticator
            </button>
          )}
        </Panel>
      </div>
      <Panel title="Active sessions">
        <ul className="sessions">
          {list.map((s) => (
            <li key={s.device}>
              <span>
                <b>{s.device}</b>
                <small>
                  {s.place} · {s.when}
                </small>
              </span>
              {s.current ? (
                <Badge status="live">This device</Badge>
              ) : (
                <button
                  className="text-btn text-btn--danger"
                  onClick={() => {
                    setList(list.filter((x) => x !== s));
                    toast('Session signed out', 'info');
                  }}
                >
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      </Panel>
      <Modal
        open={tfa}
        onClose={() => setTfa(false)}
        title="Set up two-step login"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setTfa(false)}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              disabled={code.length !== 6}
              onClick={() => {
                dispatch({ type: 'user', user: { twoFactor: true } });
                const c = state.challenges.find((x) => x.id === 'c2');
                if (c && c.progress < c.total) dispatch({ type: 'challengeStep', id: 'c2' });
                setTfa(false);
                setCode('');
                toast('Two-step login enabled. +250 pts');
              }}
            >
              Verify and enable
            </button>
          </>
        }
      >
        <div className="tfa">
          <div className="tfa__qr" aria-label="QR code placeholder">
            {Array.from({ length: 81 }).map((_, i) => (
              <span key={i} className={(i * 7 + (i % 5)) % 3 === 0 ? 'on' : ''} />
            ))}
          </div>
          <div>
            <p>1. Scan this code with your authenticator app.</p>
            <p>
              2. Or enter key: <code>NVTR 4K2Q 9XPL 7MZA</code>
            </p>
            <p>3. Enter the 6-digit code it shows (any 6 digits work in this demo).</p>
            <input className="code-input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
          </div>
        </div>
      </Modal>
    </>
  );
}

function Preferences() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const p = state.prefs;
  const set = (k) => (v) => dispatch({ type: 'prefs', prefs: { [k]: v } });
  return (
    <div className="two-col">
      <Panel title="Display">
        <Field label="Theme">
          <div className="seg seg--wide">
            {['light', 'dark'].map((t) => (
              <button key={t} type="button" className={p.theme === t ? 'is-active' : ''} onClick={() => set('theme')(t)}>
                {t === 'light' ? <Icon.sun width={15} height={15} /> : <Icon.moon width={15} height={15} />} {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Language">
          <select value={p.language} onChange={(e) => set('language')(e.target.value)}>
            {['English', 'Français', 'Español', 'Deutsch', 'Italiano', 'Português', 'हिन्दी', '中文'].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Display currency">
          <select value={p.currency} onChange={(e) => set('currency')(e.target.value)}>
            {['USD', 'EUR', 'GBP'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </Panel>
      <Panel title="Notifications">
        <Toggle label="Email alerts" text="Funding, verification and security updates" checked={p.emailAlerts} onChange={set('emailAlerts')} />
        <Toggle label="SMS alerts" text="Security codes and withdrawals" checked={p.smsAlerts} onChange={set('smsAlerts')} />
        <Toggle label="Push notifications" text="In-browser alerts" checked={p.pushAlerts} onChange={set('pushAlerts')} />
        <Toggle label="Weekly digest" text="A summary of your accounts each Monday" checked={p.weeklyDigest} onChange={set('weeklyDigest')} />
        <Toggle label="Product news" text="Occasional updates about new features" checked={p.marketing} onChange={set('marketing')} />
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => {
            if (window.confirm('Reset all demo data to the starting state?')) {
              dispatch({ type: 'reset' });
              toast('Demo data reset', 'info');
            }
          }}
        >
          Reset demo data
        </button>
      </Panel>
    </div>
  );
}

export default function Profile() {
  const { state } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'personal';
  const { user } = state;
  return (
    <>
      <PageHead eyebrow="Account" title="Profile & security" />
      <section className="profile-hero">
        <span className="avatar avatar--lg">{initials(user)}</span>
        <div>
          <h2>
            {fullName(user)}
          </h2>
          <p>
            {user.email} · {user.clientId}
          </p>
        </div>
        <div className="profile-hero__tags">
          <Badge status={state.kyc.status}>{state.kyc.status === 'verified' ? 'Verified' : 'Verification in review'}</Badge>
          <Badge status="open">{user.tier} tier</Badge>
          {user.twoFactor && <Badge status="done">2FA on</Badge>}
        </div>
      </section>
      <Tabs
        value={tab}
        onChange={(v) => setParams({ tab: v })}
        tabs={[
          { id: 'personal', label: 'Personal' },
          { id: 'verification', label: 'Verification' },
          { id: 'security', label: 'Security' },
          { id: 'preferences', label: 'Preferences' },
        ]}
      />
      <div className="tab-body">
        {tab === 'personal' && <Personal />}
        {tab === 'verification' && <Verification />}
        {tab === 'security' && <Security />}
        {tab === 'preferences' && <Preferences />}
      </div>
    </>
  );
}
