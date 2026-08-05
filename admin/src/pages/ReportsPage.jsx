import React from 'react';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ReportsPage({ lostItems, foundItems, onDeleteReport }) {
  return (
    <div className="space-y-8 pb-16 fade-up">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Report Moderation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Lost Reports */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-700">Lost Item Reports</h3>
            <span className="ml-auto text-xs text-slate-400">{lostItems.length} total</span>
          </div>
          {lostItems.length === 0 && <p className="text-sm text-slate-400 italic py-4">No lost item reports.</p>}
          {lostItems.map(item => (
            <div key={item.LostID} className="admin-card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{item.ItemName}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.Description}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{item.DateLost} · {item.LocationName}</p>
              </div>
              <button onClick={() => onDeleteReport('lost', item.LostID)}
                className="shrink-0 p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all cursor-pointer border border-rose-100"
                title="Delete report">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Found Reports */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-700">Found Item Reports</h3>
            <span className="ml-auto text-xs text-slate-400">{foundItems.length} total</span>
          </div>
          {foundItems.length === 0 && <p className="text-sm text-slate-400 italic py-4">No found item reports.</p>}
          {foundItems.map(item => (
            <div key={item.FoundID} className="admin-card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{item.ItemName}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.Description}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{item.DateFound} · {item.LocationName}</p>
              </div>
              <button onClick={() => onDeleteReport('found', item.FoundID)}
                className="shrink-0 p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all cursor-pointer border border-rose-100"
                title="Delete report">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
