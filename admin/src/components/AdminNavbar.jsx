import React, { useState } from 'react';
import { ShieldCheck, LayoutDashboard, FileText, Users, Settings, MessageSquare, RefreshCw, LogOut, ChevronRight } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'claims',    label: 'Claims',     icon: ShieldCheck },
  { id: 'reports',   label: 'Reports',    icon: FileText },
  { id: 'messages',  label: 'Live Chat',  icon: MessageSquare },
  { id: 'users',     label: 'Users',      icon: Users },
  { id: 'settings',  label: 'Settings',   icon: Settings },
];

export default function AdminNavbar({ currentAdmin, activePage, setActivePage, pendingClaims, onLogout, onRefresh, onOpenProfile }) {
  return (
    <>
      {/* ── Sidebar (desktop) ──────────────────────── */}
      <aside className="admin-sidebar hidden md:flex">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">LF SYSTEM</p>
              <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="section-label text-slate-400 px-3 py-2">Navigation</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActivePage(id)}
              className={`nav-item w-full text-left ${activePage === id ? 'nav-item-active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {id === 'claims' && pendingClaims > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  {pendingClaims}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User + actions */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button onClick={onRefresh} className="nav-item w-full text-left">
            <RefreshCw className="w-4 h-4 shrink-0" /> Refresh Data
          </button>
          <button onClick={onLogout} className="nav-item w-full text-left text-rose-500 hover:bg-rose-50 hover:text-rose-600">
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out
          </button>

          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-between p-2.5 mt-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer group"
            title="Edit Profile"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-teal-600">
                {currentAdmin.ProfileImage ? (
                  <img src={currentAdmin.ProfileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  currentAdmin.Name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors truncate leading-tight">
                  {currentAdmin.Name}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  Administrator
                </p>
              </div>
            </div>

            <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-600 group-hover:bg-white transition-colors shrink-0">
              <Settings className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </aside>

      {/* ── Top navbar (mobile) ────────────────────── */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">LF SYSTEM <span className="text-teal-700">Admin</span></span>
          </div>
          <div className="flex gap-1">
            <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={onLogout} className="p-2 text-rose-400 hover:text-rose-600 cursor-pointer"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-1 px-3 pb-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActivePage(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                activePage === id ? 'bg-teal-700 text-white' : 'text-slate-500 bg-slate-100'
              }`}>
              <Icon className="w-3 h-3" />{label}
              {id === 'claims' && pendingClaims > 0 && <span className="bg-amber-400 text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingClaims}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
