import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, Empty, Field, Modal, PageHead, Panel, Sparkline } from '../components/ui.jsx';
import { date, money } from '../utils/format.js';
import { ACCOUNT_TYPES } from '../data/seed.js';
import { TxRow } from './Dashboard.jsx';
import { MarginBar } from './Accounts.jsx';

export default function AccountDetail() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [rename, setRename] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [name, setName] = useState('');
  const [pw, setPw] = useState({ next: '', confirm: '', show: false });
  const [range, setRange] = useState(30);

  const a = state.accounts.find((x) => x.id === id);
  if (!a)
    return (
      <Empty title="Account not found" text={`No account with number ${id}.`} action={<Link className="btn btn--primary" to="/accounts">Back to accounts</Link>} />
    );
  const t = ACCOUNT_TYPES.find((x) => x.id === a.type);
  const txs = state.transactions.filter((x) => x.account === a.id || x.from === a.id || x.to === a.id);
  const free = a.equity - a.marginUsed;
  const level = a.marginUsed ? (a.equity / a.marginUsed) * 100 : 0;
  const hist = a.history.slice(-range);

  const copy = (v) => {
    navigator.clipboard?.writeText(v);
    toast('Copied to clipboard', 'info');
  };

  const pwRules = [
    { ok: pw.next.length >= 8, text: 'At least 8 characters' },
    { ok: /[A-Z]/.test(pw.next) && /[a-z]/.test(pw.next), text: 'Upper and lower case letters' },
    { ok: /\d/.test(pw.next), text: 'At least one number' },
    { ok: pw.next && pw.next === pw.confirm, text: 'Passwords match' },
  ];

  return (
    <>
      <nav className="crumbs">
        <Link to="/accounts">Accounts</Link>
        <Icon.chevron width={13} height={13} />
        <span>{a.id}</span>
      </nav>
      <PageHead
        eyebrow={`${t?.name} · ${a.platform}`}
        title={a.name}
        text={`Account #${a.id} on ${a.server}. Opened ${date(a.created)}.`}
        actions={
          <>
            <button className="btn btn--secondary" onClick={() => (setName(a.name), setRename(true))}>
              Rename
            </button>
            {a.mode === 'demo' ? (
              <button
                className="btn btn--primary"
                onClick={() => {
                  dispatch({ type: 'resetDemo', id: a.id });
                  toast('Demo balance reset to $10,000');
                }}
              >
                Reset demo balance
              </button>
            ) : (
              <Link to={`/cashier?account=${a.id}`} className="btn btn--primary">
                Fund account
              </Link>
            )}
          </>
        }
      />

      <div className="detail-grid">
        <Panel className="chart-panel" eyebrow="Equity" title={money(a.equity, a.currency)} action={
          <div className="seg">
            {[7, 14, 30].map((r) => (
              <button key={r} className={range === r ? 'is-active' : ''} onClick={() => setRange(r)}>
                {r}D
              </button>
            ))}
          </div>
        }>
          <Sparkline data={hist} height={160} className="chart-lg" />
          <div className="metric-grid">
            <div>
              <small>Balance</small>
              <b className="tnum">{money(a.balance, a.currency)}</b>
            </div>
            <div>
              <small>Floating P/L</small>
              <b className={`tnum ${a.equity - a.balance >= 0 ? 'pos' : 'neg'}`}>{money(a.equity - a.balance, a.currency)}</b>
            </div>
            <div>
              <small>Free margin</small>
              <b className="tnum">{money(free, a.currency)}</b>
            </div>
            <div>
              <small>Margin level</small>
              <b className="tnum">{level ? `${level.toFixed(0)}%` : '—'}</b>
            </div>
          </div>
          <div className="acs-card__margin">
            <div className="acs-card__marginHead">
              <small>Margin used {money(a.marginUsed, a.currency)}</small>
              <small>{a.openPositions} open positions</small>
            </div>
            <MarginBar used={a.marginUsed} equity={a.equity} />
          </div>
        </Panel>

        <Panel eyebrow="Connection" title="Platform login">
          <dl className="facts">
            {[
              ['Login', a.id],
              ['Server', a.server],
              ['Platform', a.platform],
              ['Leverage', a.leverage],
              ['Currency', a.currency],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>
                  {v}
                  {(k === 'Login' || k === 'Server') && (
                    <button className="icon-btn icon-btn--xs" onClick={() => copy(v)} aria-label={`Copy ${k}`}>
                      <Icon.copy width={14} height={14} />
                    </button>
                  )}
                </dd>
              </div>
            ))}
            <div>
              <dt>Status</dt>
              <dd>
                <Badge status={a.mode}>{a.mode}</Badge>
              </dd>
            </div>
          </dl>
          <div className="stack-actions">
            <button className="btn btn--secondary btn--block" onClick={() => setPwOpen(true)}>
              <Icon.shield width={16} height={16} /> Change {a.platform} password
            </button>
            {a.mode === 'live' && (
              <button className="btn btn--ghost btn--block" onClick={() => nav(`/accounts/transfer?from=${a.id}`)}>
                <Icon.transfer width={16} height={16} /> Transfer funds
              </button>
            )}
          </div>
        </Panel>
      </div>

      <Panel eyebrow="History" title="Account activity">
        {txs.length ? (
          <ul className="tx-list">
            {txs.map((x) => (
              <TxRow key={x.id} tx={x} accounts={state.accounts} />
            ))}
          </ul>
        ) : (
          <Empty title="No activity yet" text="Deposits, withdrawals and transfers for this account appear here." />
        )}
      </Panel>

      <Modal
        open={rename}
        onClose={() => setRename(false)}
        title="Rename account"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setRename(false)}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              disabled={!name.trim()}
              onClick={() => {
                dispatch({ type: 'renameAccount', id: a.id, name: name.trim() });
                setRename(false);
                toast('Account renamed');
              }}
            >
              Save
            </button>
          </>
        }
      >
        <Field label="Nickname" hint="Only visible to you inside the portal.">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} autoFocus />
        </Field>
      </Modal>

      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title={`New ${a.platform} password`}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setPwOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              disabled={!pwRules.every((r) => r.ok)}
              onClick={() => {
                setPwOpen(false);
                setPw({ next: '', confirm: '', show: false });
                toast(`${a.platform} password updated for #${a.id}`);
              }}
            >
              Update password
            </button>
          </>
        }
      >
        <p className="muted">This changes the trading password for login #{a.id}. Open sessions will be signed out.</p>
        <Field label="New password">
          <input type={pw.show ? 'text' : 'password'} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        </Field>
        <Field label="Confirm password">
          <input type={pw.show ? 'text' : 'password'} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
        </Field>
        <label className="check">
          <input type="checkbox" checked={pw.show} onChange={(e) => setPw({ ...pw, show: e.target.checked })} />
          <span>Show passwords</span>
        </label>
        <ul className="rules">
          {pwRules.map((r) => (
            <li key={r.text} className={r.ok ? 'is-ok' : ''}>
              <Icon.check width={14} height={14} /> {r.text}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
