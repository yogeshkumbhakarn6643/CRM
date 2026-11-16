import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore, useToast } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Badge, Empty, Field, Modal, PageHead, Panel, Tabs } from '../components/ui.jsx';
import { dateTime, relative } from '../utils/format.js';

const FAQ = [
  { q: 'How long do withdrawals take?', a: 'Card and e-wallet withdrawals usually arrive within one business day. Bank wires take 1-3 business days after approval.' },
  { q: 'Which documents prove my address?', a: 'A utility bill, bank statement or government letter issued in the last three months showing your full name and address.' },
  { q: 'Can I change my account leverage?', a: 'Yes. Raise a ticket under “Accounts” with the account number and the leverage you need.' },
  { q: 'How do I reset my MT5 password?', a: 'Open the account from Accounts and choose “Change MT5 password”.' },
];

const BOT = [
  { k: ['withdraw', 'payout'], a: 'Withdrawals are reviewed within one business day. You can track them in Cashier → history.' },
  { k: ['deposit', 'fund'], a: 'You can deposit by card, bank wire, USDT or e-wallet from the Cashier page.' },
  { k: ['kyc', 'verify', 'document', 'address'], a: 'Upload documents from Profile → Verification. Reviews usually take a few hours.' },
  { k: ['password', 'login', 'mt5'], a: 'Trading passwords can be changed from the account page. Your portal password is under Profile → Security.' },
];

function Chat() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const end = useRef(null);
  useEffect(() => end.current?.scrollIntoView({ block: 'nearest' }), [state.chat.length, typing]);

  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    dispatch({ type: 'chat', from: 'me', text: t });
    setText('');
    setTyping(true);
    setTimeout(() => {
      const hit = BOT.find((b) => b.k.some((k) => t.toLowerCase().includes(k)));
      dispatch({ type: 'chat', from: 'agent', name: 'Nova assistant', text: hit ? hit.a : 'Thanks for your message. An agent will join this chat shortly, or you can raise a ticket for a tracked reply.' });
      setTyping(false);
    }, 1100);
  };

  return (
    <div className="chat">
      <div className="chat__log">
        {state.chat.map((m, i) => (
          <div key={i} className={`bubble ${m.from === 'me' ? 'bubble--me' : ''}`}>
            {m.from !== 'me' && <small>{m.name}</small>}
            <p>{m.text}</p>
            <time>{relative(m.date)}</time>
          </div>
        ))}
        {typing && (
          <div className="bubble bubble--typing">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={end} />
      </div>
      <form className="chat__input" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message…" aria-label="Message" />
        <button className="btn btn--primary" type="submit" disabled={!text.trim()} aria-label="Send">
          <Icon.send width={16} height={16} />
        </button>
      </form>
    </div>
  );
}

export default function Support() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('view') === 'chat' ? 'chat' : 'tickets');
  const [status, setStatus] = useState('all');
  const [newOpen, setNewOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [faq, setFaq] = useState(0);
  const [nt, setNt] = useState({ subject: '', category: 'Payments', priority: 'Normal', message: '' });
  const selectedId = params.get('ticket') || state.tickets[0]?.id;
  const selected = state.tickets.find((t) => t.id === selectedId);
  const list = state.tickets.filter((t) => status === 'all' || t.status === status);

  const select = (id) => setParams({ ticket: id });

  const create = () => {
    dispatch({ type: 'ticketCreate', ...nt });
    setNewOpen(false);
    setNt({ subject: '', category: 'Payments', priority: 'Normal', message: '' });
    setParams({});
    toast('Ticket created. We usually reply within a few hours');
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    dispatch({ type: 'ticketReply', id: selected.id, from: 'me', text: reply.trim() });
    setReply('');
    const id = selected.id;
    setTimeout(() => dispatch({ type: 'ticketReply', id, from: 'agent', name: 'Sophie (Support)', text: 'Thanks for the update. I have added this to your case and will follow up shortly.' }), 2200);
  };

  return (
    <>
      <PageHead
        eyebrow="Help"
        title="Support"
        text="Raise a ticket for anything that needs tracking, or chat for quick questions."
        actions={
          <button className="btn btn--primary" onClick={() => setNewOpen(true)}>
            <Icon.plus width={16} height={16} /> New ticket
          </button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'tickets', label: 'Tickets', count: state.tickets.filter((t) => t.status === 'open').length },
          { id: 'chat', label: 'Live chat' },
          { id: 'faq', label: 'Help articles' },
        ]}
      />

      {tab === 'tickets' && (
        <div className="support-inbox">
          <Panel
            className="inbox-list"
            title="Your tickets"
            action={
              <select className="select-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter tickets">
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            }
          >
            {list.length ? (
              <ul className="ticket-list">
                {list.map((t) => (
                  <li key={t.id}>
                    <button className={t.id === selectedId ? 'is-active' : ''} onClick={() => select(t.id)}>
                      <span className="ticket-list__top">
                        <b>{t.subject}</b>
                        <Badge status={t.status} />
                      </span>
                      <small>
                        {t.id} · {t.category} · {relative(t.messages.at(-1).date)}
                      </small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No tickets" />
            )}
          </Panel>
          <Panel className="inbox-thread">
            {selected ? (
              <>
                <header className="thread-head">
                  <div>
                    <p className="eyebrow">
                      {selected.id} · {selected.category} · {selected.priority} priority
                    </p>
                    <h2>{selected.subject}</h2>
                  </div>
                  <div className="panel-tools">
                    <Badge status={selected.status} />
                    {selected.status !== 'closed' ? (
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          dispatch({ type: 'ticketStatus', id: selected.id, status: 'closed' });
                          toast('Ticket closed', 'info');
                        }}
                      >
                        Close
                      </button>
                    ) : (
                      <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'ticketStatus', id: selected.id, status: 'open' })}>
                        Reopen
                      </button>
                    )}
                  </div>
                </header>
                <div className="thread">
                  {selected.messages.map((m, i) => (
                    <div key={i} className={`bubble ${m.from === 'me' ? 'bubble--me' : ''}`}>
                      <small>{m.from === 'me' ? 'You' : m.name}</small>
                      <p>{m.text}</p>
                      <time>{dateTime(m.date)}</time>
                    </div>
                  ))}
                </div>
                {selected.status !== 'closed' && (
                  <form className="chat__input" onSubmit={sendReply}>
                    <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" aria-label="Reply" />
                    <button className="btn btn--primary" type="submit" disabled={!reply.trim()}>
                      Send
                    </button>
                  </form>
                )}
              </>
            ) : (
              <Empty title="Select a ticket" />
            )}
          </Panel>
        </div>
      )}

      {tab === 'chat' && (
        <Panel title="Chat with us" eyebrow="Typically replies in under a minute" className="chat-panel">
          <Chat />
        </Panel>
      )}

      {tab === 'faq' && (
        <Panel title="Frequently asked">
          <div className="faq">
            {FAQ.map((f, i) => (
              <div key={f.q} className={`faq__item ${faq === i ? 'is-open' : ''}`}>
                <button onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i}>
                  {f.q}
                  <Icon.chevronDown width={16} height={16} />
                </button>
                {faq === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New support ticket"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setNewOpen(false)}>
              Cancel
            </button>
            <button className="btn btn--primary" disabled={!nt.subject.trim() || nt.message.trim().length < 10} onClick={create}>
              Submit ticket
            </button>
          </>
        }
      >
        <Field label="Subject">
          <input value={nt.subject} onChange={(e) => setNt({ ...nt, subject: e.target.value })} maxLength={80} autoFocus />
        </Field>
        <div className="form-row">
          <Field label="Category">
            <select value={nt.category} onChange={(e) => setNt({ ...nt, category: e.target.value })}>
              {['Payments', 'Accounts', 'Verification', 'Platform', 'Rewards', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select value={nt.priority} onChange={(e) => setNt({ ...nt, priority: e.target.value })}>
              {['Low', 'Normal', 'High'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Message" hint="At least 10 characters. Never share your password.">
          <textarea rows={5} value={nt.message} onChange={(e) => setNt({ ...nt, message: e.target.value })} />
        </Field>
      </Modal>
    </>
  );
}
