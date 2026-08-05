import React, { useState } from 'react';
import { Mail, Phone, CreditCard, X, User } from 'lucide-react';

export default function UsersPage({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800">User Management</h2>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider">
              <th className="text-left py-3.5 px-5 font-bold">User</th>
              <th className="text-left py-3.5 px-5 font-bold hidden md:table-cell">Student ID</th>
              <th className="text-left py-3.5 px-5 font-bold hidden sm:table-cell">Email</th>
              <th className="text-left py-3.5 px-5 font-bold">Role</th>
              <th className="text-right py-3.5 px-5 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.UserID}
                onClick={() => setSelectedUser(u)}
                className="border-b border-slate-100 last:border-0 hover:bg-teal-50/60 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <img src={u.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.Name)}`} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <span className="font-semibold text-slate-800">{u.Name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 font-mono text-slate-400 text-xs hidden md:table-cell">{u.StudentID || 'N/A'}</td>
                <td className="py-3.5 px-5 text-slate-500 hidden sm:table-cell">{u.Email}</td>
                <td className="py-3.5 px-5">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    u.RoleID === 2
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {u.RoleName}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="text-xs text-teal-700 font-bold hover:underline">
                    View Profile →
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── User Profile Details Modal ─────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative fade-up space-y-5">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <img
                src={selectedUser.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.Name)}`}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-4 border-teal-600 shadow-md"
              />
              <div>
                <h3 className="text-lg font-black text-slate-800">{selectedUser.Name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 inline-block mt-1">
                  {selectedUser.RoleName || 'Student User'}
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
              className="w-full btn-admin text-xs py-2.5 rounded-xl justify-center cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
