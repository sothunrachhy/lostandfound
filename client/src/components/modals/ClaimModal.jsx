import { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { translations, getLocationName } from '../../translations';

export function ClaimModal({ isOpen, onClose, foundItem, lostItem, currentUser, onSubmit, lang = 'en' }) {
  const [proof, setProof] = useState('');
  const [contact, setContact] = useState(currentUser ? `${currentUser.Email} | ${currentUser.Phone}` : '');
  if (!isOpen || !foundItem) return null;

  const t = translations[lang] || translations.en;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ FoundID: foundItem.FoundID, LostID: lostItem?.LostID || null, OwnerID: currentUser.UserID, FinderID: foundItem.UserID, Proof: proof, ContactInfo: contact });
    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-lg p-7 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
        <div>
          <span className="text-[10px] font-black bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full uppercase">{t.claimItem}</span>
          <h2 className="text-xl font-black text-slate-800 mt-2">{t.claimItem}: {foundItem.ItemName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Provide proof so campus safety can verify and approve the release.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-0.5">
          <p className="font-bold text-slate-700">{foundItem.ItemName} · {foundItem.Brand || 'Unbranded'}</p>
          <p className="text-slate-400">Found at: {getLocationName(foundItem.LocationName, lang)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div><label className="block text-xs font-bold text-slate-600 mb-1">{t.proofOfOwnership} *</label>
            <textarea required rows={4} className="input-field font-mono resize-none" placeholder="Serial number, passcode, invoice number, unique engraving..." value={proof} onChange={e => setProof(e.target.value)} />
          </div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">{t.contactDetails}</label>
            <input className="input-field" value={contact} onChange={e => setContact(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">{t.cancel}</button>
            <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl"><ShieldCheck className="w-3.5 h-3.5" /> {t.submitClaim}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
