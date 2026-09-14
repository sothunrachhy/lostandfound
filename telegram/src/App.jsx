import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, MapPin, Calendar, Package, Tag, ShieldCheck, AlertCircle, CheckCircle,
  RefreshCw, Bell, User, Plus, Trash2, Globe, MessageSquare,
} from 'lucide-react';
import {
  isTelegram, initData, telegramUser,
  ready, applyTheme, onThemeChange, bindBackButton, haptic, notifyHaptic,
} from './telegram';
import { setToken, clearToken, setUnauthorizedHandler } from './auth';
import { translations, getCategoryName, getLocationName } from './translations';
import {
  BrandMark, ScreenHeader, ItemImage, ItemCard, SkeletonList, EmptyState, ErrorNote,
} from './components/Ui';
import ReportForm from './views/ReportForm';
import ClaimForm from './views/ClaimForm';
import Notifications from './views/Notifications';
import Chat from './views/Chat';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const LANGS = [
  ['en', 'English'], ['km', 'ខ្មែរ'], ['ja', '日本語'], ['ko', '한국어'], ['zh', '中文'],
];

export default function App() {
  const [phase, setPhase] = useState(isTelegram ? 'starting' : 'unsupported');
  const [user, setUser] = useState(null);
  const [bootError, setBootError] = useState('');

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
        setBootError('Could not reach the service. Check your connection and try again.');
        setPhase('link');
      }
    })();
  }, []);

  if (phase === 'starting') return <Splash />;
  if (phase === 'unsupported') return <OpenInTelegram />;
  if (phase === 'link') {
    return (
      <LinkAccount
        initialError={bootError}
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
    <Shell
      user={user}
      onSignOut={() => { clearToken(); setUser(null); setPhase('link'); }}
    />
  );
}

/* ─── Small screens ──────────────────────────────────────────── */
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
            <input type="email" inputMode="email" autoComplete="email" className="input-field"
              placeholder="you@university.edu" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <input type="password" autoComplete="current-password" className="input-field"
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <ErrorNote>{error}</ErrorNote>

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

/* ─── Shell: data, navigation, and the views ─────────────────── */
function Shell({ user, onSignOut }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lf_tg_lang') || 'en'; } catch { return 'en'; }
  });
  const t = translations[lang] || translations.en;

  // A small view stack: name plus whatever that view needs.
  const [view, setView] = useState({ name: 'board' });

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const [l, f, c, loc, n, u] = await Promise.all([
        fetch(`${API}/api/lost-items`).then((r) => r.json()),
        fetch(`${API}/api/found-items`).then((r) => r.json()),
        fetch(`${API}/api/categories`).then((r) => r.json()),
        fetch(`${API}/api/locations`).then((r) => r.json()),
        fetch(`${API}/api/notifications`).then((r) => r.json()),
        fetch(`${API}/api/users`).then((r) => r.json()),
      ]);
      const list = (v) => (Array.isArray(v) ? v : []);
      setLostItems(list(l));
      setFoundItems(list(f));
      setCategories(list(c));
      setLocations(list(loc));
      setNotifications(list(n));
      setContacts(list(u).filter((x) => x.UserID !== user?.UserID));
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [user?.UserID]);

  // Fetching on mount is what effects are for; the rule cannot see that every
  // setState in load() happens after an await.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    try { localStorage.setItem('lf_tg_lang', lang); } catch { /* storage blocked */ }
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Telegram's hardware back button pops the stack before leaving the app.
  const atRoot = view.name === 'board';
  useEffect(
    () => bindBackButton(atRoot ? null : () => setView({ name: 'board' })),
    [atRoot]
  );

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  };

  const markRead = async (id) => {
    setNotifications((ns) =>
      ns.map((n) => (n.NotificationID === id ? { ...n, Status: 'Read' } : n)));
    try {
      await fetch(`${API}/api/notifications/${id}/read`, { method: 'PUT' });
    } catch { /* optimistic; the next load corrects it */ }
  };

  const deleteReport = async (kind, id) => {
    try {
      const res = await fetch(`${API}/api/${kind === 'lost' ? 'lost-items' : 'found-items'}/${id}`,
        { method: 'DELETE' });
      if (res.ok) {
        notifyHaptic('success');
        setView({ name: 'board' });
        flash('Your report was deleted.');
        load();
      } else {
        flash('That report could not be deleted.');
      }
    } catch {
      flash(t.connectionError || 'Could not reach the service.');
    }
  };

  const markReturned = async (item) => {
    try {
      const res = await fetch(`${API}/api/claims/approve-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundId: item.FoundID, ownerId: null }),
      });
      const data = await res.json();
      if (data.success) {
        notifyHaptic('success');
        setView({ name: 'board' });
        flash('Marked as returned.');
        load();
      } else {
        flash(data.message || 'Could not update that item.');
      }
    } catch {
      flash(t.connectionError || 'Could not reach the service.');
    }
  };

  const unread = notifications.filter((n) => n.Status === 'Unread').length;
  const shared = { API, user, lang, t, categories, locations };

  if (view.name === 'report') {
    return (
      <ReportForm
        {...shared} mode={view.mode} currentUser={user}
        onBack={() => setView({ name: 'board' })}
        onDone={() => {
          setView({ name: 'board' });
          flash(t.reportPendingMsg || 'Your report was submitted. It appears on the board once an admin approves it.');
          load();
        }}
      />
    );
  }

  if (view.name === 'claim') {
    return (
      <ClaimForm
        API={API} item={view.item} currentUser={user} t={t}
        onBack={() => setView({ name: 'detail', item: view.item, kind: 'found' })}
        onDone={() => {
          setView({ name: 'board' });
          flash('Your claim was submitted for verification.');
          load();
        }}
      />
    );
  }

  if (view.name === 'chat') {
    return (
      <Chat
        API={API} currentUser={user} contacts={contacts} t={t}
        initialRecipient={view.recipient}
        onBack={() => setView({ name: 'board' })}
      />
    );
  }

  if (view.name === 'notifications') {
    return (
      <Notifications notifications={notifications} onMarkRead={markRead}
        onBack={() => setView({ name: 'board' })} />
    );
  }

  if (view.name === 'profile') {
    return (
      <Profile user={user} lang={lang} onLang={setLang} onSignOut={onSignOut}
        onBack={() => setView({ name: 'board' })} />
    );
  }

  if (view.name === 'detail') {
    return (
      <ItemDetail
        item={view.item} kind={view.kind} user={user} lang={lang}
        onBack={() => setView({ name: 'board' })}
        onClaim={() => setView({ name: 'claim', item: view.item })}
        onMessage={() => setView({
          name: 'chat',
          recipient: contacts.find((c) => c.UserID === view.item.UserID) || null,
        })}
        onDelete={() => deleteReport(view.kind, view.kind === 'lost' ? view.item.LostID : view.item.FoundID)}
        onMarkReturned={() => markReturned(view.item)}
      />
    );
  }

  return (
    <Board
      {...shared}
      lostItems={lostItems} foundItems={foundItems}
      loading={loading} failed={failed} unread={unread} toast={toast}
      onRetry={load}
      onOpen={(item, kind) => { haptic(); setView({ name: 'detail', item, kind }); }}
      onReport={(mode) => { haptic(); setView({ name: 'report', mode }); }}
      onChat={() => { haptic(); setView({ name: 'chat' }); }}
      onNotifications={() => { haptic(); setView({ name: 'notifications' }); }}
      onProfile={() => { haptic(); setView({ name: 'profile' }); }}
    />
  );
}

/* ─── Board ──────────────────────────────────────────────────── */
function Board({
  user, t, lostItems, foundItems, loading, failed, unread, toast,
  onRetry, onOpen, onReport, onChat, onNotifications, onProfile,
}) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const matches = useCallback((i) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [i.ItemName, i.Description, i.LocationName, i.CategoryName, i.Brand, i.Color]
      .some((v) => (v || '').toLowerCase().includes(q));
  }, [search]);

  const mine = useCallback((i) => i.UserID === user?.UserID, [user]);

  const lost = useMemo(() => lostItems.filter(matches), [lostItems, matches]);
  const found = useMemo(() => foundItems.filter(matches), [foundItems, matches]);
  const myItems = useMemo(
    () => [...lostItems.filter(mine).map((i) => [i, 'lost']), ...foundItems.filter(mine).map((i) => [i, 'found'])]
      .filter(([i]) => matches(i)),
    [lostItems, foundItems, mine, matches]
  );

  const showLost = tab === 'all' || tab === 'lost';
  const showFound = tab === 'all' || tab === 'found';
  const visibleCount = tab === 'mine' ? myItems.length : (showLost ? lost.length : 0) + (showFound ? found.length : 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandMark size={34} />
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 leading-tight">LF SYSTEM</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.Name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onChat} className="p-2 rounded-xl text-slate-500" aria-label="Messages">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button onClick={onNotifications} className="relative p-2 rounded-xl text-slate-500" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <button onClick={onProfile} className="p-2 rounded-xl text-slate-500" aria-label="Profile">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => onReport('lost')}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Plus className="w-3.5 h-3.5" />{t.reportLost || 'Report Lost'}
          </button>
          <button onClick={() => onReport('found')}
            className="btn-primary py-2.5 rounded-xl text-xs">
            <Plus className="w-3.5 h-3.5" />{t.reportFound || 'Report Found'}
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input className="input-field input-field-search"
            placeholder={t.searchPlaceholder || 'Search items, brands, places…'}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button onClick={() => { haptic(); setTab('all'); }}
            className={`tab-btn ${tab === 'all' ? 'tab-btn-active-all' : 'tab-btn-idle'}`}>
            {t.allItems || 'All'} ({lost.length + found.length})
          </button>
          <button onClick={() => { haptic(); setTab('lost'); }}
            className={`tab-btn ${tab === 'lost' ? 'tab-btn-active-lost' : 'tab-btn-idle'}`}>
            <AlertCircle className="inline w-3 h-3 mr-1" />{t.lostItems || 'Lost'} ({lost.length})
          </button>
          <button onClick={() => { haptic(); setTab('found'); }}
            className={`tab-btn ${tab === 'found' ? 'tab-btn-active-found' : 'tab-btn-idle'}`}>
            <CheckCircle className="inline w-3 h-3 mr-1" />{t.foundItems || 'Found'} ({found.length})
          </button>
          <button onClick={() => { haptic(); setTab('mine'); }}
            className={`tab-btn ${tab === 'mine' ? 'tab-btn-active-all' : 'tab-btn-idle'}`}>
            <User className="inline w-3 h-3 mr-1" />Mine ({myItems.length})
          </button>
        </div>

        {loading && <SkeletonList />}

        {!loading && failed && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">Could not load the board</p>
            <button onClick={onRetry} className="btn-ghost px-4 py-2 rounded-xl text-xs">Try again</button>
          </div>
        )}

        {!loading && !failed && (
          <div className="space-y-4">
            {tab === 'mine'
              ? myItems.map(([item, kind]) => (
                  <ItemCard key={`${kind}-${item.LostID ?? item.FoundID}`} item={item} kind={kind}
                    onOpen={() => onOpen(item, kind)} />
                ))
              : (
                <>
                  {showLost && lost.map((item) => (
                    <ItemCard key={`l-${item.LostID}`} item={item} kind="lost"
                      onOpen={() => onOpen(item, 'lost')} />
                  ))}
                  {showFound && found.map((item) => (
                    <ItemCard key={`f-${item.FoundID}`} item={item} kind="found"
                      onOpen={() => onOpen(item, 'found')} />
                  ))}
                </>
              )}

            {visibleCount === 0 && (
              <EmptyState
                title={search ? 'No items match that search'
                  : tab === 'mine' ? "You haven't reported anything yet"
                  : 'Nothing on the board yet'}
                hint={search ? 'Try a different word.'
                  : tab === 'mine' ? 'Your reports appear here, including ones awaiting review.'
                  : 'Approved reports appear here.'}
              />
            )}
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-20 fade-up">
          <div className="bg-slate-900 text-white text-xs rounded-2xl px-4 py-3 text-center shadow-lg leading-relaxed">
            {toast}
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-[10px] text-slate-400">
        © 2026 Royal University of Phnom Penh — Lost &amp; Found
      </footer>
    </div>
  );
}

/* ─── Item detail ────────────────────────────────────────────── */
function ItemDetail({ item, kind, user, lang, onBack, onClaim, onMessage, onDelete, onMarkReturned }) {
  const lost = kind === 'lost';
  const isMine = item.UserID === user?.UserID;
  const claimable = !lost && !isMine && item.Status !== 'Claimed' && item.ApprovalStatus === 'Approved';
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="min-h-screen flex flex-col fade-up">
      <ScreenHeader title={item.ItemName} onBack={onBack} />

      <div className="relative h-60 bg-slate-100 shrink-0">
        <ItemImage src={item.Image} alt={item.ItemName} type={kind} />
        <span className={`${lost ? 'badge-lost' : 'badge-found'} absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg`}>
          {lost ? 'Lost' : 'Found'}
        </span>
        {item.Status === 'Claimed' && (
          <span className="badge-claimed absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Claimed</span>
        )}
        {item.ApprovalStatus === 'Pending' && (
          <span className="badge-pending absolute bottom-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
            Pending review
          </span>
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
          <Row icon={Tag} label="Category" value={getCategoryName(item.CategoryName, lang)} />
          <Row icon={Package} label="Details" value={[item.Brand, item.Color].filter(Boolean).join(' · ')} />
          <Row icon={MapPin} label="Location" value={getLocationName(item.LocationName, lang)} />
          <Row icon={Calendar} label={lost ? 'Lost on' : 'Found on'}
            value={[item.DateLost || item.DateFound, item.ReportTime].filter(Boolean).join(' · ')} />
          <Row icon={User} label="Reported by" value={isMine ? 'You' : item.OwnerName} />
        </dl>

        {item.ApprovalStatus === 'Pending' && isMine && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Only you can see this. It appears on the board once an
              administrator approves it.
            </p>
          </div>
        )}

        {claimable && (
          <button onClick={onClaim} className="btn-primary w-full py-3 rounded-xl text-sm">
            <ShieldCheck className="w-4 h-4" />This is mine — claim it
          </button>
        )}

        {isMine && !lost && item.Status !== 'Claimed' && (
          <button onClick={onMarkReturned} className="btn-ghost w-full py-2.5 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4" />Mark as returned
          </button>
        )}

        {isMine && (
          confirming ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-3.5 space-y-2.5">
              <p className="text-xs text-slate-700 leading-relaxed text-center">
                Permanently delete this report? This cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setConfirming(false)} className="btn-ghost py-2 rounded-xl text-xs">
                  Cancel
                </button>
                <button onClick={onDelete}
                  className="py-2 rounded-xl text-xs font-bold bg-rose-600 text-white">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 inline-flex items-center justify-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />Delete my report
            </button>
          )
        )}

        {!isMine && (
          <button onClick={onMessage} className="btn-ghost w-full py-2.5 rounded-xl text-xs">
            <MessageSquare className="w-4 h-4" />
            Message {item.OwnerName?.split(' ')[0] || 'them'}
          </button>
        )}
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

/* ─── Profile ────────────────────────────────────────────────── */
function Profile({ user, lang, onLang, onSignOut, onBack }) {
  return (
    <div className="min-h-screen flex flex-col fade-up">
      <ScreenHeader title="Profile" onBack={onBack} />

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-teal-700 text-white font-black text-xl mx-auto flex items-center justify-center overflow-hidden">
            {user?.ProfileImage
              ? <img src={user.ProfileImage} alt="" className="w-full h-full object-cover" />
              : (user?.Name?.charAt(0).toUpperCase() || 'U')}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{user?.Name}</p>
            <p className="text-[11px] text-slate-400">{user?.Email}</p>
          </div>
          {user?.StudentID && (
            <p className="text-[10px] text-slate-400">Student ID · {user.StudentID}</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <p className="section-label text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />Language
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map(([code, label]) => (
              <button key={code} onClick={() => { haptic(); onLang(code); }}
                className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                  lang === code
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Editing your name, phone or photo happens in the full LF System
            portal. Unlinking only signs this Telegram account out — your LF
            account is untouched.
          </p>
          <button onClick={onSignOut}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200">
            Unlink this Telegram account
          </button>
        </div>
      </div>
    </div>
  );
}
