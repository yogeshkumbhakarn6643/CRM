import { useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icons.jsx';

export function PageHead({ eyebrow, title, text, actions }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="page-head__text">{text}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </header>
  );
}

export function Panel({ title, eyebrow, action, children, className = '', id }) {
  return (
    <section className={`panel ${className}`} id={id}>
      {(title || action) && (
        <header className="panel__head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PanelLink({ to, children }) {
  return (
    <Link className="panel__link" to={to}>
      {children}
    </Link>
  );
}

const STATUS = {
  completed: 'good',
  fulfilled: 'good',
  verified: 'good',
  funded: 'good',
  resolved: 'good',
  done: 'good',
  live: 'good',
  processing: 'warn',
  pending: 'warn',
  in_review: 'warn',
  open: 'info',
  registered: 'info',
  demo: 'quiet',
  todo: 'quiet',
  cancelled: 'quiet',
  closed: 'quiet',
  rejected: 'bad',
};

export function Badge({ status, children }) {
  const tone = STATUS[status] || 'quiet';
  return <span className={`badge badge--${tone}`}>{children || String(status).replace('_', ' ')}</span>;
}

export function Sparkline({ data, height = 56, className = '', stroke = 'var(--t-accent)' }) {
  const id = useId().replace(/:/g, '');
  if (!data?.length) return null;
  const w = 200;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, height - 4 - ((v - min) / span) * (height - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg className={`sparkline ${className}`} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity=".28" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w} ${height} L0 ${height} Z`} fill={`url(#g${id})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Ring({ value, size = 76, label, dark = false }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`ring ${dark ? 'ring--dark' : ''}`} style={{ '--p': `${v * 3.6}deg`, width: size, height: size }}>
      <span>{label ?? `${Math.round(v)}%`}</span>
    </div>
  );
}

export function Meter({ value, total, tone = 'accent' }) {
  const p = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className={`meter meter--${tone}`} role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin="0" aria-valuemax="100">
      <span style={{ width: `${p}%` }} />
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-layer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon.close />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <span className="empty__mark" />
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className={`field ${error ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, text }) {
  return (
    <label className="toggle-row">
      <span>
        <b>{label}</b>
        {text && <small>{text}</small>}
      </span>
      <button type="button" role="switch" aria-checked={checked} className={`switch ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </label>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={value === t.id ? 'is-active' : ''} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <em>{t.count}</em>}
        </button>
      ))}
    </div>
  );
}
