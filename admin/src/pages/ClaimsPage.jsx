import React from 'react';
import { ShieldCheck, User, Search, FileText, CheckCircle, XCircle } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Claims Activity Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review ownership proof and verify item handovers.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search claims, items, users..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="admin-input admin-input-search text-xs py-2 w-full"
          />
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="admin-card p-12 text-center text-slate-400 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto stroke-[1.5] text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No claim records found.</p>
          <p className="text-xs text-slate-400">When users claim lost/found items on the portal, details will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map(claim => {
            const isPending = claim.Status === 'Pending';
            const isApproved = claim.Status === 'Approved';
            const isRejected = claim.Status === 'Rejected';

            return (
              <div key={claim.ClaimID} className="admin-card p-6 space-y-4 hover:shadow-md transition-shadow">

                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
                      Claim #{claim.ClaimID}
                    </span>

                    <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase flex items-center gap-1.5 ${
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

                  <span className="text-xs font-mono text-slate-400">
                    📅 {new Date(claim.SubmittedAt || Date.now()).toLocaleString()}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Found Item */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Item Details</p>
                    <p className="text-sm font-bold text-slate-800">{claim.FoundItem?.ItemName || `Found Item #${claim.FoundID}`}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{claim.FoundItem?.Description || 'No description provided.'}</p>
                  </div>

                  {/* Claimant (Owner) */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Claimant (Owner)</p>
                    <p className="text-sm font-bold text-slate-800">{claim.Owner?.Name || `User #${claim.OwnerID}`}</p>
                    <p className="text-xs text-slate-400 truncate">{claim.ContactInfo || claim.Owner?.Email}</p>
                  </div>

                  {/* Item Finder */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Item Finder / Reporter</p>
                    <p className="text-sm font-bold text-slate-800">{claim.Finder?.Name || 'Campus Community'}</p>
                    <p className="text-xs text-slate-400 truncate">{claim.Finder?.Email || 'Campus Safety Desk'}</p>
                  </div>
                </div>

                {/* Ownership Proof */}
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
                  <p className="text-[10px] font-black text-teal-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" /> Submitted Ownership Proof
                  </p>
                  <p className="text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">{claim.Proof}</p>
                </div>

                {/* Admin Actions */}
                {onUpdateClaim && isPending && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onUpdateClaim(claim.ClaimID, 'Rejected', 'Insufficient ownership proof.')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-200"
                    >
                      <XCircle className="w-4 h-4" /> Reject Claim
                    </button>
                    <button
                      onClick={() => onUpdateClaim(claim.ClaimID, 'Approved', 'Ownership verified by admin.')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
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
