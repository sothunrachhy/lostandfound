import React from 'react';
import { FileSearch, Package, Clock, CheckCircle, Tag, MapPin } from 'lucide-react';

export default function Dashboard({ stats, lostItems, foundItems, claims, categories, locations }) {
  const pending  = claims.filter(c => c.Status === 'Pending').length;
  const approved = claims.filter(c => c.Status === 'Approved').length;

  return (
    <div className="space-y-8 pb-16 fade-up">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Overview</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time statistics & infrastructure status for RUPP Lost & Found.</p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lost Reports */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lost Reports</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{lostItems.length}</p>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Reported by students</p>
        </div>

        {/* Found Items */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Found Items</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-teal-700 tracking-tight">{foundItems.length}</p>
            <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Available
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Awaiting claim verification</p>
        </div>

        {/* Pending Verification */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Audit</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-amber-600 tracking-tight">{pending}</p>
            {pending > 0 && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                Action Req.
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Claims awaiting review</p>
        </div>

        {/* Returned Rate */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Items Restored</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-emerald-600 tracking-tight">{approved}</p>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Handed back to owners</p>
        </div>
      </div>

      {/* System Infrastructure Management Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" /> Registered Item Categories
            </h3>
            <span className="text-xs font-semibold text-slate-400">{categories.length} Total</span>
          </div>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.CategoryID} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100/80 text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors">
                <span>{c.CategoryName}</span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> Official Campus Map Locations
            </h3>
            <span className="text-xs font-semibold text-slate-400">{locations.length} Total</span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {locations.map(l => (
              <div key={l.LocationID} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100/80 text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors">
                <span className="truncate pr-2">{l.LocationName}</span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
