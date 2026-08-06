import React from 'react';
import { ShieldCheck, User, Search, FileText, CheckCircle, XCircle, Package, Calendar } from 'lucide-react';

export default function ClaimsPage({ claims, onUpdateClaim }) {
  const [filter, setFilter] = React.useState('');

  const filteredClaims = (claims || []).filter(c =>
    (c.FoundItem?.ItemName || '').toLowerCase().includes(filter.toLowerCase()) ||
    (c.Owner?.Name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (c.Finder?.Name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (c.Proof || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 fade-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Claims Verification Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">Audit ownership proofs and manage item return approvals.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search claims, items, users..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="admin-input admin-input-search text-xs py-2.5 w-full bg-white shadow-2xs border-slate-200"
          />
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
            <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">No claim records found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">When users claim items on the platform, claims will appear here for verification.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map(claim => {
            const isPending = claim.Status === 'Pending';
            const isApproved = claim.Status === 'Approved';
            const isRejected = claim.Status === 'Rejected';

            return (
              <div key={claim.ClaimID} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-md transition-shadow">

                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg font-mono">
                      Claim #{claim.ClaimID}
                    </span>

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-lg uppercase flex items-center gap-1.5 ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        isApproved ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                      }`} />
                      {claim.Status || 'Pending'}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(claim.SubmittedAt || Date.now()).toLocaleString()}
                  </span>
                </div>

                {/* Main 3-Column Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Found Item Details */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Item</span>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        {claim.FoundItem?.Image ? (
                          <img src={claim.FoundItem.Image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{claim.FoundItem?.ItemName || `Found Item #${claim.FoundID}`}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{claim.FoundItem?.Description || 'No description provided.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner (Claimant) */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Claimant (Owner)</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {claim.Owner?.Name?.charAt(0).toUpperCase() || 'O'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{claim.Owner?.Name || `User #${claim.OwnerID}`}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{claim.ContactInfo || claim.Owner?.Email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Finder (Reporter) */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Finder / Reporter</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300">
                        {claim.Finder?.Name?.charAt(0).toUpperCase() || 'F'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{claim.Finder?.Name || 'Campus Finder'}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{claim.Finder?.Email || 'Safety Desk'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitted Proof Section */}
                <div className="bg-slate-50 border-l-4 border-teal-600 rounded-r-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span>Submitted Ownership Proof:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono pl-5 whitespace-pre-wrap">{claim.Proof || 'No proof provided.'}</p>
                </div>

                {/* Admin Actions */}
                {onUpdateClaim && isPending && (
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onUpdateClaim(claim.ClaimID, 'Rejected', 'Insufficient ownership proof.')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-200 active:scale-95"
                    >
                      <XCircle className="w-4 h-4" /> Reject Claim
                    </button>
                    <button
                      onClick={() => onUpdateClaim(claim.ClaimID, 'Approved', 'Ownership verified by admin.')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Claim
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
