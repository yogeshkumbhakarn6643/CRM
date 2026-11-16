import { useState } from 'react';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Badge, Meter, Modal, PageHead, Panel, Tabs } from '../components/ui.jsx';
import { date, num, relative } from '../utils/format.js';

export default function Rewards() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { rewards, challenges, catalogue } = state;
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const progress = Math.min(100, (rewards.points / rewards.nextTarget) * 100);
  const done = challenges.filter((c) => c.progress >= c.total).length;
  const items = catalogue.filter((c) => filter === 'all' || (filter === 'affordable' ? c.points <= rewards.points : c.points > rewards.points));

  return (
    <>
      <PageHead eyebrow="Progress" title="Rewards" text="Earn points for responsible actions like verifying, learning and staying secure. Points never depend on trading volume." />

      <section className="rw-hero">
        <div className="rw-hero__lead">
          <div className="rw-hero__ring" style={{ '--rw-progress': `${progress * 3.6}deg` }}>
            <span>{Math.round(progress)}%</span>
          </div>
          <p className="eyebrow">Available points</p>
          <strong className="tnum">
            {num(rewards.points)} <span>pts</span>
          </strong>
          <p className="rw-hero__toward">{rewards.points >= rewards.nextTarget ? 'Tier reward unlocked. Redeem from the catalogue.' : `${num(rewards.nextTarget - rewards.points)} pts until your next tier reward`}</p>
        </div>
        <div className="rw-hero__stats">
          <div>
            <small>Lifetime earned</small>
            <b className="tnum">{num(rewards.lifetime)}</b>
          </div>
          <div>
            <small>Challenges done</small>
            <b>
              {done}/{challenges.length}
            </b>
          </div>
          <div>
            <small>Tier</small>
            <b>{state.user.tier}</b>
          </div>
        </div>
      </section>

      <div className="rw-body">
        <div className="rw-main">
          <Panel eyebrow="Challenges" title="Ways to earn">
            <div className="rw-challenges">
              {challenges.map((c) => {
                const complete = c.progress >= c.total;
                return (
                  <article key={c.id} className={`rw-challenge ${complete ? 'is-complete' : ''}`}>
                    <div className="rw-challenge__top">
                      <span className="badge-mark">{c.mark}</span>
                      <div>
                        <b>{c.title}</b>
                        <p>{c.text}</p>
                      </div>
                      <span className="rw-challenge__pts">+{c.reward}</span>
                    </div>
                    <div className="rw-challenge__meterHead">
                      <small>{complete ? 'Completed' : 'Progress'}</small>
                      <small className="tnum">
                        {c.progress}/{c.total}
                      </small>
                    </div>
                    <Meter value={c.progress} total={c.total} />
                    {!complete && (
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => {
                          dispatch({ type: 'challengeStep', id: c.id });
                          toast(c.progress + 1 >= c.total ? `Challenge complete: +${c.reward} pts` : 'Progress saved', c.progress + 1 >= c.total ? 'success' : 'info');
                        }}
                      >
                        {c.progress + 1 >= c.total ? 'Complete step' : 'Mark next step'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </Panel>

          <Panel
            eyebrow="Catalogue"
            title="Redeem points"
            action={
              <Tabs
                value={filter}
                onChange={setFilter}
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'affordable', label: 'Affordable' },
                  { id: 'locked', label: 'Save up' },
                ]}
              />
            }
          >
            <div className="rw-catalogue">
              {items.map((g) => {
                const ok = rewards.points >= g.points;
                return (
                  <article key={g.id} className={`rw-item ${ok ? 'is-affordable' : 'is-unaffordable'}`}>
                    <span className="rw-item__mark">{g.mark}</span>
                    <b>{g.title}</b>
                    <p>{g.text}</p>
                    <div className="rw-item__facts">
                      <span className="tnum">{num(g.points)} pts</span>
                      <small>{g.stock}</small>
                    </div>
                    {!ok && <Meter value={rewards.points} total={g.points} />}
                    <button className={`btn ${ok ? 'btn--primary' : 'btn--secondary'} btn--sm btn--block`} disabled={!ok} onClick={() => setConfirm(g)}>
                      {ok ? 'Redeem' : `${num(g.points - rewards.points)} pts more`}
                    </button>
                  </article>
                );
              })}
            </div>
          </Panel>
        </div>

        <aside className="rw-side">
          <Panel eyebrow="Ledger" title="Points activity">
            <ul className="rw-ledger">
              {rewards.ledger.slice(0, 8).map((l) => (
                <li key={l.id}>
                  <span>
                    <b>{l.text}</b>
                    <small>{relative(l.date)}</small>
                  </span>
                  <b className={`tnum ${l.points >= 0 ? 'pos' : 'neg'}`}>
                    {l.points >= 0 ? '+' : ''}
                    {num(l.points)}
                  </b>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel eyebrow="Requests" title="Redemptions">
            <ul className="rw-ledger">
              {rewards.requests.map((r) => (
                <li key={r.id}>
                  <span>
                    <b>{r.item}</b>
                    <small>
                      {r.id} · {date(r.date)}
                    </small>
                  </span>
                  <Badge status={r.status} />
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirm redemption"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={() => {
                dispatch({ type: 'redeem', id: confirm.id });
                toast(`${confirm.title} requested`);
                setConfirm(null);
              }}
            >
              Redeem {confirm && num(confirm.points)} pts
            </button>
          </>
        }
      >
        {confirm && (
          <div className="redeem-confirm">
            <span className="rw-item__mark">{confirm.mark}</span>
            <div>
              <b>{confirm.title}</b>
              <p className="muted">{confirm.text}</p>
              <p>
                Balance after: <b className="tnum">{num(rewards.points - confirm.points)} pts</b>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
