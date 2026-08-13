import React, { useState, useEffect } from 'react';
import { GraduationCap, ShieldCheck, ExternalLink, Sparkles, Phone, Mail, MapPin, Info, CheckCircle2, Bookmark, ChevronRight, Clock, Building2 } from 'lucide-react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { ReportModal, ClaimModal, ChatDrawer, NotificationsDrawer, ProfileModal, SuccessModal, NotificationModal, ItemDetailModal, ConfirmModal } from './components/Modals';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lf_lang') || 'en');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [logoutConfirmModal, setLogoutConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: 'Sign Out', onConfirm: () => {} });
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('lang-km', lang === 'km');
    document.body.classList.toggle('lang-ja', lang === 'ja');
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const sendHeartbeat = () => {
      fetch(`${API}/api/users/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.UserID })
      }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 25000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
    notify('Signed Out', 'You have been signed out successfully.', 'info');
  };

  const promptLogout = () => {
    setLogoutConfirmModal({
      isOpen: true,
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      onConfirm: handleLogout
    });
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

  const ruppStats = [
    { label: 'Students', value: '20,000+' },
    { label: 'Faculties', value: '23' },
    { label: 'Programs', value: '70+' },
    { label: 'Est.', value: '1960' },
  ];

  const ruppLinks = [
    { label: 'RUPP Official Website', href: 'https://www.rupp.edu.kh' },
    { label: 'Student Affairs Portal', href: 'https://www.rupp.edu.kh' },
    { label: 'Campus Safety Office', href: 'https://www.rupp.edu.kh' },
    { label: 'Academic Calendar', href: 'https://www.rupp.edu.kh' },
  ];

  const campusTips = [
    { text: 'Report lost items within 24h for maximum recovery chance' },
    { text: 'Keep serial numbers & private identifiers confidential' },
    { text: 'Include clear, well-lit photos when reporting items' },
    { text: 'Use live student chat to arrange safe item return' },
  ];

  const ruppNews = [
    { tag: 'POLICY', color: 'border-l-rose-500 bg-rose-50/50 text-rose-700', title: 'Monthly Unclaimed Donations', desc: 'Unclaimed items after 30 days are transferred to student charity.' },
    { tag: 'HOURS', color: 'border-l-teal-600 bg-teal-50/50 text-teal-800', title: 'Campus Safety Hours', desc: 'Mon–Fri, 8:00 AM – 5:00 PM (Building A, Ground Floor).' },
    { tag: 'ADVICE', color: 'border-l-amber-500 bg-amber-50/50 text-amber-800', title: 'Tag Personal Belongings', desc: 'Write Student ID on laptops, keys & water bottles.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60">
      <Navbar
        currentUser={currentUser}
        unreadCount={unreadCount}
        lang={lang}
        onLangChange={(l) => { setLang(l); localStorage.setItem('lf_lang', l); }}
        onOpenNotifs={() => setIsNotifOpen(true)}
        onOpenChat={() => handleOpenChat()}
        onOpenReport={(mode) => { setReportMode(mode); setIsReportOpen(true); }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={promptLogout}
      />

      {/* ── 3-column layout ── */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex gap-0 xl:gap-6 px-0 xl:px-6 py-6 items-start">

        {/* ── LEFT SIDEBAR — RUPP Identity & Links ── */}
        <aside className="hidden xl:flex flex-col gap-4 w-60 shrink-0 sticky top-20 self-start">

          {/* RUPP Institution Card */}
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 via-teal-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-teal-600/30">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 leading-snug tracking-tight">Royal University of Phnom Penh</h3>
                  <p className="text-[11px] text-teal-700 font-bold tracking-tight font-khmer mt-0.5">សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                {ruppStats.map(s => (
                  <div key={s.label} className="bg-teal-50/40 border border-teal-100/60 rounded-xl p-2 text-center">
                    <p className="text-xs font-black text-teal-800 tracking-tight">{s.value}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campus Recovery Guidelines */}
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">Campus Guidelines</p>
            </div>
            <div className="space-y-2.5">
              {campusTips.map((tip, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-snug font-medium">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RUPP Official Links */}
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900">
              <Bookmark className="w-4 h-4 text-teal-600" />
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">Quick Resources</p>
            </div>
            <div className="space-y-1.5">
              {ruppLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl text-[11px] text-slate-600 hover:text-teal-800 hover:bg-teal-50/70 font-semibold transition-all group"
                >
                  <span className="truncate">{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 xl:px-0">
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
            onSelectItem={(item) => setSelectedDetailItem(item)}
          />
        </main>

        {/* ── RIGHT SIDEBAR — RUPP News & Safety Hotline ── */}
        <aside className="hidden xl:flex flex-col gap-4 w-60 shrink-0 sticky top-20 self-start">

          {/* Campus Announcements */}
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 text-slate-900">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">Campus Bulletins</p>
            </div>
            <div className="space-y-2.5">
              {ruppNews.map((n, i) => (
                <div key={i} className={`rounded-xl border-l-3 p-2.5 shadow-2xs ${n.color}`}>
                  <span className="text-[9px] font-black uppercase tracking-wider">{n.tag}</span>
                  <p className="text-[11px] font-bold text-slate-900 mt-0.5 leading-snug">{n.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Safety Hotline */}
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-teal-900 rounded-2xl p-4 shadow-md text-white relative overflow-hidden">
            <div className="flex items-center gap-2 text-teal-300 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-wider">Campus Safety</p>
            </div>
            <h4 className="text-xs font-bold text-white leading-tight">Student Affairs Office</h4>
            <p className="text-[10px] text-teal-200 mt-0.5">Royal University of Phnom Penh</p>

            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-[10px]">
              <div className="flex items-center gap-2 text-slate-200">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold">+855 23 880 009</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold truncate">info@rupp.edu.kh</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold">Russian Federation Blvd, Phnom Penh</span>
              </div>
            </div>
          </div>

          {/* Platform Security Badge */}
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-slate-900">
              <Info className="w-4 h-4 text-teal-600" />
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">Platform Specs</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Official student recovery platform powered by AI match verification & instant peer messaging.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {['AI Matching', 'Encrypted Chat', 'Student ID Verified'].map(tag => (
                <span key={tag} className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200/80 rounded-full px-2 py-0.5 font-bold">{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <span>© 2026 Royal University of Phnom Penh (RUPP) — Lost & Found Platform.</span>
        </div>
      </footer>

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}
        mode={reportMode} categories={categories} locations={locations}
        currentUser={currentUser} onSubmit={handleSubmitReport} lang={lang} />

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

      <ItemDetailModal isOpen={!!selectedDetailItem} onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem} currentUser={currentUser} onOpenChat={handleOpenChat}
        onOpenClaim={handleOpenClaim} onApproveDirect={handleApproveDirect} onDeleteReport={handleDeleteReport} />

      <NotificationModal isOpen={successModal.isOpen} onClose={() => setSuccessModal(s => ({ ...s, isOpen: false }))}
        title={successModal.title} message={successModal.message} type={successModal.type} />

      <ConfirmModal isOpen={logoutConfirmModal.isOpen} onClose={() => setLogoutConfirmModal(s => ({ ...s, isOpen: false }))}
        title={logoutConfirmModal.title} message={logoutConfirmModal.message} confirmText={logoutConfirmModal.confirmText} onConfirm={logoutConfirmModal.onConfirm} />
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
          <p className="text-slate-400 text-xs">Student — Campus Lost & Found</p>
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
