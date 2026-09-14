import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Field, ErrorNote, InfoNote, ScreenHeader } from '../components/Ui';
import { notifyHaptic } from '../telegram';

/**
 * Claim a found item. Mirrors the web portal's ClaimModal: the claimant
 * describes something only the real owner would know, and an admin verifies it.
 */
export default function ClaimForm({ API, item, currentUser, onDone, onBack, t }) {
  const [proof, setProof] = useState('');
  const [contact, setContact] = useState(currentUser?.Phone || currentUser?.Email || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FoundID: item.FoundID,
          OwnerID: currentUser.UserID,
          FinderID: item.UserID,
          Proof: proof,
          ContactInfo: contact,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notifyHaptic('success');
        onDone(data);
        return;
      }
      notifyHaptic('error');
      setError(data.message || 'Could not submit the claim.');
    } catch {
      notifyHaptic('error');
      setError(t.connectionError || 'Could not reach the service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader title="Claim This Item" onBack={onBack} />

      <form onSubmit={submit} className="p-4 space-y-3.5 flex-1 fade-up">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            {item.Image
              ? <img src={item.Image} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-teal-700 text-xs font-black">?</div>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{item.ItemName}</p>
            <p className="text-[11px] text-slate-400 truncate">{item.LocationName}</p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-teal-900 leading-relaxed">
            Describe something only the owner would know — a scratch, a lock
            screen, what was inside. An administrator checks this before the
            item is released.
          </p>
        </div>

        <Field label="Proof of ownership">
          <textarea className="input-field" rows={4} required
            placeholder="e.g. The case has a chip on the bottom-left corner and my initials inside."
            value={proof} onChange={(e) => setProof(e.target.value)} />
        </Field>

        <Field label="How should we reach you?">
          <input className="input-field" placeholder="Phone or email"
            value={contact} onChange={(e) => setContact(e.target.value)} />
        </Field>

        <InfoNote>
          Submitting a false claim can get your account removed.
        </InfoNote>

        <ErrorNote>{error}</ErrorNote>

        <button type="submit" disabled={busy || !proof.trim()}
          className="btn-primary w-full py-3 rounded-xl text-sm">
          {busy ? 'Submitting…' : 'Submit Claim'}
        </button>
      </form>
    </div>
  );
}
