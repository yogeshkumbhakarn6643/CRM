import { useEffect, useState } from 'react';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { PageHead, Panel, Tabs } from '../components/ui.jsx';
import { num, relative } from '../utils/format.js';

const TICKERS = [
  { s: 'EUR/USD', p: 1.0874 },
  { s: 'GBP/USD', p: 1.2712 },
  { s: 'USD/JPY', p: 151.42 },
  { s: 'XAU/USD', p: 2384.1 },
  { s: 'US500', p: 5321.4 },
  { s: 'BTC/USD', p: 67210 },
];

function useTicker() {
  const [rows, setRows] = useState(TICKERS.map((t) => ({ ...t, ch: 0 })));
  useEffect(() => {
    const id = setInterval(() => {
      setRows((r) =>
        r.map((t) => {
          const move = (Math.random() - 0.5) * 0.0016 * t.p;
          return { ...t, p: t.p + move, ch: t.ch + (move / t.p) * 100 };
        }),
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return rows;
}

export default function Live() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('open');
  const ticker = useTicker();
  const { matches, board } = state.arena;
  const list = matches.filter((m) => m.status === tab);

  return (
    <>
      <PageHead eyebrow="Community" title="Live arena" text="Share your market view and compare it with the community. Picks are for fun only, with no money involved and no effect on your accounts." />

      <div className="ticker" aria-label="Indicative prices">
        {ticker.map((t) => (
          <div key={t.s} className="ticker__item">
            <b>{t.s}</b>
            <span className="tnum">{t.p.toFixed(t.p > 100 ? 2 : 4)}</span>
            <em className={`tnum ${t.ch >= 0 ? 'pos' : 'neg'}`}>
              {t.ch >= 0 ? '▲' : '▼'} {Math.abs(t.ch).toFixed(2)}%
            </em>
          </div>
        ))}
      </div>

      <div className="arena-body">
        <Panel
          className="arena-main"
          title="Market picks"
          action={
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'open', label: 'Open', count: matches.filter((m) => m.status === 'open').length },
                { id: 'settled', label: 'Settled' },
              ]}
            />
          }
        >
          <div className="arena-matches">
            {list.map((m) => {
              const total = m.up + m.down;
              const upP = Math.round((m.up / total) * 100);
              const settled = m.status === 'settled';
              const right = settled && m.pick === m.outcome;
              return (
                <article key={m.id} className="arena-match">
                  <div className="arena-match__lead">
                    <span className="arena-chip">{m.symbol}</span>
                    <small>{settled ? `Settled ${relative(m.closes)}` : `Closes ${relative(m.closes)}`}</small>
                  </div>
                  <p className="arena-match__prompt">{m.prompt}</p>
                  <div className="arena-split">
                    <span className="arena-split__up" style={{ width: `${upP}%` }}>
                      Yes {upP}%
                    </span>
                    <span className="arena-split__down" style={{ width: `${100 - upP}%` }}>
                      No {100 - upP}%
                    </span>
                  </div>
                  <small className="muted">{num(total)} community picks</small>
                  {settled ? (
                    <div className={`arena-outcome ${right ? 'is-good' : 'is-bad'}`}>
                      {m.pick ? (right ? <><Icon.check width={15} height={15} /> Your pick was right</> : 'Your pick did not match the outcome') : 'You did not pick'}
                    </div>
                  ) : (
                    <div className="arena-match__actions">
                      {['up', 'down'].map((p) => (
                        <button
                          key={p}
                          className={`arena-btn arena-btn--${p} ${m.pick === p ? 'is-selected' : ''}`}
                          onClick={() => {
                            dispatch({ type: 'arenaPick', id: m.id, pick: p });
                            toast(`Pick saved: ${p === 'up' ? 'Yes' : 'No'} on ${m.symbol}`, 'info');
                          }}
                        >
                          {p === 'up' ? <Icon.arrowUp width={15} height={15} /> : <Icon.arrowDown width={15} height={15} />}
                          {p === 'up' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Panel>

        <Panel eyebrow="This month" title="Leaderboard" className="arena-board">
          <ol className="board">
            {board.map((p, i) => (
              <li key={p.name} className={p.you ? 'is-you' : ''}>
                <span className="board__rank">{i + 1}</span>
                <span className="avatar avatar--sm avatar--soft">{p.name.split(' ').map((x) => x[0]).join('')}</span>
                <b>
                  {p.name}
                  {p.you && <em> (you)</em>}
                </b>
                <span className="tnum">{num(p.score)}</span>
              </li>
            ))}
          </ol>
          <p className="muted small">Score is based on accuracy of picks only. It has no cash value.</p>
        </Panel>
      </div>
    </>
  );
}
