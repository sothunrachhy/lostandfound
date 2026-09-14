import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Calendar, Package, Tag, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import {
  isTelegram, initData, telegramUser,
  ready, applyTheme, onThemeChange, bindBackButton, haptic, notifyHaptic,
} from './telegram';
import { setToken, clearToken, setUnauthorizedHandler } from './auth';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function App() {
  // Whether we are inside Telegram is known before the first render, so it
  // seeds the initial phase rather than being written back by an effect.
  const [phase, setPhase] = useState(isTelegram ? 'starting' : 'unsupported');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  /* ── boot: theme, then try a silent sign-in ─────────────────── */
  useEffect(() => {
    ready();
    applyTheme();
    return onThemeChange(applyTheme);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setPhase('link');
    });
  }, []);

  useEffect(() => {
    if (!isTelegram) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const data = await res.json();
        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          setPhase('board');
        } else {
          setPhase('link');
        }
      } catch {
        setError('Could not reach the service. Check your connection and try again.');
        setPhase('link');
      }
    })();
  }, []);

  if (phase === 'starting') return <Splash />;
  if (phase === 'unsupported') return <OpenInTelegram />;
  if (phase === 'link') {
    return (
      <LinkAccount
        initialError={error}
        onLinked={(data) => {
          setToken(data.token);
          setUser(data.user);
          notifyHaptic('success');
          setPhase('board');
        }}
      />
    );
  }
  return (
    <Board
      user={user}
      onSignOut={() => {
        clearToken();
        setUser(null);
        setPhase('link');
      }}
    />
  );
}

/* ─── Splash ─────────────────────────────────────────────────── */
function Splash() {
  return (
    <div className="h-full flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin tg-hint" />
    </div>
  );
}

/* ─── Opened outside Telegram ────────────────────────────────── */
function OpenInTelegram() {
  return (
    <div className="h-full flex items-center justify-center p-6 text-center">
      <div className="space-y-2 max-w-xs">
        <Package className="w-9 h-9 mx-auto tg-hint" />
        <h1 className="text-base font-extrabold">Open this from Telegram</h1>
        <p className="text-xs tg-hint leading-relaxed">
          This page signs you in using Telegram, so it only works when opened
          inside the LF System bot.
        </p>
      </div>
    </div>
  );
}

/* ─── One-time account link ──────────────────────────────────── */
function LinkAccount({ onLinked, initialError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError || '');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/telegram/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, email, password }),
      });
      const data = await res.json();
      if (data.success) return onLinked(data);
      notifyHaptic('error');
      setError(data.message || 'Could not link this account.');
    } catch {
      notifyHaptic('error');
      setError('Could not reach the service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 fade-up">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl tg-button mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black">LF System</h1>
          <p className="text-xs tg-hint leading-relaxed">
            {telegramUser?.first_name ? `Hi ${telegramUser.first_name}. ` : ''}
            Link your campus account once — after this you go straight in.
          </p>
        </div>

        <div className="space-y-2.5">
          <input
            className="tg-input" type="email" inputMode="email" autoComplete="email"
            placeholder="Campus email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
          />
          <input
            className="tg-input" type="password" autoComplete="current-password"
            placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
          />
        </div>

        {error && (
          <p className="text-xs text-center leading-relaxed"
             style={{ color: 'var(--tg-theme-destructive-text-color)' }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={busy}
          className="tg-button w-full py-3 rounded-xl text-sm font-bold disabled:cursor-not-allowed">
          {busy ? 'Linking…' : 'Link account'}
        </button>

        <p className="text-[11px] tg-hint text-center leading-relaxed">
          Your Telegram account is linked to your existing LF System login.
          Nothing is posted to Telegram on your behalf.
        </p>
      </form>
    </div>
  );
}

/* ─── The board ──────────────────────────────────────────────── */
function Board({ user, onSignOut }) {
  const [tab, setTab] = useState('lost');
  const [search, setSearch] = useState('');
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    // Nothing is set before the first await, so mounting this does not
    // trigger a synchronous cascading render.
    try {
      const [l, f] = await Promise.all([
        fetch(`${API}/api/lost-items`).then((r) => r.json()),
        fetch(`${API}/api/found-items`).then((r) => r.json()),
      ]);
      setLost(Array.isArray(l) ? l : []);
      setFound(Array.isArray(f) ? f : []);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetching on mount is what effects are for. The rule cannot see that every
  // setState in load() happens after an await, so it is silenced here rather
  // than contorting the code around a false positive.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  // The hardware back button closes the detail sheet before leaving the app.
  useEffect(() => bindBackButton(detail ? () => setDetail(null) : null), [detail]);

  const items = tab === 'lost' ? lost : found;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.ItemName, i.Description, i.LocationName, i.CategoryName, i.Brand, i.Color]
        .some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [items, search]);

  if (detail) return <ItemDetail item={detail} kind={tab} onClose={() => setDetail(null)} />;

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-black truncate">Campus Lost &amp; Found</h1>
            <p className="text-[11px] tg-hint truncate">Signed in as {user?.Name}</p>
          </div>
          <button onClick={onSignOut} className="text-[11px] font-bold tg-link shrink-0">
            Unlink
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 tg-hint pointer-events-none" />
          <input
            className="tg-input pl-9" placeholder="Search items, places…"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ['lost', 'Lost', lost.length, AlertCircle],
            ['found', 'Found', found.length, Package],
          ].map(([id, label, count, Icon]) => (
            <button
              key={id}
              onClick={() => { haptic(); setTab(id); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-opacity ${
                tab === id ? 'tg-button' : 'tg-surface tg-hint'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label} ({count})
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pb-6 space-y-2.5">
        {loading && <p className="text-xs tg-hint text-center py-10">Loading…</p>}

        {!loading && failed && (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs tg-hint">Could not load the board.</p>
            <button onClick={load} className="text-xs font-bold tg-link">Try again</button>
          </div>
        )}

        {!loading && !failed && visible.length === 0 && (
          <div className="text-center py-12 space-y-1.5">
            <Package className="w-8 h-8 mx-auto tg-hint opacity-50" />
            <p className="text-xs tg-hint">
              {search ? 'Nothing matches that search.' : `No ${tab} items on the board yet.`}
            </p>
          </div>
        )}

        {!loading && !failed && visible.map((item) => (
          <ItemRow
            key={item.LostID ?? item.FoundID}
            item={item}
            kind={tab}
            onOpen={() => { haptic(); setDetail(item); }}
          />
        ))}
      </main>
    </div>
  );
}

/* ─── List row ───────────────────────────────────────────────── */
function ItemRow({ item, kind, onOpen }) {
  return (
    <button onClick={onOpen} className="tg-card w-full text-left flex gap-3 p-3 fade-up">
      <Thumb src={item.Image} alt={item.ItemName} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-bold truncate">{item.ItemName}</h3>
          <StatusChip item={item} kind={kind} />
        </div>
        <p className="text-[11px] tg-hint line-clamp-2 leading-snug">
          {item.Description || 'No description.'}
        </p>
        <div className="flex items-center gap-3 text-[10px] tg-hint pt-0.5">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />{item.LocationName}
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3" />{item.DateLost || item.DateFound}
          </span>
        </div>
      </div>
    </button>
  );
}

function StatusChip({ item, kind }) {
  if (item.ApprovalStatus === 'Pending')
    return <span className="chip shrink-0" style={{ background: '#fffbeb', color: '#b45309' }}>Pending</span>;
  if (item.Status === 'Claimed')
    return <span className="chip shrink-0 tg-surface tg-hint">Claimed</span>;
  return (
    <span className="chip shrink-0" style={
      kind === 'lost'
        ? { background: '#fff1f2', color: '#be123c' }
        : { background: '#f0fdfa', color: '#0f766e' }
    }>
      {kind === 'lost' ? 'Lost' : 'Found'}
    </span>
  );
}

function Thumb({ src, alt }) {
  const [erroredSrc, setErroredSrc] = useState(null);
  const broken = !src || erroredSrc === src;

  if (broken) {
    return (
      <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center tg-surface">
        <Package className="w-5 h-5 tg-hint" />
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt} loading="lazy"
      onError={() => setErroredSrc(src)}
      className="w-14 h-14 rounded-xl object-cover shrink-0"
    />
  );
}

/* ─── Detail ─────────────────────────────────────────────────── */
function ItemDetail({ item, kind, onClose }) {
  return (
    <div className="min-h-full flex flex-col fade-up">
      {item.Image && (
        <img src={item.Image} alt={item.ItemName} className="w-full aspect-[4/3] object-cover" />
      )}

      <div className="p-4 space-y-4 flex-1">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg font-black leading-tight">{item.ItemName}</h1>
            <StatusChip item={item} kind={kind} />
          </div>
          <p className="text-xs tg-hint leading-relaxed">
            {item.Description || 'No description provided.'}
          </p>
        </div>

        <dl className="tg-card p-3 space-y-2.5">
          <Row icon={Tag} label="Category" value={item.CategoryName} />
          {(item.Brand || item.Color) && (
            <Row icon={Package} label="Details" value={[item.Brand, item.Color].filter(Boolean).join(' · ')} />
          )}
          <Row icon={MapPin} label="Location" value={item.LocationName} />
          <Row
            icon={Calendar}
            label={kind === 'lost' ? 'Lost on' : 'Found on'}
            value={[item.DateLost || item.DateFound, item.ReportTime].filter(Boolean).join(' · ')}
          />
          <Row icon={ShieldCheck} label="Reported by" value={item.OwnerName} />
        </dl>

        <p className="text-[11px] tg-hint text-center leading-relaxed">
          To claim this item or message the person who reported it, open the
          full LF System portal.
        </p>

        <button onClick={onClose} className="tg-surface w-full py-2.5 rounded-xl text-xs font-bold">
          Back to the board
        </button>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 mt-0.5 tg-hint shrink-0" />
      <div className="min-w-0">
        <dt className="text-[10px] tg-hint uppercase tracking-wide font-bold">{label}</dt>
        <dd className="text-xs font-medium break-words">{value}</dd>
      </div>
    </div>
  );
}
