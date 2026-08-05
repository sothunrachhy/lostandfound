import React from 'react';
import { FileSearch, Package, Clock, CheckCircle, Tag, MapPin } from 'lucide-react';

export default function Dashboard({ stats, lostItems, foundItems, claims, categories, locations }) {
  const pending  = claims.filter(c => c.Status === 'Pending').length;
  const approved = claims.filter(c => c.Status === 'Approved').length;

  return (
    <div className="space-y-8 pb-16 fade-up">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Dashboard Overview</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time system metrics for the Lost & Found platform.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lost Reports</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{lostItems.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active submissions</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Found Items</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-700">{foundItems.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting claim</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Claims</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{pending}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting review</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{approved}</p>
          <p className="text-[11px] text-slate-400 mt-1">Items returned</p>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-600" /> Item Categories
          </h3>
          <div className="space-y-1.5">
            {categories.map(c => (
              <div key={c.CategoryID} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                {c.CategoryName}
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" /> Campus Locations
          </h3>
          <div className="space-y-1.5">
            {locations.map(l => (
              <div key={l.LocationID} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                {l.LocationName}
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
