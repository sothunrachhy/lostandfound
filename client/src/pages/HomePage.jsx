import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, MapPin, Calendar, Tag, MessageCircle, Plus, ArrowRight, X, RefreshCcw, AlertCircle, CheckCircle, Package, ChevronDown, Check } from 'lucide-react';
import { translations } from '../translations';

const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80";

function ItemImage({ src, alt, type = 'lost' }) {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || '');
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
        type === 'lost' ? 'bg-gradient-to-br from-rose-50 to-slate-100 text-rose-700' : 'bg-gradient-to-br from-teal-50 to-slate-100 text-teal-700'
      }`}>
        <Package className="w-10 h-10 stroke-[1.5] mb-1 opacity-60" />
        <span className="text-xs font-bold truncate max-w-[90%]">{alt}</span>
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">No Image Uploaded</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-full h-full object-cover img-zoom"
    />
  );
}

function CustomSelect({ value, options, placeholder, onChange, icon: Icon, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.id) === String(value));

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 hover:border-teal-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 shadow-xs transition-all cursor-pointer h-full min-h-[38px]"
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 max-h-60 overflow-y-auto fade-up space-y-0.5">
          <button
            type="button"
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              !value ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check className="w-3.5 h-3.5 text-teal-600" />}
          </button>
          {options.map(o => {
            const isSelected = String(o.id) === String(value);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(String(o.id)); setIsOpen(false); }}
                className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomePage({ lostItems, foundItems, matches, categories, locations, currentUser, lang = 'en', onOpenReport, onOpenClaim, onOpenChat, onDeleteReport, onApproveDirect }) {
  const t = translations[lang] || translations.en;
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [tab, setTab]           = useState('all');

  const filter = (item) => {
    const q = search.toLowerCase();
    return (!q || [item.ItemName, item.Brand, item.Color, item.Description].some(f => f?.toLowerCase().includes(q)))
      && (!catFilter || item.CategoryID === parseInt(catFilter))
      && (!locFilter || item.LocationID === parseInt(locFilter));
  };

  const lost  = lostItems.filter(filter);
  const found = foundItems.filter(filter);
  const total = lost.length + found.length;

  const hasFilters = search || catFilter || locFilter;

  const categoryOptions = categories.map(c => ({ id: c.CategoryID, label: c.CategoryName }));
  const locationOptions = locations.map(l => ({ id: l.LocationID, label: l.LocationName }));

  return (
    <div className="space-y-7 pb-24 fade-up">

      {/* ── Filter Bar ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="input-field input-field-search" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <CustomSelect
          value={catFilter}
          options={categoryOptions}
          placeholder={t.allCategories}
          onChange={setCatFilter}
          icon={Tag}
        />

        <div className="flex gap-2">
          <CustomSelect
            value={locFilter}
            options={locationOptions}
            placeholder={t.allLocations}
            onChange={setLocFilter}
            icon={MapPin}
            className="flex-1"
          />
          {hasFilters && (
            <button onClick={() => { setSearch(''); setCatFilter(''); setLocFilter(''); }}
              className="btn-ghost rounded-xl text-xs px-3 whitespace-nowrap shrink-0 cursor-pointer">
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="tab-bar">
        <button onClick={() => setTab('all')}
          className={`tab-btn ${tab === 'all' ? 'tab-btn-active-all' : 'tab-btn-idle'}`}>
          {t.all} ({total})
        </button>
        <button onClick={() => setTab('lost')}
          className={`tab-btn ${tab === 'lost' ? 'tab-btn-active-lost' : 'tab-btn-idle'}`}>
          <AlertCircle className="inline w-3 h-3 mr-1" /> {t.lostItems} ({lost.length})
        </button>
        <button onClick={() => setTab('found')}
          className={`tab-btn ${tab === 'found' ? 'tab-btn-active-found' : 'tab-btn-idle'}`}>
          <CheckCircle className="inline w-3 h-3 mr-1" /> {t.foundItems} ({found.length})
        </button>
      </div>

      {/* ── Empty state ───────────────────────────────── */}
      {total === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
          <p className="text-sm font-bold text-slate-600">{t.noItemsFound}</p>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setCatFilter(''); setLocFilter(''); }}
              className="btn-ghost text-xs py-1.5 px-4 rounded-xl cursor-pointer">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ── Grid ──────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tab === 'all' || tab === 'lost') && lost.map(item => (
            <div key={`l-${item.LostID}`} className="item-card item-card-lost">
              <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
                <ItemImage src={item.Image} alt={item.ItemName} type="lost" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                <span className="badge-lost absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                  ⚠ {t.statusLost}
                </span>
                {item.Status === 'Claimed' && (
                  <span className="badge-claimed absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">{t.statusClaimed}</span>
                )}
              </div>

              <div className="p-4 flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.ItemName}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.Description || 'No description provided.'}</p>
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  {item.Brand && <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Tag className="w-3 h-3 text-teal-500 shrink-0" />{item.Brand} · {item.Color}</div>}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><MapPin className="w-3 h-3 text-teal-500 shrink-0" /><span className="truncate">{item.LocationName}</span></div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Calendar className="w-3 h-3 text-slate-400 shrink-0" />Lost on {item.DateLost}</div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 truncate">By {item.OwnerName}</span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onOpenChat(item.UserID)}
                    className="btn-ghost text-[11px] py-1.5 px-3 rounded-lg cursor-pointer">
                    <MessageCircle className="w-3 h-3" /> {t.chat}
                  </button>
                  {item.UserID === currentUser.UserID && (
                    <button onClick={() => onDeleteReport('lost', item.LostID)}
                      className="btn-danger text-[11px] py-1.5 px-3 rounded-lg cursor-pointer">
                      {t.delete}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(tab === 'all' || tab === 'found') && found.map(item => (
            <div key={`f-${item.FoundID}`} className="item-card item-card-found">
              <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
                <ItemImage src={item.Image} alt={item.ItemName} type="found" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                <span className="badge-found absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                  ✓ {t.statusFound}
                </span>
                {item.Status === 'Claimed'
                  ? <span className="badge-claimed absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">{t.statusClaimed}</span>
                  : <span className="badge-available absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">{t.statusFound}</span>
                }
              </div>

              <div className="p-4 flex-1 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.ItemName}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.Description || 'No description provided.'}</p>
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  {item.Brand && <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Tag className="w-3 h-3 text-teal-500 shrink-0" />{item.Brand} · {item.Color}</div>}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><MapPin className="w-3 h-3 text-teal-500 shrink-0" /><span className="truncate">{item.LocationName}</span></div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Calendar className="w-3 h-3 text-slate-400 shrink-0" />Found on {item.DateFound}</div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 truncate">By {item.FinderName}</span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onOpenChat(item.UserID)}
                    className="btn-ghost text-[11px] py-1.5 px-3 rounded-lg cursor-pointer">
                    <MessageCircle className="w-3 h-3" /> {t.chat}
                  </button>
                  {item.Status !== 'Claimed' && (
                    currentUser && currentUser.UserID === item.UserID ? (
                      <button onClick={() => onApproveDirect && onApproveDirect(item.FoundID, null)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm transition-colors">
                        <CheckCircle className="w-3 h-3" /> Mark Returned
                      </button>
                    ) : (
                      <button onClick={() => onOpenClaim(item)}
                        className="btn-primary text-[11px] py-1.5 px-3 rounded-lg cursor-pointer">
                        {t.claimItem}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
