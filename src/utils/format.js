export const money = (v, cur = 'USD', opts = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts }).format(v || 0);

export const num = (v) => new Intl.NumberFormat('en-US').format(v || 0);

export const date = (iso, opts = { day: '2-digit', month: 'short', year: 'numeric' }) => new Date(iso).toLocaleDateString('en-GB', opts);

export const dateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const relative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  const fmt = (n, u) => (diff >= 0 ? `${n}${u} ago` : `in ${n}${u}`);
  if (m < 1) return 'just now';
  if (m < 60) return fmt(m, 'm');
  const h = Math.round(m / 60);
  if (h < 24) return fmt(h, 'h');
  const d = Math.round(h / 24);
  if (d < 30) return fmt(d, 'd');
  return date(iso);
};

export const pct = (v, digits = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`;

export const accountLabel = (accounts, id) => {
  if (id === 'wallet') return 'Wallet (USD)';
  const a = accounts.find((x) => x.id === id);
  return a ? `${a.name} · ${a.id}` : id;
};

export const downloadFile = (name, content, type = 'text/csv') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ');

export const initials = (u) => ((u?.firstName?.[0] || '') + (u?.lastName?.[0] || '')).toUpperCase() || 'U';
