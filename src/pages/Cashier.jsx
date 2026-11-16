import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, Empty, Meter, PageHead, Panel, Tabs } from '../components/ui.jsx';
import { accountLabel, dateTime, downloadFile, money } from '../utils/format.js';

const METHODS = [
  { id: 'card', name: 'Card', icon: 'card', time: 'Instant', fee: (a) => +(a * 0.015).toFixed(2), feeText: '1.5%', min: 20, max: 10000 },
  { id: 'bank', name: 'Bank wire', icon: 'bank', time: '1-3 business days', fee: () => 0, feeText: 'Free', min: 100, max: 100000 },
  { id: 'usdt', name: 'USDT (TRC20)', icon: 'coin', time: '~10 minutes', fee: () => 1, feeText: '$1 network', min: 50, max: 50000 },
  { id: 'ewallet', name: 'E-wallet', icon: 'wallet', time: 'Within 1 hour', fee: (a) => +(a * 0.01).toFixed(2), feeText: '1%', min: 20, max: 5000 },
];

export default function Cashier() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'withdraw' ? 'withdraw' : 'deposit');
  const [method, setMethod] = useState('card');
  const [account, setAccount] = useState(params.get('account') || state.accounts.find((a) => a.mode === 'live')?.id || 'wallet');
  const [amount, setAmount] = useState('');
  const [review, setReview] = useState(false);
  const [filter, setFilter] = useState('all');

  const m = METHODS.find((x) => x.id === method);
  const amt = parseFloat(amount) || 0;
  const fee = amt ? m.fee(amt) : 0;
  const targets = [{ id: 'wallet', balance: state.wallet.USD }, ...state.accounts.filter((a) => a.mode === 'live').map((a) => ({ id: a.id, balance: a.balance - a.marginUsed }))];
  const available = targets.find((t) => t.id === account)?.balance || 0;
  const withdraw = tab === 'withdraw';
  const kycBlocked = withdraw && state.kyc.status !== 'verified';
  const error = !amt
    ? ''
    : amt < m.min
      ? `Minimum for ${m.name} is ${money(m.min)}`
      : amt > m.max
        ? `Maximum for ${m.name} is ${money(m.max)}`
        : withdraw && amt > available
          ? `Exceeds available ${money(available)}`
          : '';
  const valid = amt > 0 && !error;

  const monthDeposits = state.transactions.filter((t) => t.kind === 'deposit' && t.status !== 'rejected' && Date.now() - new Date(t.date) < 30 * 86400000).reduce((s, t) => s + t.amount, 0);
  const monthWithdrawals = state.transactions.filter((t) => t.kind === 'withdrawal' && t.status !== 'rejected' && Date.now() - new Date(t.date) < 30 * 86400000).reduce((s, t) => s + t.amount, 0);

  const history = state.transactions.filter((t) => t.kind !== 'transfer' && (filter === 'all' || t.kind === filter || t.status === filter));

  const submit = () => {
    dispatch({
      type: 'cashierRequest',
      tx: { kind: withdraw ? 'withdrawal' : 'deposit', method: m.name, account, amount: amt, fee, autoSettle: !withdraw },
    });
    toast(withdraw ? 'Withdrawal request submitted' : 'Deposit submitted. It will settle in a few seconds');
    setAmount('');
    setReview(false);
  };

  const exportCsv = () => {
    const rows = [['ID', 'Type', 'Method', 'Account', 'Amount', 'Fee', 'Status', 'Date'], ...history.map((t) => [t.id, t.kind, t.method, t.account, t.amount, t.fee, t.status, t.date])];
    downloadFile('cashier-history.csv', rows.map((r) => r.join(',')).join('\n'));
    toast('History exported', 'info');
  };

  return (
    <>
      <PageHead eyebrow="Cashier" title="Fund and withdraw" text="Requests are reviewed against your verified identity. Funds only move to and from accounts in your name." />

      <section className="cash-overview">
        <div className="cash-overview__lead">
          <small>Wallet balance</small>
          <strong className="tnum">{money(state.wallet.USD)}</strong>
          <span className="tnum">+ {money(state.wallet.EUR, 'EUR')}</span>
        </div>
        <div className="cash-overview__holdings">
          {state.accounts
            .filter((a) => a.mode === 'live')
            .map((a) => (
              <div key={a.id}>
                <small>
                  {a.name} · {a.id}
                </small>
                <b className="tnum">{money(a.balance, a.currency)}</b>
              </div>
            ))}
        </div>
      </section>

      <div className="cash-layout">
        <Panel className="cash-panel">
          <Tabs
            value={tab}
            onChange={(v) => {
              setTab(v);
              setReview(false);
            }}
            tabs={[
              { id: 'deposit', label: 'Deposit' },
              { id: 'withdraw', label: 'Withdraw' },
            ]}
          />

          {kycBlocked ? (
            <div className="notice notice--warn">
              <Icon.shield width={18} height={18} />
              <div>
                <b>Verification required</b>
                <p>Complete proof of address and the questionnaire on your profile to enable withdrawals.</p>
                <Link className="panel__link" to="/profile?tab=verification">
                  Go to verification
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h3 className="cash-step">1. Choose a method</h3>
              <div className="cash-methods">
                {METHODS.map((x) => {
                  const I = Icon[x.icon];
                  return (
                    <button key={x.id} className={`cash-method ${method === x.id ? 'is-selected' : ''}`} onClick={() => (setMethod(x.id), setReview(false))} aria-pressed={method === x.id}>
                      <span className="cash-method__mark">
                        <I />
                      </span>
                      <span className="cash-method__text">
                        <b>{x.name}</b>
                        <small>{x.time}</small>
                      </span>
                      <span className="cash-method__fee">{x.feeText}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="cash-step">2. {withdraw ? 'Withdraw from' : 'Deposit to'}</h3>
              <select value={account} onChange={(e) => (setAccount(e.target.value), setReview(false))} aria-label="Account">
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {accountLabel(state.accounts, t.id)} — {money(t.balance)}
                  </option>
                ))}
              </select>

              <h3 className="cash-step">3. Amount</h3>
              <div className={`amount-input amount-input--lg ${error ? 'has-error' : ''}`}>
                <span>$</span>
                <input inputMode="decimal" value={amount} placeholder="0.00" onChange={(e) => (setAmount(e.target.value.replace(/[^\d.]/g, '')), setReview(false))} aria-label="Amount" />
                {withdraw && (
                  <button className="text-btn" onClick={() => setAmount(Math.max(0, available).toFixed(2))}>
                    Max
                  </button>
                )}
              </div>
              {error ? <p className="field__error">{error}</p> : <p className="field__hint">Limits for {m.name}: {money(m.min)} – {money(m.max)}</p>}
              <div className="chips">
                {[100, 250, 500, 1000, 2500].map((v) => (
                  <button key={v} className="chip" onClick={() => (setAmount(String(v)), setReview(false))}>
                    {money(v, 'USD', { minimumFractionDigits: 0 })}
                  </button>
                ))}
              </div>

              <div className="cash-summary">
                <div>
                  <span>Amount</span>
                  <b className="tnum">{money(amt)}</b>
                </div>
                <div>
                  <span>Fee ({m.feeText})</span>
                  <b className="tnum">− {money(fee)}</b>
                </div>
                <div className="cash-summary__net">
                  <span>{withdraw ? 'You receive' : 'Credited to account'}</span>
                  <b className="tnum">{money(Math.max(0, amt - fee))}</b>
                </div>
              </div>

              {review ? (
                <div className="review-box">
                  <div>
                    <small>Confirm {withdraw ? 'withdrawal' : 'deposit'}</small>
                    <strong className="tnum">{money(amt)}</strong>
                    <p>
                      {m.name} · {accountLabel(state.accounts, account)} · {m.time}
                    </p>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn--ghost" onClick={() => setReview(false)}>
                      Edit
                    </button>
                    <button className="btn btn--primary" onClick={submit}>
                      Confirm {withdraw ? 'withdrawal' : 'deposit'}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => setReview(true)}>
                  Continue to review <span aria-hidden="true">→</span>
                </button>
              )}
            </>
          )}
        </Panel>

        <aside className="cash-side">
          <Panel eyebrow="30 days" title="Limits">
            <div className="limit">
              <div className="limit__head">
                <span>Deposits</span>
                <b className="tnum">
                  {money(monthDeposits, 'USD', { minimumFractionDigits: 0 })} / $50,000
                </b>
              </div>
              <Meter value={monthDeposits} total={50000} />
            </div>
            <div className="limit">
              <div className="limit__head">
                <span>Withdrawals</span>
                <b className="tnum">
                  {money(monthWithdrawals, 'USD', { minimumFractionDigits: 0 })} / $25,000
                </b>
              </div>
              <Meter value={monthWithdrawals} total={25000} tone="warn" />
            </div>
          </Panel>
          <Panel title="Good to know">
            <ul className="assurances">
              <li>
                <Icon.shield width={16} height={16} /> Payments only to and from accounts in your own name.
              </li>
              <li>
                <Icon.info width={16} height={16} /> Withdrawals return to the original funding method first.
              </li>
              <li>
                <Icon.check width={16} height={16} /> Requests are reviewed within one business day.
              </li>
            </ul>
          </Panel>
        </aside>
      </div>

      <Panel
        title="Cashier history"
        action={
          <div className="panel-tools">
            <select className="select-sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter history">
              <option value="all">All</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="processing">Processing</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="btn btn--secondary btn--sm" onClick={exportCsv}>
              <Icon.download width={15} height={15} /> CSV
            </button>
          </div>
        }
      >
        {history.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Account</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {history.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Reference">
                      <b>{t.id}</b>
                    </td>
                    <td data-label="Type" className="cap">
                      {t.kind}
                    </td>
                    <td data-label="Method">{t.method}</td>
                    <td data-label="Account">{accountLabel(state.accounts, t.account)}</td>
                    <td data-label="Amount" className={`num tnum ${t.kind === 'deposit' ? 'pos' : ''}`}>
                      {t.kind === 'deposit' ? '+' : '−'}
                      {money(t.amount)}
                    </td>
                    <td data-label="Status">
                      <Badge status={t.status} />
                      {t.note && <small className="row-note">{t.note}</small>}
                    </td>
                    <td data-label="Date">{dateTime(t.date)}</td>
                    <td className="row-actions">
                      {t.status === 'processing' && (
                        <button
                          className="text-btn text-btn--danger"
                          onClick={() => {
                            dispatch({ type: 'cancelTx', id: t.id });
                            toast('Request cancelled', 'info');
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Nothing matches this filter" />
        )}
      </Panel>
    </>
  );
}
