import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icons.jsx';
import { useStore, useToast } from '../store/AppStore.jsx';
import { BRAND } from '../data/seed.js';
import { fullName, initials, relative } from '../utils/format.js';

const NAV = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Overview', icon: 'home' },
      { to: '/accounts', label: 'Accounts', icon: 'accounts', end: true },
      { to: '/cashier', label: 'Cashier', icon: 'cashier' },
      { to: '/accounts/transfer', label: 'Transfers', icon: 'transfer' },
      { to: '/statements', label: 'Statements', icon: 'statements' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { to: '/rewards', label: 'Rewards', icon: 'rewards' },
      { to: '/live', label: 'Live arena', icon: 'live' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/support', label: 'Support', icon: 'support', countKey: 'tickets' },
      { to: '/notifications', label: 'Notifications', icon: 'bell', countKey: 'unread' },
      { to: '/profile', label: 'Profile & security', icon: 'user' },
    ],
  },
];

const MOBILE = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/accounts', label: 'Accounts', icon: 'accounts', end: true },
  { to: '/cashier', label: 'Cashier', icon: 'cashier' },
  { to: '/rewards', label: 'Rewards', icon: 'rewards' },
];

const LANGS = ['English', 'Français', 'Español', 'Deutsch', 'Italiano', 'Português', 'हिन्दी', '中文'];

export function Brand({ to = '/dashboard', className = '' }) {
  return (
    <Link to={to} className={`brand ${className}`} aria-label={`${BRAND.name} home`}>
      <span className="brand__mark">
        {BRAND.mark}
        <i />
      </span>
      <span className="brand__name">
        <b>Nova</b>Trade
      </span>
    </Link>
  );
}

function useCounts() {
  const { state } = useStore();
  return {
    unread: state.notifications.filter((n) => !n.read).length,
    tickets: state.tickets.filter((t) => t.status === 'open').length,
  };
}

function useOutside(ref, onOut, active) {
  useEffect(() => {
    if (!active) return undefined;
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOut();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOut, active]);
}

function Sidebar() {
  const { state } = useStore();
  const counts = useCounts();
  const { user, kyc } = state;
  const kycDone = kyc.steps.filter((s) => s.state === 'done').length;
  return (
    <aside className="sidebar">
      <Brand />
      <Link to="/profile" className="sidebar-account">
        <span className="avatar">{initials(user)}</span>
        <span className="sidebar-account__text">
          <b>
            {fullName(user)}
          </b>
          <small>
            {user.clientId} · {user.tier}
          </small>
        </span>
        <Icon.chevron width={15} height={15} />
      </Link>
      <nav className="side-nav" aria-label="Primary">
        {NAV.map((g) => (
          <div key={g.label}>
            <p className="nav-label">{g.label}</p>
            <ul>
              {g.items.map((it) => {
                const I = Icon[it.icon];
                const c = it.countKey ? counts[it.countKey] : 0;
                return (
                  <li key={it.to}>
                    <NavLink to={it.to} end={it.end}>
                      <I />
                      <span>{it.label}</span>
                      {c > 0 && <em className="nav-count">{c}</em>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <strong>{kyc.status === 'verified' ? 'Fully verified' : 'Verification'}</strong>
        <p>
          {kyc.status === 'verified'
            ? 'All limits are unlocked on your profile.'
            : `${kycDone} of ${kyc.steps.length} steps complete. Finish to unlock withdrawals.`}
        </p>
        {kyc.status !== 'verified' && (
          <Link to="/profile?tab=verification" className="sidebar-foot__link">
            Continue <Icon.chevron width={14} height={14} />
          </Link>
        )}
      </div>
    </aside>
  );
}

function ThemeSwitch() {
  const { state, dispatch } = useStore();
  const dark = state.prefs.theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      className={`appearance-switch ${dark ? 'is-dark' : ''}`}
      onClick={() => dispatch({ type: 'prefs', prefs: { theme: dark ? 'light' : 'dark' } })}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="appearance-switch__thumb" />
      <Icon.sun width={14} height={14} />
      <Icon.moon width={14} height={14} />
    </button>
  );
}

export function LanguageMenu() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <Icon.globe width={16} height={16} />
        <span className="lang-btn__label">{state.prefs.language}</span>
        <Icon.chevronDown width={13} height={13} />
      </button>
      {open && (
        <div className="dropdown dropdown--lang" role="menu">
          {LANGS.map((l) => (
            <button
              key={l}
              role="menuitemradio"
              aria-checked={state.prefs.language === l}
              className={state.prefs.language === l ? 'is-selected' : ''}
              onClick={() => {
                dispatch({ type: 'prefs', prefs: { language: l } });
                setOpen(false);
              }}
            >
              {l}
              {state.prefs.language === l && <Icon.check width={15} height={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationMenu() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();
  useOutside(ref, () => setOpen(false), open);
  const unread = state.notifications.filter((n) => !n.read).length;
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="icon-btn icon-btn--bordered" onClick={() => setOpen((o) => !o)} aria-label={`Notifications, ${unread} unread`}>
        <Icon.bell />
        {unread > 0 && <span className="dot-count">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown dropdown--notes">
          <header>
            <b>Notifications</b>
            <button className="text-btn" onClick={() => dispatch({ type: 'readAll' })} disabled={!unread}>
              Mark all read
            </button>
          </header>
          <ul>
            {state.notifications.slice(0, 5).map((n) => (
              <li key={n.id}>
                <button
                  className={n.read ? '' : 'is-unread'}
                  onClick={() => {
                    dispatch({ type: 'readNotification', id: n.id });
                    setOpen(false);
                    if (n.link) nav(n.link);
                  }}
                >
                  <span className={`note-dot note-dot--${n.kind}`} />
                  <span>
                    <b>{n.title}</b>
                    <small>{n.text}</small>
                    <time>{relative(n.date)}</time>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link to="/notifications" className="dropdown__foot" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();
  useOutside(ref, () => setOpen(false), open);
  const { user } = state;
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="user-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="avatar avatar--sm">{initials(user)}</span>
        <span className="user-btn__name">{user.firstName}</span>
        <Icon.chevronDown width={13} height={13} />
      </button>
      {open && (
        <div className="dropdown dropdown--user">
          <div className="dropdown__who">
            <b>
              {fullName(user)}
            </b>
            <small>{user.email}</small>
          </div>
          <Link to="/profile" onClick={() => setOpen(false)}>
            <Icon.user width={16} height={16} /> Profile
          </Link>
          <Link to="/profile?tab=security" onClick={() => setOpen(false)}>
            <Icon.shield width={16} height={16} /> Security
          </Link>
          <Link to="/profile?tab=preferences" onClick={() => setOpen(false)}>
            <Icon.settings width={16} height={16} /> Preferences
          </Link>
          <Link to="/support" onClick={() => setOpen(false)}>
            <Icon.support width={16} height={16} /> Help centre
          </Link>
          <button
            className="dropdown__danger"
            onClick={() => {
              dispatch({ type: 'logout' });
              toast('You have been signed out');
              nav('/login');
            }}
          >
            <Icon.logout width={16} height={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function SearchBox() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();
  useOutside(ref, () => setOpen(false), open);
  const pages = NAV.flatMap((g) => g.items).map((p) => ({ label: p.label, sub: 'Page', to: p.to }));
  const accounts = state.accounts.map((a) => ({ label: `${a.name} ${a.id}`, sub: 'Account', to: `/accounts/${a.id}` }));
  const txs = state.transactions.map((t) => ({ label: `${t.id} ${t.kind}`, sub: 'Transaction', to: '/cashier' }));
  const tickets = state.tickets.map((t) => ({ label: `${t.id} ${t.subject}`, sub: 'Ticket', to: `/support?ticket=${t.id}` }));
  const results = q.trim()
    ? [...pages, ...accounts, ...txs, ...tickets].filter((r) => r.label.toLowerCase().includes(q.toLowerCase())).slice(0, 7)
    : [];
  return (
    <div className="search" ref={ref}>
      <Icon.search width={16} height={16} />
      <input
        value={q}
        placeholder="Search accounts, transactions, tickets"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) {
            nav(results[0].to);
            setQ('');
            setOpen(false);
          }
        }}
        aria-label="Search"
      />
      <kbd>/</kbd>
      {open && q.trim() && (
        <div className="dropdown dropdown--search">
          {results.length ? (
            results.map((r) => (
              <button
                key={r.label + r.to}
                onClick={() => {
                  nav(r.to);
                  setQ('');
                  setOpen(false);
                }}
              >
                <span>{r.label}</span>
                <small>{r.sub}</small>
              </button>
            ))
          ) : (
            <p className="dropdown__empty">No results for "{q}"</p>
          )}
        </div>
      )}
    </div>
  );
}

function Topbar() {
  useEffect(() => {
    const h = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        document.querySelector('.search input')?.focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);
  return (
    <header className="stage-top">
      <Brand className="brand--mobile" />
      <SearchBox />
      <div className="stage-top__tools">
        <ThemeSwitch />
        <LanguageMenu />
        <NotificationMenu />
        <UserMenu />
      </div>
    </header>
  );
}

function MobileNav() {
  const [more, setMore] = useState(false);
  const counts = useCounts();
  const loc = useLocation();
  useEffect(() => setMore(false), [loc.pathname]);
  const extra = NAV.flatMap((g) => g.items).filter((i) => !MOBILE.some((m) => m.to === i.to));
  const moreActive = extra.some((i) => loc.pathname.startsWith(i.to));
  return (
    <>
      <nav className="mobile-nav" aria-label="Mobile">
        <ul>
          {MOBILE.map((it) => {
            const I = Icon[it.icon];
            return (
              <li key={it.to}>
                <NavLink to={it.to} end={it.end}>
                  <I />
                  <span>{it.label}</span>
                </NavLink>
              </li>
            );
          })}
          <li>
            <button className={moreActive || more ? 'active' : ''} onClick={() => setMore((m) => !m)} aria-expanded={more}>
              <Icon.more />
              <span>More</span>
              {counts.unread > 0 && <i className="mobile-nav__dot" />}
            </button>
          </li>
        </ul>
      </nav>
      {more && (
        <div className="mobile-more" onClick={(e) => e.target === e.currentTarget && setMore(false)}>
          <div className="mobile-more__menu">
            <header>
              <div>
                <p className="eyebrow">Navigate</p>
                <h2>More</h2>
              </div>
              <button className="icon-btn icon-btn--bordered" onClick={() => setMore(false)} aria-label="Close">
                <Icon.close />
              </button>
            </header>
            <div className="mobile-more__grid">
              {extra.map((it) => {
                const I = Icon[it.icon];
                const c = it.countKey ? counts[it.countKey] : 0;
                return (
                  <NavLink key={it.to} to={it.to} end={it.end}>
                    <I />
                    <span>{it.label}</span>
                    {c > 0 && <em className="nav-count">{c}</em>}
                  </NavLink>
                );
              })}
            </div>
            <div className="mobile-more__tools">
              <ThemeSwitch />
              <LanguageMenu />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Layout() {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  return (
    <div className="shell">
      <Sidebar />
      <div className="stage">
        <Topbar />
        <main className="content" key={loc.pathname}>
          <Outlet />
        </main>
        <footer className="foot">
          <span>{BRAND.name} trader workspace · Demo environment</span>
          <span>Broker-managed / Identity-bound / No trading incentives</span>
        </footer>
      </div>
      <MobileNav />
    </div>
  );
}
