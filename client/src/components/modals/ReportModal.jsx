import { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { getCategoryName, getLocationName } from '../../translations';
import { compressImage } from './compressImage';
import CustomSelectModal from './CustomSelectModal';

export function ReportModal({ isOpen, onClose, mode, categories, locations, currentUser, onSubmit, lang = 'en' }) {
  const [form, setForm] = useState({ ItemName: '', Brand: '', Color: '', CategoryID: '', LocationID: '', date: new Date().toISOString().split('T')[0], Description: '', Image: '' });
  const [isCompressing, setIsCompressing] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Until the user picks, show the first option. Derived rather than copied
  // into state, so it is correct however late the lists arrive. Submit
  // already falls back to the same first option.
  const categoryId = form.CategoryID || categories?.[0]?.CategoryID || '';
  const locationId = form.LocationID || locations?.[0]?.LocationID || '';

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      compressImage(file, 1200, 0.8, (compressedDataUrl) => {
        if (compressedDataUrl) {
          setForm(f => ({ ...f, Image: compressedDataUrl }));
        }
        setIsCompressing(false);
      });
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, Image: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const catId = parseInt(form.CategoryID, 10) || (categories && categories[0] ? categories[0].CategoryID : 1);
    const locId = parseInt(form.LocationID, 10) || (locations && locations[0] ? locations[0].LocationID : 1);

    onSubmit({
      mode,
      UserID: currentUser?.UserID,
      ItemName: form.ItemName,
      Brand: form.Brand,
      Color: form.Color,
      CategoryID: catId,
      LocationID: locId,
      DateLost: form.date,
      DateFound: form.date,
      Description: form.Description,
      Image: form.Image
    });
    setForm({ ItemName: '', Brand: '', Color: '', CategoryID: '', LocationID: '', date: new Date().toISOString().split('T')[0], Description: '', Image: '' });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-xl p-7 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
        <div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${mode === 'lost' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {mode === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
          </span>
          <h2 className="text-xl font-black text-slate-800 mt-2">{mode === 'lost' ? 'What did you lose?' : 'What did you find?'}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Accurate details help find matches faster.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Item Name *</label>
            <input required className="input-field" placeholder="e.g. Apple MacBook Pro, Fossil Wallet" value={form.ItemName} onChange={set('ItemName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Brand(Optional)</label><input className="input-field" placeholder="Apple, Nike..." value={form.Brand} onChange={set('Brand')} /></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Color(Optional)</label><input className="input-field" placeholder="Black, Brown..." value={form.Color} onChange={set('Color')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
              <CustomSelectModal
                value={categoryId}
                options={categories.map(c => ({ id: c.CategoryID, label: getCategoryName(c.CategoryName, lang) }))}
                placeholder="Select Category"
                onChange={(val) => setForm(f => ({ ...f, CategoryID: val }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Location *</label>
              <CustomSelectModal
                value={locationId}
                options={locations.map(l => ({ id: l.LocationID, label: getLocationName(l.LocationName, lang) }))}
                placeholder="Select Location"
                onChange={(val) => setForm(f => ({ ...f, LocationID: val }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
            <input type="date" required className="input-field" value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Item Photo</label>
            {isCompressing ? (
              <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 flex flex-col items-center justify-center bg-teal-50/50 space-y-2">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-teal-800">Processing photo...</p>
              </div>
            ) : form.Image ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img src={form.Image} alt="Item Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-md flex items-center gap-1 text-xs font-bold">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-teal-50/30 group">
                <input type="file" accept="image/*, .jpg, .jpeg, .png, .webp, .heic, .heif" onChange={handleImageUpload} className="hidden" />
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Click to upload photo from your device</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP formats supported</p>
              </label>
            )}
          </div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
            <textarea rows={3} className="input-field resize-none" placeholder="Unique features, contents, exact location..." value={form.Description} onChange={set('Description')} />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" disabled={isCompressing} className="btn-primary text-xs px-5 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
              {isCompressing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Photo...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
