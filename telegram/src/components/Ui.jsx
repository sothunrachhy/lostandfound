import { useState } from 'react';
import { Package, MapPin, Calendar, Tag, ChevronLeft, ChevronDown } from 'lucide-react';

/* ─── Brand mark, matching the web portal ────────────────────── */
export function BrandMark({ size = 48 }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-xl bg-teal-700 shadow-md shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="text-white" width={size * 0.5} height={size * 0.5} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
  );
}

/* ─── Screen header with a back affordance ───────────────────── */
export function ScreenHeader({ title, onBack, action }) {
  return (
    <header className="tg-safe-top bg-white border-b border-slate-200 px-3 py-2.5 sticky top-0 z-10 flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="p-1.5 -ml-1 rounded-lg text-slate-500" aria-label="Back">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <p className="text-sm font-bold text-slate-800 truncate flex-1">{title}</p>
      {action}
    </header>
  );
}

/* ─── Photo with the web portal's placeholder treatment ──────── */
export function ItemImage({ src, alt, type = 'lost' }) {
  const [erroredSrc, setErroredSrc] = useState(null);
  const broken = !src || erroredSrc === src;

  if (broken) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
        type === 'lost'
          ? 'bg-gradient-to-br from-rose-50 to-slate-100 text-rose-700'
          : 'bg-gradient-to-br from-teal-50 to-slate-100 text-teal-700'
      }`}>
        <Package className="w-10 h-10 stroke-[1.5] mb-1 opacity-60" />
        <span className="text-xs font-bold truncate max-w-[90%]">{alt}</span>
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">No Image Uploaded</span>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setErroredSrc(src)}
      className="w-full h-full object-cover" />
  );
}

/* ─── Item card, matching the web portal's ───────────────────── */
export function ItemCard({ item, kind, onOpen }) {
  const lost = kind === 'lost';
  return (
    <button onClick={onOpen}
      className={`item-card ${lost ? 'item-card-lost' : 'item-card-found'} w-full text-left fade-up`}>
      <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
        <ItemImage src={item.Image} alt={item.ItemName} type={kind} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <span className={`${lost ? 'badge-lost' : 'badge-found'} absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg`}>
          {lost ? 'Lost' : 'Found'}
        </span>
        {item.Status === 'Claimed'
          ? <span className="badge-claimed absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Claimed</span>
          : !lost && <span className="badge-available absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Available</span>}
        {item.ApprovalStatus === 'Pending' && (
          <span className="badge-pending absolute bottom-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
            Pending review
          </span>
        )}
        {item.ApprovalStatus === 'Rejected' && (
          <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-500 text-white">
            Not approved
          </span>
        )}
      </div>

      <div className="p-4 flex-1 space-y-2">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.ItemName}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {item.Description || 'No description provided.'}
        </p>
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {item.Brand && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Tag className="w-3 h-3 text-teal-500 shrink-0" />
              {item.Brand}{item.Color ? ` · ${item.Color}` : ''}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3 text-teal-500 shrink-0" />
            <span className="truncate">{item.LocationName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
            {lost ? 'Lost on ' : 'Found on '}{item.DateLost || item.DateFound}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Skeleton shaped like the real cards ────────────────────── */
export function SkeletonList({ count = 2 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="item-card">
          <div className="h-52 skeleton" />
          <div className="p-4 space-y-2.5">
            <div className="h-3.5 w-1/2 rounded skeleton" />
            <div className="h-2.5 w-full rounded skeleton" />
            <div className="h-2.5 w-4/5 rounded skeleton" />
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="h-2.5 w-2/5 rounded skeleton" />
              <div className="h-2.5 w-1/3 rounded skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Empty / error panels ───────────────────────────────────── */
export function EmptyState({ icon: Icon = Package, title, hint, action }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-1.5">
      <Icon className="w-9 h-9 mx-auto text-slate-200" />
      <p className="text-xs font-bold text-slate-600">{title}</p>
      {hint && <p className="text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/* ─── Native select, styled like the web's input-field ───────── */
export function Select({ label, value, onChange, options, placeholder = 'Select…', required }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>}
      <div className="relative">
        <select
          className="input-field appearance-none pr-9"
          value={value} required={required}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── Field wrapper ──────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

/* ─── Inline messages ────────────────────────────────────────── */
export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-center leading-relaxed">
      {children}
    </p>
  );
}

export function InfoNote({ children }) {
  return (
    <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
      {children}
    </p>
  );
}
