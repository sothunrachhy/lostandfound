import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { ReportModal, ClaimModal, ChatDrawer, NotificationsDrawer, ProfileModal, SuccessModal } from './components/Modals';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lf_lang') || 'en');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    if (lang === 'km') {
      document.body.classList.add('lang-km');
    } else {
      document.body.classList.remove('lang-km');
    }
  }, [lang]);

  // Session — persisted in localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLogin, setShowLogin] = useState(!currentUser);

  // Data
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  // Modals
  const [reportMode, setReportMode] = useState('lost');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimFoundItem, setClaimFoundItem] = useState(null);
  const [claimLostItem, setClaimLostItem] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [catR, locR, lostR, foundR, matchR, notifR, usersR] = await Promise.all([
        fetch(`${API}/api/categories`).then(r => r.json()),
        fetch(`${API}/api/locations`).then(r => r.json()),
        fetch(`${API}/api/lost-items`).then(r => r.json()),
        fetch(`${API}/api/found-items`).then(r => r.json()),
        fetch(`${API}/api/matches`).then(r => r.json()),
        fetch(`${API}/api/notifications?userId=${currentUser.UserID}`).then(r => r.json()),
        fetch(`${API}/api/users`).then(r => r.json()),
      ]);

      // Check if logged-in user still exists in database
      const validUser = usersR?.find(u => u.UserID === currentUser.UserID);
      if (!validUser) {
        localStorage.removeItem('lf_user');
        setCurrentUser(null);
        setShowLogin(true);
        return;
      }

      setCategories(catR || []);
      setLocations(locR || []);
      setLostItems(lostR || []);
      setFoundItems(foundR || []);
      setMatches(matchR || []);
      setNotifications(notifR || []);
    } catch (e) {
      console.error('API error:', e);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  const notify = (title, message, type = 'success') => {
    setSuccessModal({ isOpen: true, title, message, type });
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        // Block admin from user portal
        if (data.user.RoleID === 2) {
          notify('Admin Account Detected', 'Admins must sign in via the Admin Portal.', 'info');
          return;
        }
        localStorage.setItem('lf_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setShowLogin(false);
      } else {
        notify('Sign In Failed', data.message || 'Invalid email or password', 'error');
      }
    } catch (e) {
      notify('Connection Error', 'Cannot connect to server. Is the backend running?', 'error');
    }
  };

  const handleRegister = async (form) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, roleID: 1 }) // Force User role
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('lf_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setShowLogin(false);
      } else {
        notify('Registration Failed', data.message, 'error');
      }
    } catch (e) {
      notify('Connection Error', 'Cannot connect to server.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lf_user');
    setCurrentUser(null);
    setShowLogin(true);
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
        localStorage.setItem('lf_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        notify('Profile Updated!', 'Your profile information has been saved successfully.', 'success');
      } else {
        notify('Update Failed', data.message, 'error');
      }
    } catch (e) {
      notify('Error', 'Failed to update profile. Please try again.', 'error');
    }
  };

  const handleSubmitReport = async (data) => {
    try {
      const endpoint = data.mode === 'lost' ? '/api/lost-items' : '/api/found-items';
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
        notify('Report Created!', 'Your report has been published to the campus board.', 'success');
      } else {
        notify('Submission Failed', result.message || 'Unknown error', 'error');
      }
    } catch (e) {
      notify('Connection Error', 'Error submitting report. Cannot connect to server.', 'error');
    }
  };

  const handleDeleteReport = async (type, id) => {
    await fetch(`${API}/api/${type === 'lost' ? 'lost-items' : 'found-items'}/${id}`, { method: 'DELETE' });
    fetchData();
    notify('Report Deleted', 'The report has been removed.', 'info');
  };

  const handleOpenClaim = (foundItem, lostItem = null) => {
    setClaimFoundItem(foundItem);
    setClaimLostItem(lostItem);
    setIsClaimOpen(true);
  };

  const handleSubmitClaim = async (data) => {
    const res = await fetch(`${API}/api/claims`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      fetchData();
      notify('Claim Submitted!', 'Your ownership verification claim was sent.', 'success');
    }
  };

  const handleApproveDirect = async (foundId = null, ownerId = null) => {
    if (!currentUser) return;
    try {
      if (foundId) {
        const res = await fetch(`${API}/api/found-items/${foundId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Claimed' })
        });
        const data = await res.json();
        if (data.success) {
          fetchData();
          notify('🎉 Item Returned!', 'The item has been successfully marked as returned and updated across the platform.', 'success');
          return;
        }
      }
      const res = await fetch(`${API}/api/claims/approve-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundId, finderId: currentUser.UserID, ownerId })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        notify('🎉 Item Returned!', 'The item has been successfully marked as returned and updated across the platform.', 'success');
      } else {
        notify('Update Error', data.message || 'Could not mark item as returned', 'error');
      }
    } catch (e) {
      notify('Update Error', 'Error marking item as returned: ' + e.message, 'error');
    }
  };

  const [allUsers, setAllUsers] = useState([]);

  const handleFetchMessages = async (targetUserId) => {
    if (!currentUser || !targetUserId) return;
    try {
      const thread = await fetch(`${API}/api/messages?userId1=${currentUser.UserID}&userId2=${targetUserId}`).then(r => r.json());
      setMessages(thread || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenChat = async (userId = null) => {
    try {
      const usersRes = await fetch(`${API}/api/users`).then(r => r.json());
      const otherUsers = (usersRes || []).filter(u => u.UserID !== currentUser.UserID);
      setAllUsers(otherUsers);

      let target = null;
      if (userId) {
        target = otherUsers.find(u => u.UserID === userId) || usersRes.find(u => u.UserID === userId);
      }
      if (!target && otherUsers.length > 0) {
        target = otherUsers[0];
      }

      setChatRecipient(target || null);

      if (target) {
        await handleFetchMessages(target.UserID);
      } else {
        setMessages([]);
      }
    } catch (e) { setMessages([]); }
    setIsChatOpen(true);
  };

  const handleSendMessage = async (msgData) => {
    const res = await fetch(`${API}/api/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });
    const result = await res.json();
    if (result.success && chatRecipient) {
      handleFetchMessages(chatRecipient.UserID);
    }
  };

  const handleMarkNotifRead = async (id) => {
    await fetch(`${API}/api/notifications/${id}/read`, { method: 'PUT' });
    fetchData();
  };

  const unreadCount = notifications.filter(n => n.Status === 'Unread').length;

  if (showLogin || !currentUser) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentUser={currentUser}
        unreadCount={unreadCount}
        lang={lang}
        onLangChange={(l) => { setLang(l); localStorage.setItem('lf_lang', l); }}
        onOpenNotifs={() => setIsNotifOpen(true)}
        onOpenChat={() => handleOpenChat()}
        onOpenReport={(mode) => { setReportMode(mode); setIsReportOpen(true); }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        <HomePage
          lostItems={lostItems}
          foundItems={foundItems}
          matches={matches}
          categories={categories}
          locations={locations}
          currentUser={currentUser}
          lang={lang}
          onOpenReport={(mode) => { setReportMode(mode); setIsReportOpen(true); }}
          onOpenClaim={handleOpenClaim}
          onOpenChat={handleOpenChat}
          onDeleteReport={handleDeleteReport}
          onApproveDirect={handleApproveDirect}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <span>© 2026 Royal University of Phnom Penh (RUPP) — Lost & Found Platform.</span>
        </div>
      </footer>

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}
        mode={reportMode} categories={categories} locations={locations}
        currentUser={currentUser} onSubmit={handleSubmitReport} />

      <ClaimModal isOpen={isClaimOpen} onClose={() => setIsClaimOpen(false)}
        foundItem={claimFoundItem} lostItem={claimLostItem}
        currentUser={currentUser} onSubmit={handleSubmitClaim} />

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)}
        messages={messages} currentUser={currentUser}
        recipient={chatRecipient} allUsers={allUsers}
        onSelectRecipient={(u) => { setChatRecipient(u); handleFetchMessages(u.UserID); }}
        onSend={handleSendMessage} onFetchMessages={handleFetchMessages}
        onApproveDirect={handleApproveDirect} />

      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)}
        notifications={notifications} onMarkRead={handleMarkNotifRead} />

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser} onSaveProfile={handleSaveProfile} />

      <NotificationModal isOpen={successModal.isOpen} onClose={() => setSuccessModal(s => ({ ...s, isOpen: false }))}
        title={successModal.title} message={successModal.message} type={successModal.type} />
    </div>
  );
}

/* ─── Auth Page ─────────────────────────────────────────────── */
function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', studentID: '', email: '', phone: '', password: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-8 space-y-6 fade-up">

        {/* Brand */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-700 shadow-md mb-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800">LF SYSTEM</h1>
          <p className="text-slate-400 text-xs">Student Portal — Campus Lost & Found</p>
        </div>

        {/* Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
          <button onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Sign In
          </button>
          <button onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Register
          </button>
        </div>

        {/* Form */}
        <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); mode === 'login' ? onLogin(form) : onRegister(form); }}>
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                <input className="input-field" placeholder="e.g. Alex Morgan" value={form.name} onChange={set('name')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Student ID</label>
                  <input className="input-field" placeholder="STU-2024-XXXX" value={form.studentID} onChange={set('studentID')} /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                  <input className="input-field" placeholder="+1 (555)..." value={form.phone} onChange={set('phone')} /></div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <input type="email" className="input-field" placeholder="you@university.edu" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5 rounded-xl text-sm justify-center">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
