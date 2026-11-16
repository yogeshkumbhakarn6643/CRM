import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Field, PageHead, Panel } from '../components/ui.jsx';
import { money } from '../utils/format.js';
import { ACCOUNT_TYPES } from '../data/seed.js';

const LEVERAGE = ['1:30', '1:50', '1:100', '1:200', '1:500'];

export default function OpenAccount() {
  const [params] = useSearchParams();
  const { dispatch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    type: params.get('type') || 'standard',
    platform: 'MT5',
    currency: 'USD',
    leverage: '1:200',
    nickname: '',
    demoBalance: 10000,
    agree: false,
  });
  const t = ACCOUNT_TYPES.find((x) => x.id === f.type);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    dispatch({ type: 'openAccount', form: f });
    toast(`${t.name} account opened`);
    nav('/accounts');
  };

  return (
    <>
      <PageHead eyebrow="Accounts" title="Open a new account" text="Choose a type, set it up, and confirm. New live accounts start at zero until funded." />
      <ol className="stepper">
        {['Account type', 'Configuration', 'Review'].map((s, i) => (
          <li key={s} className={step === i + 1 ? 'is-current' : step > i + 1 ? 'is-done' : ''}>
            <span>{step > i + 1 ? <Icon.check width={14} height={14} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <Panel title="Select account type">
          <div className="type-pick">
            {ACCOUNT_TYPES.map((x) => (
              <button key={x.id} className={`type-option ${f.type === x.id ? 'is-selected' : ''}`} onClick={() => set('type', x.id)} aria-pressed={f.type === x.id}>
                <span className="type-option__top">
                  <span className="badge-mark">{x.code}</span>
                  <span className="type-option__radio" />
                </span>
                <b>{x.name}</b>
                <p>{x.text}</p>
                <dl>
                  <div>
                    <dt>Spread</dt>
                    <dd>{x.spread}</dd>
                  </div>
                  <div>
                    <dt>Commission</dt>
                    <dd>{x.commission}</dd>
                  </div>
                  <div>
                    <dt>Max leverage</dt>
                    <dd>{x.leverage}</dd>
                  </div>
                  <div>
                    <dt>Min. deposit</dt>
                    <dd>{x.minDeposit ? money(x.minDeposit, 'USD', { minimumFractionDigits: 0 }) : 'None'}</dd>
                  </div>
                </dl>
              </button>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn--ghost" onClick={() => nav('/accounts')}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </Panel>
      )}

      {step === 2 && (
        <Panel title={`Configure ${t.name}`}>
          <div className="form-grid">
            <Field label="Platform">
              <div className="seg seg--wide">
                {['MT5', 'MT4', 'WebTrader'].map((p) => (
                  <button key={p} type="button" className={f.platform === p ? 'is-active' : ''} onClick={() => set('platform', p)}>
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Base currency">
              <select value={f.currency} onChange={(e) => set('currency', e.target.value)}>
                {['USD', 'EUR', 'GBP'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Leverage" hint={`Maximum for ${t.name}: ${t.leverage}`}>
              <select value={f.leverage} onChange={(e) => set('leverage', e.target.value)}>
                {LEVERAGE.filter((l) => +l.split(':')[1] <= +t.leverage.split(':')[1]).map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Nickname (optional)">
              <input value={f.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder={`${t.name} ${f.currency}`} maxLength={32} />
            </Field>
            {f.type === 'demo' && (
              <Field label="Virtual balance">
                <select value={f.demoBalance} onChange={(e) => set('demoBalance', +e.target.value)}>
                  {[1000, 5000, 10000, 50000, 100000].map((v) => (
                    <option key={v} value={v}>
                      {money(v, f.currency, { minimumFractionDigits: 0 })}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <div className="form-actions">
            <button className="btn btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn--primary" onClick={() => setStep(3)}>
              Review
            </button>
          </div>
        </Panel>
      )}

      {step === 3 && (
        <Panel title="Review and confirm">
          <dl className="facts facts--wide">
            {[
              ['Account type', t.name],
              ['Platform', f.platform],
              ['Currency', f.currency],
              ['Leverage', f.leverage],
              ['Nickname', f.nickname || `${t.name} ${f.currency}`],
              ['Starting balance', f.type === 'demo' ? money(f.demoBalance, f.currency) : `${money(0, f.currency)} (fund after opening)`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="notice notice--warn">
            <Icon.info width={18} height={18} />
            <p>Leveraged products carry a high level of risk. Make sure you understand how margin works before funding a live account.</p>
          </div>
          <label className="check">
            <input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)} />
            <span>I confirm the details above and accept the account terms.</span>
          </label>
          <div className="form-actions">
            <button className="btn btn--ghost" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn btn--primary" disabled={!f.agree} onClick={submit}>
              Open account
            </button>
          </div>
        </Panel>
      )}
    </>
  );
}
