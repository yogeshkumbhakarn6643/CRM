import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { seedState, ACCOUNT_TYPES } from '../data/seed.js';

const KEY = 'novatrade:state:v2';
const StoreCtx = createContext(null);
const ToastCtx = createContext(null);

const uid = (p) => `${p}-${Math.floor(10000 + Math.random() * 89999)}`;
const nowIso = () => new Date().toISOString();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seedState(), ...JSON.parse(raw) };
  } catch (e) {
    /* ignore */
  }
  return seedState();
}

function notify(state, n) {
  return [{ id: uid('n'), read: false, date: nowIso(), kind: 'info', ...n }, ...state.notifications];
}

function adjustAccount(accounts, id, delta) {
  return accounts.map((a) =>
    a.id === id
      ? {
          ...a,
          balance: +(a.balance + delta).toFixed(2),
          equity: +(a.equity + delta).toFixed(2),
          history: [...a.history.slice(1), +(a.balance + delta).toFixed(2)],
        }
      : a,
  );
}

function reducer(state, action) {
  switch (action.type) {
    case 'login':
      return { ...state, auth: { loggedIn: true }, user: { ...state.user, ...(action.user || {}) } };
    case 'logout':
      return { ...state, auth: { loggedIn: false } };
    case 'reset':
      return { ...seedState(), auth: { loggedIn: true } };
    case 'prefs':
      return { ...state, prefs: { ...state.prefs, ...action.prefs } };
    case 'user':
      return { ...state, user: { ...state.user, ...action.user } };

    case 'openAccount': {
      const t = ACCOUNT_TYPES.find((x) => x.id === action.form.type);
      const demo = t.id === 'demo';
      const bal = demo ? Number(action.form.demoBalance || 10000) : 0;
      const acc = {
        id: String((demo ? 9001000 : 5103000) + Math.floor(Math.random() * 999)),
        type: t.id,
        name: action.form.nickname || `${t.name} ${action.form.currency}`,
        platform: action.form.platform,
        server: demo ? 'NovaTrade-Demo' : 'NovaTrade-Live01',
        mode: demo ? 'demo' : 'live',
        currency: action.form.currency,
        leverage: action.form.leverage,
        balance: bal,
        equity: bal,
        marginUsed: 0,
        openPositions: 0,
        created: nowIso(),
        history: Array(30).fill(bal),
      };
      return {
        ...state,
        accounts: [...state.accounts, acc],
        notifications: notify(state, { title: 'Account opened', text: `${acc.name} (${acc.id}) is ready on ${acc.platform}.`, kind: 'success', link: `/accounts/${acc.id}` }),
      };
    }
    case 'renameAccount':
      return { ...state, accounts: state.accounts.map((a) => (a.id === action.id ? { ...a, name: action.name } : a)) };
    case 'resetDemo':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.id ? { ...a, balance: 10000, equity: 10000, marginUsed: 0, openPositions: 0, history: Array(30).fill(10000) } : a,
        ),
      };

    case 'transfer': {
      const { from, to, amount } = action;
      let accounts = state.accounts;
      let wallet = { ...state.wallet };
      if (from === 'wallet') wallet.USD = +(wallet.USD - amount).toFixed(2);
      else accounts = adjustAccount(accounts, from, -amount);
      if (to === 'wallet') wallet.USD = +(wallet.USD + amount).toFixed(2);
      else accounts = adjustAccount(accounts, to, amount);
      const tx = { id: uid('TX'), kind: 'transfer', from, to, amount, fee: 0, status: 'completed', date: nowIso() };
      return {
        ...state,
        accounts,
        wallet,
        transactions: [tx, ...state.transactions],
        notifications: notify(state, { title: 'Transfer completed', text: `$${amount.toFixed(2)} moved between your accounts.`, kind: 'success', link: '/accounts/transfer' }),
      };
    }

    case 'cashierRequest': {
      const tx = { id: uid('TX'), status: 'processing', date: nowIso(), ...action.tx };
      let { accounts, wallet } = state;
      if (tx.kind === 'withdrawal') {
        if (tx.account === 'wallet') wallet = { ...wallet, USD: +(wallet.USD - tx.amount).toFixed(2) };
        else accounts = adjustAccount(accounts, tx.account, -tx.amount);
      }
      return { ...state, accounts, wallet, transactions: [tx, ...state.transactions] };
    }
    case 'settleTx': {
      const tx = state.transactions.find((t) => t.id === action.id);
      if (!tx || tx.status !== 'processing') return state;
      let { accounts, wallet } = state;
      if (tx.kind === 'deposit') {
        const net = tx.amount - tx.fee;
        if (tx.account === 'wallet') wallet = { ...wallet, USD: +(wallet.USD + net).toFixed(2) };
        else accounts = adjustAccount(accounts, tx.account, net);
      }
      return {
        ...state,
        accounts,
        wallet,
        transactions: state.transactions.map((t) => (t.id === tx.id ? { ...t, status: 'completed' } : t)),
        notifications: notify(state, {
          title: tx.kind === 'deposit' ? 'Deposit completed' : 'Withdrawal sent',
          text: `$${tx.amount.toFixed(2)} via ${tx.method} (${tx.id}).`,
          kind: 'success',
          link: '/cashier',
        }),
      };
    }
    case 'cancelTx': {
      const tx = state.transactions.find((t) => t.id === action.id);
      if (!tx || tx.status !== 'processing') return state;
      let { accounts, wallet } = state;
      if (tx.kind === 'withdrawal') {
        if (tx.account === 'wallet') wallet = { ...wallet, USD: +(wallet.USD + tx.amount).toFixed(2) };
        else accounts = adjustAccount(accounts, tx.account, tx.amount);
      }
      return { ...state, accounts, wallet, transactions: state.transactions.map((t) => (t.id === tx.id ? { ...t, status: 'cancelled' } : t)) };
    }

    case 'redeem': {
      const item = state.catalogue.find((c) => c.id === action.id);
      if (!item || state.rewards.points < item.points) return state;
      return {
        ...state,
        rewards: {
          ...state.rewards,
          points: state.rewards.points - item.points,
          ledger: [{ id: uid('R'), text: `Redeemed: ${item.title}`, points: -item.points, date: nowIso() }, ...state.rewards.ledger],
          requests: [{ id: uid('RQ'), item: item.title, points: item.points, status: 'pending', date: nowIso() }, ...state.rewards.requests],
        },
        notifications: notify(state, { title: 'Reward requested', text: `${item.title} is being prepared.`, kind: 'success', link: '/rewards' }),
      };
    }
    case 'challengeStep': {
      let gained = 0;
      let title = '';
      const challenges = state.challenges.map((c) => {
        if (c.id !== action.id || c.progress >= c.total) return c;
        const progress = c.progress + 1;
        if (progress === c.total) {
          gained = c.reward;
          title = c.title;
        }
        return { ...c, progress };
      });
      const rewards = gained
        ? {
            ...state.rewards,
            points: state.rewards.points + gained,
            lifetime: state.rewards.lifetime + gained,
            ledger: [{ id: uid('R'), text: `Challenge complete: ${title}`, points: gained, date: nowIso() }, ...state.rewards.ledger],
          }
        : state.rewards;
      return { ...state, challenges, rewards };
    }

    case 'statementGenerate':
      return {
        ...state,
        statements: [
          { id: uid('ST'), period: action.period, account: action.account, year: new Date().getFullYear(), type: 'Custom', size: `${60 + Math.floor(Math.random() * 90)} KB`, date: nowIso(), reviewed: false },
          ...state.statements,
        ],
      };
    case 'statementReviewed':
      return { ...state, statements: state.statements.map((s) => (s.id === action.id ? { ...s, reviewed: true } : s)) };

    case 'ticketCreate': {
      const t = {
        id: uid('SUP'),
        subject: action.subject,
        category: action.category,
        priority: action.priority,
        status: 'open',
        date: nowIso(),
        messages: [{ from: 'me', text: action.message, date: nowIso() }],
      };
      return { ...state, tickets: [t, ...state.tickets] };
    }
    case 'ticketReply':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.id ? { ...t, status: action.from === 'me' ? 'open' : t.status, messages: [...t.messages, { from: action.from, name: action.name, text: action.text, date: nowIso() }] } : t,
        ),
      };
    case 'ticketStatus':
      return { ...state, tickets: state.tickets.map((t) => (t.id === action.id ? { ...t, status: action.status } : t)) };
    case 'chat':
      return { ...state, chat: [...state.chat, { from: action.from, name: action.name, text: action.text, date: nowIso() }] };

    case 'readNotification':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    case 'readAll':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'deleteNotification':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) };

    case 'kycUpload': {
      const steps = state.kyc.steps.map((s) => (s.id === action.id ? { ...s, state: 'done', file: action.file } : s));
      const allDone = steps.every((s) => s.state === 'done');
      return { ...state, kyc: { status: allDone ? 'verified' : 'in_review', steps } };
    }

    case 'arenaPick': {
      const matches = state.arena.matches.map((m) => {
        if (m.id !== action.id || m.status !== 'open') return m;
        let { up, down } = m;
        if (m.pick === 'up') up -= 1;
        if (m.pick === 'down') down -= 1;
        if (action.pick === 'up') up += 1;
        if (action.pick === 'down') down += 1;
        return { ...m, pick: action.pick, up, down };
      });
      return { ...state, arena: { ...state.arena, matches } };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.prefs.theme);
    localStorage.setItem('novatrade:theme', state.prefs.theme);
  }, [state.prefs.theme]);

  useEffect(() => {
    state.transactions
      .filter((t) => t.status === 'processing' && t.autoSettle && !timers.current[t.id])
      .forEach((t) => {
        timers.current[t.id] = setTimeout(() => dispatch({ type: 'settleTx', id: t.id }), 5000);
      });
  }, [state.transactions]);

  const toast = useCallback((text, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreCtx.Provider value={value}>
      <ToastCtx.Provider value={toast}>
        {children}
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast--${t.kind}`}>
              <span className="toast__dot" />
              {t.text}
            </div>
          ))}
        </div>
      </ToastCtx.Provider>
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);
export const useToast = () => useContext(ToastCtx);
