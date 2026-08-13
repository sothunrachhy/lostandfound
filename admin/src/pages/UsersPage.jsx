import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Mail, Phone, CreditCard, X, User, Search, Trash2, UserPlus, ShieldCheck, Shield, Key } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function UsersPage({ users, onDeleteUser, onCreateAdmin, onUpdateUserRole }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Add Admin form state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentID: ''
  });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  const handleAdminFormChange = (k) => (e) => setAdminForm(f => ({ ...f, [k]: e.target.value }));

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) return;
    setSubmittingAdmin(true);
    const sid = adminForm.studentID || `ADM-${Date.now().toString().slice(-6)}`;
    const success = await onCreateAdmin({
      name: adminForm.name,
      email: adminForm.email,
      password: adminForm.password,
      phone: adminForm.phone,
      studentID: sid,
      roleID: 2
    });
    setSubmittingAdmin(false);
    if (success) {
      setIsAddAdminOpen(false);
      setAdminForm({ name: '', email: '', password: '', phone: '', studentID: '' });
    }
  };

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users, email, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input admin-input-search text-xs py-2.5 w-full bg-white border-slate-200"
            />
          </div>
          {onCreateAdmin && (
            <button
              onClick={() => setIsAddAdminOpen(true)}
              className="btn-admin py-2.5 px-4 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md bg-amber-600 hover:bg-amber-700 text-white transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              <th className="text-left py-3.5 px-6 font-bold">User Name</th>
              <th className="text-left py-3.5 px-6 font-bold hidden md:table-cell">ID Number</th>
              <th className="text-left py-3.5 px-6 font-bold hidden sm:table-cell">Email Address</th>
              <th className="text-left py-3.5 px-6 font-bold">Role</th>
              <th className="text-right py-3.5 px-6 font-bold">Actions</th>
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
              filteredUsers.map(u => {
                const isAdmin = u.RoleID === 2 || u.RoleName === 'Admin';
                return (
                  <tr
                    key={u.UserID}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border ${
                          isAdmin ? 'bg-amber-700 text-white border-amber-600' : 'bg-teal-700 text-white border-teal-600'
                        }`}>
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
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                        isAdmin
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {isAdmin && <ShieldCheck className="w-3 h-3 text-amber-600" />}
                        {u.RoleName || (isAdmin ? 'Admin' : 'Student')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onUpdateUserRole && !isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                title: 'Promote User to Admin?',
                                message: `Grant administrator privileges to "${u.Name}" (${u.Email})? They will be able to access the Admin Control Center.`,
                                onConfirm: () => onUpdateUserRole(u.UserID, 2)
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                            title="Make Admin"
                          >
                            <Shield className="w-3 h-3" /> Make Admin
                          </button>
                        )}
                        <span className="text-xs text-teal-700 font-bold group-hover:translate-x-0.5 transition-transform inline-block ml-1">
                          View →
                        </span>
                        {onDeleteUser && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                title: 'Delete User Account?',
                                message: `Permanently delete user account "${u.Name}" (${u.Email}) from database?`,
                                onConfirm: () => onDeleteUser(u.UserID)
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200 ml-1"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add New Admin Modal ───────────────────────────────── */}
      {isAddAdminOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 space-y-5">
            <button
              onClick={() => setIsAddAdminOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Create Administrator</h3>
                <p className="text-xs text-slate-400 mt-0.5">Register a new campus administrator account</p>
              </div>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sokha Chan"
                  value={adminForm.name}
                  onChange={handleAdminFormChange('name')}
                  className="admin-input text-xs py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.sokha@rupp.edu.kh"
                  value={adminForm.email}
                  onChange={handleAdminFormChange('email')}
                  className="admin-input text-xs py-2.5 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff / Admin ID</label>
                  <input
                    type="text"
                    placeholder="ADM-1002"
                    value={adminForm.studentID}
                    onChange={handleAdminFormChange('studentID')}
                    className="admin-input text-xs py-2.5 w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+855 12 345 678"
                    value={adminForm.phone}
                    onChange={handleAdminFormChange('phone')}
                    className="admin-input text-xs py-2.5 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminForm.password}
                  onChange={handleAdminFormChange('password')}
                  className="admin-input text-xs py-2.5 w-full"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all shadow-md shadow-amber-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {submittingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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
              <div className={`w-20 h-20 rounded-full font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md border-2 ${
                selectedUser.RoleID === 2 || selectedUser.RoleName === 'Admin' ? 'bg-amber-700 text-white border-amber-600' : 'bg-teal-700 text-white border-teal-600'
              }`}>
                {selectedUser.ProfileImage || selectedUser.profile_image ? (
                  <img src={selectedUser.ProfileImage || selectedUser.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedUser.Name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedUser.Name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                  selectedUser.RoleID === 2 || selectedUser.RoleName === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ID Number</p>
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

            <div className="flex flex-col gap-2">
              {onUpdateUserRole && (
                <button
                  onClick={() => {
                    const u = selectedUser;
                    const isCurrentlyAdmin = u.RoleID === 2 || u.RoleName === 'Admin';
                    const targetRole = isCurrentlyAdmin ? 1 : 2;
                    const targetName = isCurrentlyAdmin ? 'Student' : 'Admin';
                    setSelectedUser(null);
                    setConfirmModal({
                      isOpen: true,
                      title: isCurrentlyAdmin ? 'Demote Admin Account?' : 'Promote to Admin?',
                      message: isCurrentlyAdmin
                        ? `Demote "${u.Name}" from Admin to Student User?`
                        : `Promote "${u.Name}" to Administrator? They will gain access to the Admin Control Center.`,
                      onConfirm: () => onUpdateUserRole(u.UserID, targetRole)
                    });
                  }}
                  className={`w-full font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 border ${
                    selectedUser.RoleID === 2 || selectedUser.RoleName === 'Admin'
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {selectedUser.RoleID === 2 || selectedUser.RoleName === 'Admin' ? 'Demote to Student' : 'Promote to Admin'}
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
                {onDeleteUser && (
                  <button
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      setConfirmModal({
                        isOpen: true,
                        title: 'Delete User Account?',
                        message: `Permanently delete user account "${u.Name}" (${u.Email}) from database?`,
                        onConfirm: () => onDeleteUser(u.UserID)
                      });
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

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
