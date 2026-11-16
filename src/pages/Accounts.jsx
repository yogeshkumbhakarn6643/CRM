import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, PageHead, Panel, Sparkline, Tabs } from '../components/ui.jsx';
import { money } from '../utils/format.js';
import { ACCOUNT_TYPES } from '../data/seed.js';

export function MarginBar({ used, equity }) {
  const p = equity > 0 ? Math.min(100, (used / equity) * 100) : 0;
  return (
    <div className="acs-bar" title={`${p.toFixed(1)}% of equity used as margin`}>
      <span className="acs-bar__used" style={{ width: `${p}%` }} />
    </div>
  );
}

export default function Accounts() {
  const { state } = useStore();
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('equity');
  const list = state.accounts
    .filter((a) => tab === 'all' || a.mode === tab)
    .sort((a, b) => (sort === 'equity' ? b.equity - a.equity : sort === 'name' ? a.name.localeCompare(b.name) : new Date(b.created) - new Date(a.created)));
  const live = state.accounts.filter((a) => a.mode === 'live');
  const totals = {
    balance: live.reduce((s, a) => s + a.balance, 0),
    equity: live.reduce((s, a) => s + a.equity, 0),
    margin: live.reduce((s, a) => s + a.marginUsed, 0),
  };

  return (
    <>
      <PageHead
        eyebrow="Accounts"
        title="Trading accounts"
        text="Every live and demo account in one place. Balances refresh from the trading server."
        actions={
          <>
            <Link to="/accounts/transfer" className="btn btn--secondary">
              <Icon.transfer width={16} height={16} /> Transfer
            </Link>
            <Link to="/accounts/open" className="btn btn--primary">
              <Icon.plus width={16} height={16} /> Open account
            </Link>
          </>
        }
      />

      <section className="acs-portfolio">
        <div>
          <small>Live balance</small>
          <b className="tnum">{money(totals.balance)}</b>
        </div>
        <div>
          <small>Live equity</small>
          <b className="tnum">{money(totals.equity)}</b>
        </div>
        <div>
          <small>Margin used</small>
          <b className="tnum">{money(totals.margin)}</b>
        </div>
        <div>
          <small>Free margin</small>
          <b className="tnum">{money(totals.equity - totals.margin)}</b>
        </div>
      </section>

      <Panel
        className="acs-panel"
        title="Accounts"
        action={
          <div className="panel-tools">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'all', label: 'All', count: state.accounts.length },
                { id: 'live', label: 'Live', count: live.length },
                { id: 'demo', label: 'Demo', count: state.accounts.length - live.length },
              ]}
            />
            <select className="select-sm" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort accounts">
              <option value="equity">Sort: Equity</option>
              <option value="name">Sort: Name</option>
              <option value="created">Sort: Newest</option>
            </select>
          </div>
        }
      >
        <div className="acs-cards">
          {list.map((a) => {
            const t = ACCOUNT_TYPES.find((x) => x.id === a.type);
            const delta = a.history.length > 1 ? ((a.history.at(-1) - a.history[0]) / (a.history[0] || 1)) * 100 : 0;
            return (
              <Link to={`/accounts/${a.id}`} key={a.id} className="acs-card" data-state={a.mode}>
                <div className="acs-card__top">
                  <span className="badge-mark">{t?.code}</span>
                  <span className="acs-card__name">
                    <b>{a.name}</b>
                    <small>
                      {a.platform} · #{a.id} · {a.server}
                    </small>
                  </span>
                  <Badge status={a.mode}>{a.mode}</Badge>
                </div>
                <div className="acs-card__figure">
                  <div>
                    <small>Equity</small>
                    <strong className="tnum">{money(a.equity, a.currency)}</strong>
                  </div>
                  <span className={`delta delta--soft ${delta >= 0 ? 'is-up' : 'is-down'}`}>
                    {delta >= 0 ? '+' : ''}
                    {delta.toFixed(2)}%
                  </span>
                </div>
                <Sparkline data={a.history} height={44} stroke={a.mode === 'demo' ? 'var(--t-text-4)' : 'var(--t-accent)'} />
                <div className="acs-card__metrics">
                  <div>
                    <small>Balance</small>
                    <b className="tnum">{money(a.balance, a.currency)}</b>
                  </div>
                  <div>
                    <small>Leverage</small>
                    <b>{a.leverage}</b>
                  </div>
                  <div>
                    <small>Positions</small>
                    <b>{a.openPositions}</b>
                  </div>
                </div>
                <div className="acs-card__margin">
                  <div className="acs-card__marginHead">
                    <small>Margin used</small>
                    <small className="tnum">{money(a.marginUsed, a.currency)}</small>
                  </div>
                  <MarginBar used={a.marginUsed} equity={a.equity} />
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>

      <Panel className="acs-panel" eyebrow="Catalogue" title="Account types" action={<Link className="panel__link" to="/accounts/open">Compare and open</Link>}>
        <div className="acs-types">
          {ACCOUNT_TYPES.map((t) => (
            <Link to={`/accounts/open?type=${t.id}`} key={t.id} className="acs-type">
              <span className="badge-mark">{t.code}</span>
              <b>{t.name}</b>
              <p>{t.text}</p>
              <dl>
                <div>
                  <dt>Leverage</dt>
                  <dd>{t.leverage}</dd>
                </div>
                <div>
                  <dt>Spread</dt>
                  <dd>{t.spread}</dd>
                </div>
                <div>
                  <dt>Min. deposit</dt>
                  <dd>{t.minDeposit ? money(t.minDeposit, 'USD', { minimumFractionDigits: 0 }) : '—'}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      </Panel>
    </>
  );
}
