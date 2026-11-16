import { useState } from 'react';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, Empty, Field, Modal, PageHead, Panel } from '../components/ui.jsx';
import { accountLabel, date, downloadFile, fullName, money } from '../utils/format.js';

export default function Statements() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [year, setYear] = useState('all');
  const [acc, setAcc] = useState('all');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [g, setG] = useState({ account: state.accounts[0]?.id, from: monthAgo, to: today, format: 'CSV' });

  const years = [...new Set(state.statements.map((s) => s.year))].sort((a, b) => b - a);
  const list = state.statements.filter((s) => (year === 'all' || s.year === +year) && (acc === 'all' || s.account === acc));
  const latest = state.statements[0];

  const download = (s) => {
    const txs = state.transactions.filter((t) => t.account === s.account || t.from === s.account || t.to === s.account);
    const a = state.accounts.find((x) => x.id === s.account);
    const rows = [
      [`NovaTrade statement ${s.id}`],
      [`Account`, s.account, a?.name || ''],
      [`Period`, s.period],
      [`Client`, fullName(state.user), state.user.clientId],
      [],
      ['Reference', 'Type', 'Method', 'Amount', 'Fee', 'Status', 'Date'],
      ...txs.map((t) => [t.id, t.kind, t.method || 'Internal', t.amount, t.fee, t.status, t.date]),
      [],
      ['Closing balance', a?.balance ?? ''],
    ];
    downloadFile(`${s.id}.csv`, rows.map((r) => r.join(',')).join('\n'));
    dispatch({ type: 'statementReviewed', id: s.id });
    toast(`${s.id} downloaded`, 'info');
  };

  const generate = () => {
    dispatch({ type: 'statementGenerate', account: g.account, period: `${date(g.from)} – ${date(g.to)}` });
    setOpen(false);
    toast('Custom statement generated');
  };

  return (
    <>
      <PageHead
        eyebrow="Reports"
        title="Statements"
        text="Monthly statements are issued on the first business day. Generate a custom range at any time."
        actions={
          <button className="btn btn--primary" onClick={() => setOpen(true)}>
            <Icon.plus width={16} height={16} /> Generate statement
          </button>
        }
      />

      <div className="st-layout">
        <div className="st-main">
          <div className="st-filter">
            <div className="seg">
              <button className={year === 'all' ? 'is-active' : ''} onClick={() => setYear('all')}>
                All years
              </button>
              {years.map((y) => (
                <button key={y} className={year === String(y) ? 'is-active' : ''} onClick={() => setYear(String(y))}>
                  {y}
                </button>
              ))}
            </div>
            <select className="select-sm" value={acc} onChange={(e) => setAcc(e.target.value)} aria-label="Filter by account">
              <option value="all">All accounts</option>
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.id}
                </option>
              ))}
            </select>
          </div>
          <Panel>
            {list.length ? (
              <ul className="st-rows">
                {list.map((s) => (
                  <li key={s.id}>
                    <span className="st-rows__mark">
                      <Icon.statements />
                    </span>
                    <span className="st-rows__text">
                      <b>{s.period}</b>
                      <small>
                        {s.type} · {accountLabel(state.accounts, s.account)} · {s.size}
                      </small>
                    </span>
                    {s.reviewed ? <Badge status="done">Reviewed</Badge> : <Badge status="open">New</Badge>}
                    <span className="st-rows__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => setPreview(s)}>
                        View
                      </button>
                      <button className="icon-btn icon-btn--bordered" onClick={() => download(s)} aria-label={`Download ${s.id}`}>
                        <Icon.download width={16} height={16} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No statements" text="Try another year or account filter." />
            )}
          </Panel>
        </div>
        <aside className="st-side">
          {latest && (
            <Panel eyebrow="Latest" title={latest.period}>
              <p className="muted">
                {latest.type} statement for {accountLabel(state.accounts, latest.account)}, issued {date(latest.date)}.
              </p>
              <button className="btn btn--secondary btn--block" onClick={() => download(latest)}>
                <Icon.download width={16} height={16} /> Download
              </button>
            </Panel>
          )}
          <Panel title="Summary">
            <div className="st-stats">
              <div>
                <small>Total</small>
                <b>{state.statements.length}</b>
              </div>
              <div>
                <small>Unreviewed</small>
                <b>{state.statements.filter((s) => !s.reviewed).length}</b>
              </div>
            </div>
            <p className="muted small">Reviewing statements counts towards the “Review three statements” challenge on Rewards.</p>
          </Panel>
        </aside>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Generate custom statement"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={generate} disabled={!g.from || !g.to || g.from > g.to}>
              Generate
            </button>
          </>
        }
      >
        <Field label="Account">
          <select value={g.account} onChange={(e) => setG({ ...g, account: e.target.value })}>
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.id}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-row">
          <Field label="From">
            <input type="date" value={g.from} max={g.to} onChange={(e) => setG({ ...g, from: e.target.value })} />
          </Field>
          <Field label="To">
            <input type="date" value={g.to} max={today} onChange={(e) => setG({ ...g, to: e.target.value })} />
          </Field>
        </div>
        <Field label="Format">
          <div className="seg seg--wide">
            {['CSV', 'PDF', 'XLSX'].map((x) => (
              <button key={x} type="button" className={g.format === x ? 'is-active' : ''} onClick={() => setG({ ...g, format: x })}>
                {x}
              </button>
            ))}
          </div>
        </Field>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? `${preview.id} · ${preview.period}` : ''} wide footer={preview && (
        <button className="btn btn--primary" onClick={() => (download(preview), setPreview(null))}>
          <Icon.download width={16} height={16} /> Download
        </button>
      )}>
        {preview && (() => {
          const a = state.accounts.find((x) => x.id === preview.account);
          const txs = state.transactions.filter((t) => t.account === preview.account || t.from === preview.account || t.to === preview.account);
          return (
            <div className="statement-doc">
              <div className="statement-doc__head">
                <div>
                  <b>NovaTrade Ltd.</b>
                  <small>Demo statement · not a legal document</small>
                </div>
                <div>
                  <b>
                    {fullName(state.user)}
                  </b>
                  <small>{state.user.clientId}</small>
                </div>
              </div>
              <dl className="facts facts--wide">
                <div>
                  <dt>Account</dt>
                  <dd>{a ? `${a.name} · ${a.id}` : preview.account}</dd>
                </div>
                <div>
                  <dt>Closing balance</dt>
                  <dd className="tnum">{a ? money(a.balance, a.currency) : '—'}</dd>
                </div>
              </dl>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Type</th>
                      <th className="num">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((t) => (
                      <tr key={t.id}>
                        <td data-label="Reference">{t.id}</td>
                        <td data-label="Type" className="cap">{t.kind}</td>
                        <td data-label="Amount" className="num tnum">{money(t.amount)}</td>
                        <td data-label="Status"><Badge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
