import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, User, Camera } from 'lucide-react';

export default function AdminProfileModal({ isOpen, onClose, currentAdmin, onSaveProfile }) {
  if (!isOpen || !currentAdmin) return null;

  const [form, setForm] = useState({
    name: currentAdmin.Name || '',
    phone: currentAdmin.Phone || '',
    profileImage: currentAdmin.ProfileImage || ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      UserID: currentAdmin.UserID || currentAdmin.user_id,
      Name: form.name,
      Phone: form.phone,
      ProfileImage: form.profileImage
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-700" /> Edit Admin Profile
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-teal-700 text-white font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md border-2 border-teal-600">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{form.name?.charAt(0).toUpperCase() || 'A'}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full cursor-pointer shadow-md transition-transform active:scale-95">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Click camera icon to change picture</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Admin Name</label>
            <input
              type="text"
              required
              className="admin-input text-xs"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
            <input
              type="text"
              className="admin-input text-xs"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Admin Email (Read-Only)</label>
            <input
              type="email"
              disabled
              className="admin-input text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
              value={currentAdmin.Email}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="btn-admin text-xs px-5 py-2 rounded-xl font-bold">
              Save Admin Profile
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
