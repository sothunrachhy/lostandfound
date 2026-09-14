import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, MapPin, Calendar, Package, Tag, ShieldCheck, AlertCircle,
  CheckCircle, RefreshCw, ChevronLeft, User,
} from 'lucide-react';
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

/* ─── Brand mark, matching the web portal's auth screen ──────── */
function BrandMark({ size = 48 }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-xl bg-teal-700 shadow-md"
      style={{ width: size, height: size }}
    >
      <svg className="text-white" width={size * 0.5} height={size * 0.5} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
  );
}

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
    </div>
  );
}

function OpenInTelegram() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="space-y-3 max-w-xs">
        <BrandMark />
        <h1 className="text-lg font-black text-slate-800">Open this from Telegram</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-8 space-y-6 fade-up">
        <div className="text-center space-y-1.5">
          <BrandMark />
          <h1 className="text-2xl font-black text-slate-800 pt-1">LF SYSTEM</h1>
          <p className="text-slate-400 text-xs">
            {telegramUser?.first_name ? `Hi ${telegramUser.first_name} — ` : ''}
            Campus Lost &amp; Found
          </p>
        </div>

        <form className="space-y-3.5" onSubmit={submit}>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <input
              type="email" inputMode="email" autoComplete="email" className="input-field"
              placeholder="you@university.edu" value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <input
              type="password" autoComplete="current-password" className="input-field"
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          {error && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-center leading-relaxed">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-2.5 rounded-xl text-sm">
            {busy ? 'Linking…' : 'Link My Account'}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Linked once to your existing LF System login. Nothing is posted to
          Telegram on your behalf.
        </p>
      </div>
    </div>
  );
}

/* ─── Board ──────────────────────────────────────────────────── */
function Board({ user, onSignOut }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
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
      setLostItems(Array.isArray(l) ? l : []);
      setFoundItems(Array.isArray(f) ? f : []);
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

  useEffect(() => bindBackButton(detail ? () => setDetail(null) : null), [detail]);

  const matches = useCallback((i) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [i.ItemName, i.Description, i.LocationName, i.CategoryName, i.Brand, i.Color]
      .some((v) => (v || '').toLowerCase().includes(q));
  }, [search]);

  const lost = useMemo(() => lostItems.filter(matches), [lostItems, matches]);
  const found = useMemo(() => foundItems.filter(matches), [foundItems, matches]);

  if (detail) {
    return <ItemDetail item={detail.item} kind={detail.kind} onClose={() => setDetail(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header, mirroring the web navbar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandMark size={34} />
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 leading-tight">LF SYSTEM</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.Name}</p>
            </div>
          </div>
          <button onClick={onSignOut} className="text-[11px] font-bold text-slate-400 shrink-0">
            Unlink
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input-field input-field-search"
            placeholder="Search items, brands, places…"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button onClick={() => { haptic(); setTab('all'); }}
            className={`tab-btn ${tab === 'all' ? 'tab-btn-active-all' : 'tab-btn-idle'}`}>
            All ({lost.length + found.length})
          </button>
          <button onClick={() => { haptic(); setTab('lost'); }}
            className={`tab-btn ${tab === 'lost' ? 'tab-btn-active-lost' : 'tab-btn-idle'}`}>
            <AlertCircle className="inline w-3 h-3 mr-1" />Lost ({lost.length})
          </button>
          <button onClick={() => { haptic(); setTab('found'); }}
            className={`tab-btn ${tab === 'found' ? 'tab-btn-active-found' : 'tab-btn-idle'}`}>
            <CheckCircle className="inline w-3 h-3 mr-1" />Found ({found.length})
          </button>
        </div>

        {loading && <SkeletonList />}

        {!loading && failed && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">Could not load the board</p>
            <button onClick={load} className="btn-ghost px-4 py-2 rounded-xl text-xs">Try again</button>
          </div>
        )}

        {!loading && !failed && (
          <div className="space-y-4">
            {(tab === 'all' || tab === 'lost') && lost.map((item) => (
              <ItemCard key={`l-${item.LostID}`} item={item} kind="lost"
                onOpen={() => { haptic(); setDetail({ item, kind: 'lost' }); }} />
            ))}
            {(tab === 'all' || tab === 'found') && found.map((item) => (
              <ItemCard key={`f-${item.FoundID}`} item={item} kind="found"
                onOpen={() => { haptic(); setDetail({ item, kind: 'found' }); }} />
            ))}

            {((tab === 'all' && lost.length + found.length === 0) ||
              (tab === 'lost' && lost.length === 0) ||
              (tab === 'found' && found.length === 0)) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-1.5">
                <Package className="w-9 h-9 mx-auto text-slate-200" />
                <p className="text-xs font-bold text-slate-600">
                  {search ? 'No items match that search' : 'Nothing on the board yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {search ? 'Try a different word.' : 'Approved reports appear here.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-[10px] text-slate-400">
        © 2026 Royal University of Phnom Penh — Lost &amp; Found
      </footer>
    </div>
  );
}

/* ─── Card, matching the web portal's item card ──────────────── */
function ItemCard({ item, kind, onOpen }) {
  const lost = kind === 'lost';
  return (
    <button onClick={onOpen}
      className={`item-card ${lost ? 'item-card-lost' : 'item-card-found'} w-full text-left fade-up`}>
      <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
        <ItemImage src={item.Image} alt={item.ItemName} type={kind} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <span className={`${lost ? 'badge-lost' : 'badge-found'} absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg`}>
          {lost ? 'Lost' : 'Found'}
        </span>
        {item.Status === 'Claimed'
          ? <span className="badge-claimed absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Claimed</span>
          : !lost && <span className="badge-available absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Available</span>}
        {item.ApprovalStatus === 'Pending' && (
          <span className="badge-pending absolute bottom-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
            Pending review
          </span>
        )}
      </div>

      <div className="p-4 flex-1 space-y-2">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.ItemName}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {item.Description || 'No description provided.'}
        </p>
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {item.Brand && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Tag className="w-3 h-3 text-teal-500 shrink-0" />{item.Brand}{item.Color ? ` · ${item.Color}` : ''}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3 text-teal-500 shrink-0" />
            <span className="truncate">{item.LocationName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
            {lost ? 'Lost on ' : 'Found on '}{item.DateLost || item.DateFound}
            {item.ReportTime ? ` at ${item.ReportTime}` : ''}
          </div>
        </div>
      </div>
    </button>
  );
}

/* Mirrors the web portal's placeholder treatment for a missing photo */
function ItemImage({ src, alt, type }) {
  const [erroredSrc, setErroredSrc] = useState(null);
  const broken = !src || erroredSrc === src;

  if (broken) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
        type === 'lost'
          ? 'bg-gradient-to-br from-rose-50 to-slate-100 text-rose-700'
          : 'bg-gradient-to-br from-teal-50 to-slate-100 text-teal-700'
      }`}>
        <Package className="w-10 h-10 stroke-[1.5] mb-1 opacity-60" />
        <span className="text-xs font-bold truncate max-w-[90%]">{alt}</span>
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">No Image Uploaded</span>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy"
      onError={() => setErroredSrc(src)}
      className="w-full h-full object-cover" />
  );
}

/* ─── Loading skeleton, shaped like the real cards ───────────── */
function SkeletonList() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="item-card">
          <div className="h-52 skeleton" />
          <div className="p-4 space-y-2.5">
            <div className="h-3.5 w-1/2 rounded skeleton" />
            <div className="h-2.5 w-full rounded skeleton" />
            <div className="h-2.5 w-4/5 rounded skeleton" />
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="h-2.5 w-2/5 rounded skeleton" />
              <div className="h-2.5 w-1/3 rounded skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Detail ─────────────────────────────────────────────────── */
function ItemDetail({ item, kind, onClose }) {
  const lost = kind === 'lost';
  return (
    <div className="min-h-screen flex flex-col fade-up">
      <header className="bg-white border-b border-slate-200 px-3 py-2.5 sticky top-0 z-10 flex items-center gap-2">
        <button onClick={onClose} className="p-1.5 -ml-1 rounded-lg text-slate-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="text-sm font-bold text-slate-800 truncate">{item.ItemName}</p>
      </header>

      <div className="relative h-60 bg-slate-100 shrink-0">
        <ItemImage src={item.Image} alt={item.ItemName} type={kind} />
        <span className={`${lost ? 'badge-lost' : 'badge-found'} absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg`}>
          {lost ? 'Lost' : 'Found'}
        </span>
        {item.Status === 'Claimed' && (
          <span className="badge-claimed absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Claimed</span>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="space-y-1.5">
          <h1 className="text-lg font-black text-slate-900 leading-tight">{item.ItemName}</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {item.Description || 'No description provided.'}
          </p>
        </div>

        <dl className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          <Row icon={Tag} label="Category" value={item.CategoryName} />
          <Row icon={Package} label="Details" value={[item.Brand, item.Color].filter(Boolean).join(' · ')} />
          <Row icon={MapPin} label="Location" value={item.LocationName} />
          <Row icon={Calendar} label={lost ? 'Lost on' : 'Found on'}
            value={[item.DateLost || item.DateFound, item.ReportTime].filter(Boolean).join(' · ')} />
          <Row icon={User} label="Reported by" value={item.OwnerName} />
        </dl>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-teal-900 leading-relaxed">
            To claim this item or message the person who reported it, open the
            full LF System portal.
          </p>
        </div>

        <button onClick={onClose} className="btn-ghost w-full py-2.5 rounded-xl text-xs">
          Back to the board
        </button>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 p-3.5">
      <Icon className="w-3.5 h-3.5 mt-0.5 text-teal-600 shrink-0" />
      <div className="min-w-0">
        <dt className="section-label text-slate-400">{label}</dt>
        <dd className="text-xs font-medium text-slate-800 break-words mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
