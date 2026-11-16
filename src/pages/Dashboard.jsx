import { Link } from 'react-router-dom';
import { useStore } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, Meter, Panel, PanelLink, Ring, Sparkline } from '../components/ui.jsx';
import { accountLabel, money, num, pct, relative } from '../utils/format.js';
import { ACCOUNT_TYPES } from '../data/seed.js';

export function TxRow({ tx, accounts }) {
  const sign = tx.kind === 'deposit' ? '+' : tx.kind === 'withdrawal' ? '−' : '';
  const I = tx.kind === 'deposit' ? Icon.arrowDown : tx.kind === 'withdrawal' ? Icon.arrowUp : Icon.transfer;
  const where = tx.kind === 'transfer' ? `${accountLabel(accounts, tx.from)} → ${accountLabel(accounts, tx.to)}` : `${tx.method} · ${accountLabel(accounts, tx.account)}`;
  return (
    <li className="tx-row">
      <span className={`tx-row__mark tx-row__mark--${tx.kind}`}>
        <I width={16} height={16} />
      </span>
      <span className="tx-row__text">
        <b>{tx.kind[0].toUpperCase() + tx.kind.slice(1)}</b>
        <small>{where}</small>
      </span>
      <span className="tx-row__end">
        <b className={`tnum ${tx.kind === 'deposit' ? 'pos' : ''}`}>
          {sign}
          {money(tx.amount)}
        </b>
        <small>
          <Badge status={tx.status} /> {relative(tx.date)}
        </small>
      </span>
    </li>
  );
}

export default function Dashboard() {
  const { state } = useStore();
  const { user, accounts, wallet, transactions, rewards, kyc, challenges } = state;
  const live = accounts.filter((a) => a.mode === 'live');
  const equity = live.reduce((s, a) => s + a.equity, 0) + wallet.USD;
  const balance = live.reduce((s, a) => s + a.balance, 0);
  const margin = live.reduce((s, a) => s + a.marginUsed, 0);
  const totalEq = live.reduce((s, a) => s + a.equity, 0);
  const marginLevel = margin ? (totalEq / margin) * 100 : 0;
  const hist = live[0]
    ? live[0].history.map((_, i) => live.reduce((s, a) => s + (a.history[i] ?? a.balance), 0) + wallet.USD)
    : [0];
  const change = hist.length > 1 ? ((hist[hist.length - 1] - hist[0]) / hist[0]) * 100 : 0;
  const kycDone = kyc.steps.filter((s) => s.state === 'done').length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const pending = transactions.filter((t) => t.status === 'processing');
  const nextChallenge = challenges.find((c) => c.progress < c.total);

  return (
    <div className="dash">
      <header className="dash-greeting">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1>
            {greet}, {user.firstName}
          </h1>
          <p>Here is where your accounts, funding and verification stand today.</p>
        </div>
        <div className="dash-greeting__actions">
          <Link to="/accounts/open" className="btn btn--secondary">
            <Icon.plus width={16} height={16} /> Open account
          </Link>
          <Link to="/cashier" className="btn btn--primary">
            <Icon.cashier width={16} height={16} /> Deposit
          </Link>
        </div>
      </header>

      <section className="portfolio">
        <div className="portfolio__lead">
          <p className="eyebrow">Total equity · live accounts + wallet</p>
          <strong className="portfolio__figure tnum">{money(equity)}</strong>
          <span className={`delta ${change >= 0 ? 'is-up' : 'is-down'}`}>
            {change >= 0 ? <Icon.arrowUp width={13} height={13} /> : <Icon.arrowDown width={13} height={13} />}
            {pct(change)} last 30 days
          </span>
          <Sparkline data={hist} height={70} className="portfolio__chart" stroke="#4fd8c0" />
          <div className="portfolio__stats">
            <div>
              <small>Balance</small>
              <b className="tnum">{money(balance)}</b>
            </div>
            <div>
              <small>Margin used</small>
              <b className="tnum">{money(margin)}</b>
            </div>
            <div>
              <small>Live accounts</small>
              <b>{live.length}</b>
            </div>
          </div>
        </div>
        <div className="portfolio__side">
          <div className="portfolio__wallet">
            <span className="portfolio__walletIcon">
              <Icon.wallet />
            </span>
            <div>
              <small>Wallet</small>
              <b className="tnum">{money(wallet.USD)}</b>
              <span className="tnum">{money(wallet.EUR, 'EUR')}</span>
            </div>
          </div>
          <div className="portfolio__margin">
            <Ring value={Math.min(100, marginLevel / 10)} label={`${Math.round(marginLevel)}%`} dark />
            <div>
              <small>Margin level</small>
              <b>{marginLevel > 300 ? 'Healthy' : marginLevel > 150 ? 'Watch' : 'At risk'}</b>
              <span>Equity ÷ margin across live accounts</span>
            </div>
          </div>
          <div className="portfolio__actions">
            <Link to="/cashier">Deposit</Link>
            <Link to="/cashier?tab=withdraw">Withdraw</Link>
            <Link to="/accounts/transfer">Transfer</Link>
          </div>
        </div>
      </section>

      {kyc.status !== 'verified' && (
        <div className="attention">
          <span className="attention__icon">
            <Icon.shield />
          </span>
          <div>
            <b>Finish verification to unlock withdrawals</b>
            <p>
              {kycDone} of {kyc.steps.length} steps complete. Next: {kyc.steps.find((s) => s.state !== 'done')?.label}.
            </p>
          </div>
          <Link to="/profile?tab=verification" className="btn btn--secondary btn--sm">
            Continue
          </Link>
        </div>
      )}

      <div className="dash-columns">
        <div className="dash-main">
          <Panel eyebrow="Trading accounts" title="Your accounts" action={<PanelLink to="/accounts">View all</PanelLink>}>
            <div className="account-cards">
              {accounts.map((a) => {
                const t = ACCOUNT_TYPES.find((x) => x.id === a.type);
                const pl = a.equity - a.balance;
                return (
                  <Link key={a.id} to={`/accounts/${a.id}`} className="account-card" data-state={a.mode}>
                    <div className="account-card__top">
                      <span className="badge-mark">{t?.code}</span>
                      <span className="account-card__name">
                        <b>{a.name}</b>
                        <small>
                          {a.platform} · {a.id}
                        </small>
                      </span>
                      <Badge status={a.mode}>{a.mode}</Badge>
                    </div>
                    <strong className="tnum">{money(a.equity, a.currency)}</strong>
                    <Sparkline data={a.history} height={36} stroke={a.mode === 'demo' ? 'var(--t-text-4)' : 'var(--t-accent)'} />
                    <div className="account-card__foot">
                      <span>Floating P/L</span>
                      <b className={`tnum ${pl >= 0 ? 'pos' : 'neg'}`}>
                        {pl >= 0 ? '+' : ''}
                        {money(pl, a.currency)}
                      </b>
                    </div>
                  </Link>
                );
              })}
              <Link to="/accounts/open" className="account-card account-card--add">
                <Icon.plus />
                <b>Open new account</b>
                <small>Live or demo, on MT5</small>
              </Link>
            </div>
          </Panel>

          <Panel eyebrow="Cashier" title="Recent activity" action={<PanelLink to="/cashier">Full history</PanelLink>}>
            <ul className="tx-list">
              {transactions.slice(0, 5).map((t) => (
                <TxRow key={t.id} tx={t} accounts={accounts} />
              ))}
            </ul>
          </Panel>
        </div>

        <aside className="dash-side">
          <Panel eyebrow="Rewards" title="Points balance" action={<PanelLink to="/rewards">Open</PanelLink>}>
            <div className="mini-reward">
              <Ring value={(rewards.points / rewards.nextTarget) * 100} />
              <div>
                <strong className="tnum">{num(rewards.points)}</strong>
                <small>{num(Math.max(0, rewards.nextTarget - rewards.points))} pts to your next tier reward</small>
              </div>
            </div>
            {nextChallenge && (
              <div className="mini-challenge">
                <div className="mini-challenge__head">
                  <b>{nextChallenge.title}</b>
                  <span className="tnum">
                    {nextChallenge.progress}/{nextChallenge.total}
                  </span>
                </div>
                <Meter value={nextChallenge.progress} total={nextChallenge.total} />
                <small>+{nextChallenge.reward} pts on completion</small>
              </div>
            )}
          </Panel>

          <Panel eyebrow="Requests" title="Pending" action={<PanelLink to="/cashier">Cashier</PanelLink>}>
            {pending.length ? (
              <ul className="pending-list">
                {pending.map((t) => (
                  <li key={t.id}>
                    <span>
                      <b>
                        {t.kind === 'deposit' ? 'Deposit' : 'Withdrawal'} {money(t.amount)}
                      </b>
                      <small>
                        {t.method} · {t.id}
                      </small>
                    </span>
                    <Badge status="processing" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Nothing waiting. All requests are settled.</p>
            )}
          </Panel>

          <div className="dashboard-links">
            <Link to="/statements">
              <Icon.statements />
              <strong>Statements</strong>
              <span>Monthly and custom reports</span>
            </Link>
            <Link to="/support">
              <Icon.support />
              <strong>Support</strong>
              <span>Tickets and live chat</span>
            </Link>
            <Link to="/live">
              <Icon.live />
              <strong>Live arena</strong>
              <span>Community market picks</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
