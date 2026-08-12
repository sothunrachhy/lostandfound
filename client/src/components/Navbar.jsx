import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, PlusCircle, LogOut, Compass, ChevronDown, User } from 'lucide-react';

export default function Navbar({
  currentUser, unreadCount, lang = 'en', onLangChange,
  onOpenNotifs, onOpenChat, onOpenReport, onOpenProfile, onLogout
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    setImgError(false);
  }, [currentUser?.ProfileImage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = currentUser?.Name ? currentUser.Name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="client-navbar px-3 sm:px-6 py-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 h-16">

        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-700 flex items-center justify-center shadow-sm shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight shrink-0">LF SYSTEM</span>
            <span className="hidden sm:inline text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">Student</span>
          </div>
        </div>

        {/* Center actions — large screens only */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button onClick={() => onOpenReport('lost')}
            className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" /> {lang === 'km' ? 'រាយការណ៍វត្ថុបាត់' : 'Report Lost'}
          </button>
          <button onClick={() => onOpenReport('found')}
            className="btn-outline text-xs py-2 px-4 rounded-xl cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" /> {lang === 'km' ? 'រាយការណ៍វត្ថុប្រទះឃើញ' : 'Report Found'}
          </button>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

          {/* Language Switcher */}
          <div className="relative shrink-0" ref={langRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Change Language"
            >
              <img
                src={lang === 'km' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'}
                alt=""
                className="w-4.5 h-3 sm:w-5 sm:h-3.5 object-cover rounded-sm shadow-xs shrink-0"
              />
              <span className="uppercase text-[11px] sm:text-xs">{lang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1 w-38 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 fade-up space-y-0.5">
                <button
                  onClick={() => { onLangChange('en'); setShowLangMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${
                    lang === 'en' ? 'text-teal-700 font-bold bg-teal-50/60' : 'text-slate-700'
                  }`}
                >
                  <img src="https://flagcdn.com/w40/us.png" alt="" className="w-5 h-3.5 object-cover rounded-sm shadow-xs shrink-0" />
                  English (US)
                </button>
                <button
                  onClick={() => { onLangChange('km'); setShowLangMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${
                    lang === 'km' ? 'text-teal-700 font-bold bg-teal-50/60' : 'text-slate-700'
                  }`}
                >
                  <img src="https://flagcdn.com/w40/kh.png" alt="" className="w-5 h-3.5 object-cover rounded-sm shadow-xs shrink-0" />
                  ភាសាខ្មែរ (Khmer)
                </button>
              </div>
            )}
          </div>

          <button onClick={onOpenChat}
            className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all cursor-pointer shrink-0"
            title="Messages">
            <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button onClick={onOpenNotifs}
            className="relative p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all cursor-pointer shrink-0"
            title="Notifications">
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 border-2 border-white" />
            )}
          </button>

          <div className="h-5 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

          {/* Avatar + name */}
          <button onClick={onOpenProfile} className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer shrink-0" title="Edit Profile">
            {currentUser?.ProfileImage && !imgError ? (
              <img
                src={currentUser.ProfileImage}
                alt={currentUser.Name || ''}
                onError={() => setImgError(true)}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userInitial}
              </div>
            )}
            <span className="hidden lg:block text-xs font-semibold text-slate-700 max-w-[80px] truncate">{currentUser?.Name ? currentUser.Name.split(' ')[0] : 'Profile'}</span>
          </button>

          <button onClick={onLogout}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer shrink-0"
            title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
