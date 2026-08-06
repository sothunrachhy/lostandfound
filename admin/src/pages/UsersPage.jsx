import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Mail, Phone, CreditCard, X, User, Search } from 'lucide-react';

export default function UsersPage({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');

  const filteredUsers = (users || []).filter(u =>
    (u.Name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.Email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.StudentID || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 fade-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage registered RUPP students and campus administrator accounts.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, student ID, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input admin-input-search text-xs py-2.5 w-full bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              <th className="text-left py-3.5 px-6 font-bold">User Name</th>
              <th className="text-left py-3.5 px-6 font-bold hidden md:table-cell">Student ID</th>
              <th className="text-left py-3.5 px-6 font-bold hidden sm:table-cell">Email Address</th>
              <th className="text-left py-3.5 px-6 font-bold">Role</th>
              <th className="text-right py-3.5 px-6 font-bold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                  No users matching "{search}"
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr
                  key={u.UserID}
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-teal-600">
                        {u.ProfileImage || u.profile_image ? (
                          <img src={u.ProfileImage || u.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.Name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{u.Name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-500 font-semibold hidden md:table-cell">{u.StudentID || 'N/A'}</td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium hidden sm:table-cell">{u.Email}</td>
                  <td className="py-3.5 px-6">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      u.RoleID === 2 || u.RoleName === 'Admin'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {u.RoleName || (u.RoleID === 2 ? 'Admin' : 'Student')}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="text-xs text-teal-700 font-bold group-hover:translate-x-0.5 transition-transform inline-block">
                      View Profile →
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── User Profile Details Modal (React Portal) ─────────── */}
      {selectedUser && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200 space-y-5">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-full bg-teal-700 text-white font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md border-2 border-teal-600">
                {selectedUser.ProfileImage || selectedUser.profile_image ? (
                  <img src={selectedUser.ProfileImage || selectedUser.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedUser.Name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedUser.Name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                  selectedUser.RoleID === 2 ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {selectedUser.RoleName || (selectedUser.RoleID === 2 ? 'Administrator' : 'Student User')}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-b border-slate-100 py-4">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="font-semibold truncate">{selectedUser.Email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Student ID</p>
                  <p className="font-mono font-semibold">{selectedUser.StudentID || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="font-semibold">{selectedUser.Phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full btn-admin text-xs py-2.5 rounded-xl justify-center cursor-pointer font-bold"
            >
              Close Profile
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
