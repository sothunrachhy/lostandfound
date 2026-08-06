import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle, Search, Package, MapPin, Calendar } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function ReportsPage({ lostItems, foundItems, onDeleteReport }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const filteredLost = lostItems.filter(i =>
    (i.ItemName || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.Description || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.LocationName || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredFound = foundItems.filter(i =>
    (i.ItemName || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.Description || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.LocationName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 fade-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Moderation Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">Audit student lost & found reports and clean spam records.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search report items, locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input admin-input-search text-xs py-2.5 w-full bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Reports ({lostItems.length + foundItems.length})
        </button>
        <button
          onClick={() => setTab('lost')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'lost' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Lost Reports ({lostItems.length})
        </button>
        <button
          onClick={() => setTab('found')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'found' ? 'bg-teal-700 text-white shadow-xs' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
          }`}
        >
          Found Reports ({foundItems.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Lost Reports Column */}
        {(tab === 'all' || tab === 'lost') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800">Lost Item Submissions</h3>
              <span className="ml-auto text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                {filteredLost.length} Records
              </span>
            </div>

            {filteredLost.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-1">
                <Package className="w-8 h-8 mx-auto opacity-40 mb-1" />
                <p className="text-xs font-bold text-slate-600">No lost reports found</p>
              </div>
            ) : (
              filteredLost.map(item => (
                <div key={item.LostID} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.Image ? (
                      <img src={item.Image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.ItemName}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        Lost
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.Description || 'No description.'}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-teal-600" />{item.LocationName}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" />{item.DateLost}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: 'Delete Lost Report?',
                      message: `Permanently delete report "${item.ItemName}" from database?`,
                      onConfirm: () => onDeleteReport('lost', item.LostID)
                    })}
                    className="shrink-0 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Found Reports Column */}
        {(tab === 'all' || tab === 'found') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800">Found Item Submissions</h3>
              <span className="ml-auto text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                {filteredFound.length} Records
              </span>
            </div>

            {filteredFound.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-1">
                <Package className="w-8 h-8 mx-auto opacity-40 mb-1" />
                <p className="text-xs font-bold text-slate-600">No found reports found</p>
              </div>
            ) : (
              filteredFound.map(item => (
                <div key={item.FoundID} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.Image ? (
                      <img src={item.Image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.ItemName}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                        Found
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.Description || 'No description.'}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-teal-600" />{item.LocationName}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" />{item.DateFound}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: 'Delete Found Report?',
                      message: `Permanently delete report "${item.ItemName}" from database?`,
                      onConfirm: () => onDeleteReport('found', item.FoundID)
                    })}
                    className="shrink-0 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(c => ({ ...c, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}
