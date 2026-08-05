import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar';
import Dashboard from './pages/Dashboard';
import ClaimsPage from './pages/ClaimsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const s = localStorage.getItem('lf_admin');
    return s ? JSON.parse(s) : null;
  });
  const [activePage,  setActivePage]  = useState('dashboard');
  const [stats,       setStats]       = useState({});
  const [claims,      setClaims]      = useState([]);
  const [lostItems,   setLostItems]   = useState([]);
  const [foundItems,  setFoundItems]  = useState([]);
  const [users,       setUsers]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [locations,   setLocations]   = useState([]);

  const fetchData = async () => {
    if (!currentAdmin) return;
    try {
      const [sr, cr, lr, fr, ur, catr, locr] = await Promise.all([
        fetch(`${API}/api/admin/stats`).then(r => r.json()),
        fetch(`${API}/api/claims`).then(r => r.json()),
        fetch(`${API}/api/lost-items`).then(r => r.json()),
        fetch(`${API}/api/found-items`).then(r => r.json()),
        fetch(`${API}/api/users`).then(r => r.json()),
        fetch(`${API}/api/categories`).then(r => r.json()),
        fetch(`${API}/api/locations`).then(r => r.json()),
      ]);
      setStats(sr||{}); setClaims(cr||[]); setLostItems(lr||[]); setFoundItems(fr||[]);
      setUsers(ur||[]); setCategories(catr||[]); setLocations(locr||[]);
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => { fetchData(); }, [currentAdmin]);

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.success) {
        if (data.user.RoleID !== 2) { alert('⛔ Admin only. Students use http://localhost:3000'); return; }
        localStorage.setItem('lf_admin', JSON.stringify(data.user));
        setCurrentAdmin(data.user);
      } else { alert('Login failed: ' + data.message); }
    } catch { alert('Cannot connect to API.'); }
  };

  const handleLogout = () => { localStorage.removeItem('lf_admin'); setCurrentAdmin(null); };
  const handleUpdateClaim = async (id, status, notes) => { await fetch(`${API}/api/claims/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status, adminNotes: notes }) }); fetchData(); };
  const handleDeleteReport = async (type, id) => { await fetch(`${API}/api/${type === 'lost' ? 'lost-items' : 'found-items'}/${id}`, { method: 'DELETE' }); fetchData(); };
  const handleAddCategory  = async (name) => { await fetch(`${API}/api/categories`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ CategoryName: name }) }); fetchData(); };
  const handleUpdateCategory = async (id, name) => { await fetch(`${API}/api/categories/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ CategoryName: name }) }); fetchData(); };
  const handleDeleteCategory = async (id) => {
    const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.message && !data.success) alert(data.message);
    fetchData();
  };

  const handleAddLocation  = async (name) => { await fetch(`${API}/api/locations`,  { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ LocationName: name }) }); fetchData(); };
  const handleUpdateLocation = async (id, name) => { await fetch(`${API}/api/locations/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ LocationName: name }) }); fetchData(); };
  const handleDeleteLocation = async (id) => {
    const res = await fetch(`${API}/api/locations/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.message && !data.success) alert(data.message);
    fetchData();
  };

  if (!currentAdmin) return <AdminLoginPage onLogin={handleLogin} />;

  const pendingClaims = claims.filter(c => c.Status === 'Pending').length;

  return (
    <div className="admin-shell">
      <AdminNavbar currentAdmin={currentAdmin} activePage={activePage} setActivePage={setActivePage}
        pendingClaims={pendingClaims} onLogout={handleLogout} onRefresh={fetchData} />

      <div className="admin-main">
        {/* Page title bar */}
        <div className="admin-topbar">
          <div>
            <h1 className="text-base font-bold text-slate-800">
              {activePage === 'dashboard' && 'Dashboard'}
              {activePage === 'claims'    && 'Claims Verification'}
              {activePage === 'reports'   && 'Report Moderation'}
              {activePage === 'messages'  && 'Live Student Messaging'}
              {activePage === 'users'     && 'User Management'}
              {activePage === 'settings'  && 'System Settings'}
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">LF System · Admin Control Center</p>
          </div>
          <a href="http://localhost:3000" target="_blank" rel="noreferrer"
            className="text-xs text-teal-700 hover:text-teal-600 font-semibold flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors">
            View User Portal →
          </a>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {activePage === 'dashboard' && <Dashboard stats={stats} lostItems={lostItems} foundItems={foundItems} claims={claims} categories={categories} locations={locations} />}
          {activePage === 'claims'    && <ClaimsPage claims={claims} />}
          {activePage === 'reports'   && <ReportsPage lostItems={lostItems} foundItems={foundItems} onDeleteReport={handleDeleteReport} />}
          {activePage === 'messages'  && <MessagesPage currentAdmin={currentAdmin} users={users} API={API} onRefresh={fetchData} />}
          {activePage === 'users'     && <UsersPage users={users} />}
          {activePage === 'settings'  && (
            <SettingsPage
              categories={categories}
              locations={locations}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddLocation={handleAddLocation}
              onUpdateLocation={handleUpdateLocation}
              onDeleteLocation={handleDeleteLocation}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Login ─────────────────────────────────────────────── */
function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-8 space-y-6 fade-up">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-700 shadow-md mb-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">LF SYSTEM</h1>
          <p className="text-slate-400 text-xs">Admin Portal — Campus Safety Office</p>
        </div>

        <form className="space-y-3.5" onSubmit={e => { e.preventDefault(); onLogin(form); }}>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Admin Email</label>
            <input type="email" className="admin-input" placeholder="admin.safety@university.edu" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
            <input type="password" className="admin-input" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          </div>
          <button type="submit" className="btn-admin w-full py-2.5 rounded-xl text-sm justify-center">
            Access Admin Portal
          </button>
        </form>

        <div className="text-xs text-slate-400 text-center border-t border-slate-100 pt-4 space-y-1">
          <p>Demo: <span className="font-mono text-teal-700">admin.safety@university.edu</span></p>
          <p>Password: <span className="font-mono text-slate-600">adminpassword</span></p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-[10px] text-amber-700 font-semibold">🔒 Restricted to authorized campus safety personnel only</p>
        </div>
      </div>
    </div>
  );
}
