import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Empty, Field, PageHead, Panel } from '../components/ui.jsx';
import { accountLabel, money } from '../utils/format.js';
import { TxRow } from './Dashboard.jsx';

export default function Transfer() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [params] = useSearchParams();
  const sources = [{ id: 'wallet', balance: state.wallet.USD }, ...state.accounts.filter((a) => a.mode === 'live').map((a) => ({ id: a.id, balance: a.balance - a.marginUsed }))];
  const [from, setFrom] = useState(params.get('from') || 'wallet');
  const [to, setTo] = useState(sources.find((s) => s.id !== (params.get('from') || 'wallet'))?.id || '');
  const [amount, setAmount] = useState('');
  const [confirm, setConfirm] = useState(false);
  const available = sources.find((s) => s.id === from)?.balance || 0;
  const amt = parseFloat(amount) || 0;
  const error = !amt ? '' : amt > available ? `Exceeds available ${money(available)}` : amt < 10 ? 'Minimum transfer is $10.00' : from === to ? 'Choose two different accounts' : '';
  const valid = amt >= 10 && !error && to;
  const history = state.transactions.filter((t) => t.kind === 'transfer');

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = () => {
    dispatch({ type: 'transfer', from, to, amount: amt });
    toast(`${money(amt)} transferred`);
    setAmount('');
    setConfirm(false);
  };

  return (
    <>
      <PageHead eyebrow="Accounts" title="Internal transfer" text="Move funds instantly between your wallet and live accounts. No fees apply." />
      <div className="transfer-layout">
        <Panel title="New transfer">
          <div className="transfer-form">
            <Field label="From">
              <select value={from} onChange={(e) => (setFrom(e.target.value), setConfirm(false))}>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {accountLabel(state.accounts, s.id)} — {money(s.balance)}
                  </option>
                ))}
              </select>
            </Field>
            <button className="transfer-swap" onClick={swap} aria-label="Swap accounts" type="button">
              <Icon.transfer />
            </button>
            <Field label="To">
              <select value={to} onChange={(e) => (setTo(e.target.value), setConfirm(false))}>
                {sources
                  .filter((s) => s.id !== from)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {accountLabel(state.accounts, s.id)}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <Field label="Amount (USD)" error={error} hint={`Available to transfer: ${money(available)}`}>
            <div className="amount-input">
              <span>$</span>
              <input inputMode="decimal" value={amount} onChange={(e) => (setAmount(e.target.value.replace(/[^\d.]/g, '')), setConfirm(false))} placeholder="0.00" />
              <button type="button" className="text-btn" onClick={() => setAmount(Math.max(0, available).toFixed(2))}>
                Max
              </button>
            </div>
          </Field>
          <div className="chips">
            {[100, 250, 500, 1000].map((v) => (
              <button key={v} type="button" className="chip" onClick={() => setAmount(String(v))}>
                {money(v, 'USD', { minimumFractionDigits: 0 })}
              </button>
            ))}
          </div>

          {confirm ? (
            <div className="review-box">
              <div>
                <small>You are moving</small>
                <strong className="tnum">{money(amt)}</strong>
                <p>
                  {accountLabel(state.accounts, from)} → {accountLabel(state.accounts, to)}
                </p>
              </div>
              <div className="form-actions">
                <button className="btn btn--ghost" onClick={() => setConfirm(false)}>
                  Edit
                </button>
                <button className="btn btn--primary" onClick={submit}>
                  Confirm transfer
                </button>
              </div>
            </div>
          ) : (
            <div className="form-actions">
              <button className="btn btn--primary btn--block-sm" disabled={!valid} onClick={() => setConfirm(true)}>
                Review transfer
              </button>
            </div>
          )}
        </Panel>

        <Panel eyebrow="Balances" title="Where your money is">
          <ul className="balance-list">
            {sources.map((s) => (
              <li key={s.id}>
                <span>
                  <b>{accountLabel(state.accounts, s.id)}</b>
                  <small>{s.id === 'wallet' ? 'Instant, no fees' : 'Free margin available'}</small>
                </span>
                <b className="tnum">{money(s.balance)}</b>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Transfer history">
        {history.length ? (
          <ul className="tx-list">
            {history.map((t) => (
              <TxRow key={t.id} tx={t} accounts={state.accounts} />
            ))}
          </ul>
        ) : (
          <Empty title="No transfers yet" />
        )}
      </Panel>
    </>
  );
}
