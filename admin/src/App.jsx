import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar';
import Dashboard from './pages/Dashboard';
import ClaimsPage from './pages/ClaimsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationModal from './components/NotificationModal';
import AdminProfileModal from './components/AdminProfileModal';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const s = localStorage.getItem('lf_admin');
    return s ? JSON.parse(s) : null;
  });
  const [activePage,  setActivePage]  = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [modalNotify, setModalNotify] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [stats,       setStats]       = useState({});
  const [claims,      setClaims]      = useState([]);
  const [lostItems,   setLostItems]   = useState([]);
  const [foundItems,  setFoundItems]  = useState([]);
  const [users,       setUsers]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [locations,   setLocations]   = useState([]);

  const notify = (title, message, type = 'success') => {
    setModalNotify({ isOpen: true, title, message, type });
  };

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
        if (data.user.RoleID !== 2) { notify('Access Restricted', 'Admin Portal is restricted to Admin accounts.', 'info'); return; }
        localStorage.setItem('lf_admin', JSON.stringify(data.user));
        setCurrentAdmin(data.user);
      } else { notify('Sign In Failed', data.message || 'Invalid credentials', 'error'); }
    } catch { notify('Connection Error', 'Cannot connect to API server.', 'error'); }
  };

  const handleLogout = () => { localStorage.removeItem('lf_admin'); setCurrentAdmin(null); };
  const handleUpdateClaim = async (id, status, notes) => { await fetch(`${API}/api/claims/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status, adminNotes: notes }) }); fetchData(); notify('Claim Updated', `Claim #${id} status set to ${status}`, 'success'); };
  const handleDeleteClaim = async (id) => {
    try {
      const res = await fetch(`${API}/api/claims/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Claim Deleted', `Claim #${id} removed from database.`, 'info');
        fetchData();
      } else {
        notify('Delete Failed', data.message || 'Cannot delete claim', 'error');
      }
    } catch {
      notify('Error', 'Failed to delete claim.', 'error');
    }
  };
  const handleDeleteReport = async (type, id) => { await fetch(`${API}/api/${type === 'lost' ? 'lost-items' : 'found-items'}/${id}`, { method: 'DELETE' }); fetchData(); notify('Report Deleted', 'Report removed from database', 'info'); };
  const handleAddCategory  = async (name) => { await fetch(`${API}/api/categories`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ CategoryName: name }) }); fetchData(); notify('Category Created', `Category "${name}" added.`, 'success'); };
  const handleUpdateCategory = async (id, name) => { await fetch(`${API}/api/categories/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ CategoryName: name }) }); fetchData(); notify('Category Updated', 'Category changes saved.', 'success'); };
  const handleDeleteCategory = async (id) => {
    const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.message && !data.success) notify('Cannot Delete Category', data.message, 'error');
    else notify('Category Deleted', 'Category removed.', 'info');
    fetchData();
  };

  const handleAddLocation  = async (name) => { await fetch(`${API}/api/locations`,  { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ LocationName: name }) }); fetchData(); notify('Location Created', `Location "${name}" added.`, 'success'); };
  const handleUpdateLocation = async (id, name) => { await fetch(`${API}/api/locations/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ LocationName: name }) }); fetchData(); notify('Location Updated', 'Location changes saved.', 'success'); };
  const handleDeleteLocation = async (id) => {
    const res = await fetch(`${API}/api/locations/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.message && !data.success) notify('Cannot Delete Location', data.message, 'error');
    else notify('Location Deleted', 'Location removed.', 'info');
    fetchData();
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const res = await fetch(`${API}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('lf_admin', JSON.stringify(data.user));
        setCurrentAdmin(data.user);
        notify('Profile Saved!', 'Admin profile updated successfully.', 'success');
      } else {
        notify('Update Failed', data.message, 'error');
      }
    } catch (e) {
      notify('Error', 'Failed to update admin profile.', 'error');
    }
  };

  if (!currentAdmin) return <AdminLoginPage onLogin={handleLogin} />;

  const pendingClaims = claims.filter(c => c.Status === 'Pending').length;

  return (
    <div className="admin-shell">
      <AdminNavbar currentAdmin={currentAdmin} activePage={activePage} setActivePage={setActivePage}
        pendingClaims={pendingClaims} onLogout={handleLogout} onRefresh={fetchData}
        onOpenProfile={() => setIsProfileOpen(true)} />

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
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {activePage === 'dashboard' && <Dashboard stats={stats} lostItems={lostItems} foundItems={foundItems} claims={claims} categories={categories} locations={locations} />}
          {activePage === 'claims'    && <ClaimsPage claims={claims} onUpdateClaim={handleUpdateClaim} onDeleteClaim={handleDeleteClaim} />}
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

      <AdminProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        currentAdmin={currentAdmin} onSaveProfile={handleSaveProfile} />

      <NotificationModal isOpen={modalNotify.isOpen} onClose={() => setModalNotify(m => ({ ...m, isOpen: false }))}
        title={modalNotify.title} message={modalNotify.message} type={modalNotify.type} />
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
          <p className="text-slate-400 text-xs">Admin — Campus Safety Office</p>
        </div>

        <form className="space-y-3.5" onSubmit={e => { e.preventDefault(); onLogin(form); }}>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Admin Email</label>
            <input type="email" className="admin-input" placeholder="admin123@gmail.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
            <input type="password" className="admin-input" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          </div>
          <button type="submit" className="btn-admin w-full py-2.5 rounded-xl text-sm justify-center font-bold">
            Access Admin
          </button>
        </form>
      </div>
    </div>
  );
}
