import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { compressImage } from './compressImage';

export function ProfileModal({ isOpen, onClose, currentUser, onSaveProfile }) {
  // The parent keys this component on its open state, so it remounts each
  // time it opens and this initialiser re-reads the current profile. That
  // replaces an effect that copied props into state.
  const [form, setForm] = useState(() => ({
    Name: currentUser?.Name || '',
    Phone: currentUser?.Phone || '',
    StudentID: currentUser?.StudentID || '',
    ProfileImage: currentUser?.ProfileImage || ''
  }));

  if (!isOpen || !currentUser) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 600, 0.8, (compressedDataUrl) => {
        setForm(f => ({ ...f, ProfileImage: compressedDataUrl }));
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      UserID: currentUser.UserID,
      Name: form.Name,
      Phone: form.Phone,
      StudentID: form.StudentID,
      ProfileImage: form.ProfileImage
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-md p-7 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">Account Settings</span>
          <h2 className="text-xl font-black text-slate-800 mt-2">Edit Your Profile</h2>
          <p className="text-xs text-slate-400 mt-0.5">Update your photo and contact details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-teal-600 bg-slate-100 shadow-sm">
              <img src={form.ProfileImage || currentUser.ProfileImage} alt="" className="w-full h-full object-cover" />
            </div>
            <label className="btn-outline text-xs py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
            <input required className="input-field" value={form.Name} onChange={e => setForm(f => ({ ...f, Name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Student ID</label>
              <input className="input-field" value={form.StudentID} onChange={e => setForm(f => ({ ...f, StudentID: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
              <input className="input-field" value={form.Phone} onChange={e => setForm(f => ({ ...f, Phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email (Read Only)</label>
            <input className="input-field bg-slate-100 text-slate-500 cursor-not-allowed" value={currentUser.Email} disabled />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
