import { useState } from 'react';
import { Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { compressImage } from '../lib/compressImage';
import { Select, Field, ErrorNote, InfoNote, ScreenHeader } from '../components/Ui';
import { notifyHaptic } from '../telegram';
import { getCategoryName, getLocationName } from '../translations';

const today = () => new Date().toISOString().split('T')[0];

/**
 * Report a lost or found item. Mirrors the web portal's ReportModal, including
 * the same client-side image compression, so a phone photo does not arrive as
 * a multi-megabyte upload.
 */
export default function ReportForm({ API, mode, categories, locations, currentUser, lang, onDone, onBack, t }) {
  const lost = mode === 'lost';
  const [form, setForm] = useState({
    ItemName: '', Brand: '', Color: '', CategoryID: '', LocationID: '',
    date: today(), Description: '', Image: '',
  });
  const [compressing, setCompressing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Until the user picks, show the first option — derived, not stored, so it
  // is correct however late the lists arrive.
  const categoryId = form.CategoryID || categories?.[0]?.CategoryID || '';
  const locationId = form.LocationID || locations?.[0]?.LocationID || '';

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    compressImage(file, 1200, 0.8, (dataUrl) => {
      setForm((f) => ({ ...f, Image: dataUrl }));
      setCompressing(false);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy || compressing) return;
    setBusy(true);
    setError('');

    const endpoint = lost ? 'lost-items' : 'found-items';
    const payload = {
      UserID: currentUser.UserID,
      CategoryID: parseInt(categoryId, 10),
      LocationID: parseInt(locationId, 10),
      ItemName: form.ItemName,
      Brand: form.Brand,
      Color: form.Color,
      Description: form.Description,
      [lost ? 'DateLost' : 'DateFound']: form.date,
      Image: form.Image,
    };

    try {
      const res = await fetch(`${API}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        notifyHaptic('success');
        onDone(data);
        return;
      }
      notifyHaptic('error');
      setError(data.message || 'Could not submit the report.');
    } catch {
      notifyHaptic('error');
      setError(t.connectionError || 'Could not reach the service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader title={lost ? 'Report a Lost Item' : 'Report a Found Item'} onBack={onBack} />

      <form onSubmit={submit} className="p-4 space-y-3.5 flex-1 fade-up">
        <div className={`flex items-start gap-2.5 rounded-2xl p-3.5 border ${
          lost ? 'bg-rose-50 border-rose-200' : 'bg-teal-50 border-teal-200'
        }`}>
          {lost
            ? <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            : <CheckCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />}
          <p className={`text-[11px] leading-relaxed ${lost ? 'text-rose-900' : 'text-teal-900'}`}>
            {lost
              ? 'Describe what you lost. The more detail you give, the better the match engine works.'
              : 'Thanks for turning something in. Describe it, but leave out anything only the real owner would know.'}
          </p>
        </div>

        <Field label="Item Name">
          <input className="input-field" placeholder="e.g. Black AirPods Pro"
            value={form.ItemName} onChange={set('ItemName')} required />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" value={categoryId} required
            onChange={(v) => setForm((f) => ({ ...f, CategoryID: v }))}
            options={(categories || []).map((c) => ({
              id: c.CategoryID, label: getCategoryName(c.CategoryName, lang),
            }))} />
          <Select label="Location" value={locationId} required
            onChange={(v) => setForm((f) => ({ ...f, LocationID: v }))}
            options={(locations || []).map((l) => ({
              id: l.LocationID, label: getLocationName(l.LocationName, lang),
            }))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand">
            <input className="input-field" placeholder="Apple" value={form.Brand} onChange={set('Brand')} />
          </Field>
          <Field label="Colour">
            <input className="input-field" placeholder="Black" value={form.Color} onChange={set('Color')} />
          </Field>
        </div>

        <Field label={lost ? 'Date lost' : 'Date found'}>
          <input type="date" className="input-field" max={today()} value={form.date} onChange={set('date')} />
        </Field>

        <Field label="Description">
          <textarea className="input-field" rows={3}
            placeholder="Any detail that helps identify it…"
            value={form.Description} onChange={set('Description')} />
        </Field>

        <Field label="Photo">
          {form.Image ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={form.Image} alt="" className="w-full h-44 object-cover" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, Image: '' }))}
                className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 text-rose-600 shadow-sm"
                aria-label="Remove photo">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 rounded-xl py-7 cursor-pointer">
              <Upload className={`w-5 h-5 ${compressing ? 'animate-pulse text-teal-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-600">
                {compressing ? 'Processing…' : 'Add a photo'}
              </span>
              <span className="text-[10px] text-slate-400">Camera or gallery</span>
              {/* capture hints phones toward the camera without blocking the gallery */}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
            </label>
          )}
        </Field>

        <InfoNote>
          Your report is reviewed by campus staff before it appears on the board.
        </InfoNote>

        <ErrorNote>{error}</ErrorNote>

        <button type="submit" disabled={busy || compressing}
          className="btn-primary w-full py-3 rounded-xl text-sm">
          {busy ? 'Submitting…' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
