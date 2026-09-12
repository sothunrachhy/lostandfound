import { X, Upload, CheckCircle2, MapPin, Calendar, Tag, MessageCircle } from 'lucide-react';
import { translations, getLocationName } from '../../translations';

export function ItemDetailModal({ isOpen, onClose, item, currentUser, onOpenChat, onOpenClaim, onApproveDirect, onDeleteReport, lang = 'en' }) {
  if (!isOpen || !item) return null;

  const t = translations[lang] || translations.en;
  const isFound = 'FoundID' in item;
  const isOwnerOrFinder = currentUser && currentUser.UserID === item.UserID;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto min-h-screen">
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-all active:scale-90"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Full Image Lightbox Header */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[280px] sm:max-h-[380px] overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20 pointer-events-none z-0" />

          {item.Image ? (
            <img
              src={item.Image}
              alt={item.ItemName}
              className="w-full h-full object-contain min-h-[220px] max-h-[280px] sm:max-h-[380px] transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Upload className="w-10 h-10 opacity-40" />
              <p className="text-xs font-semibold">No Image Provided</p>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 z-10 flex gap-2">
            <span className={`text-[11px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-xl shadow-md backdrop-blur-sm ${
              isFound ? 'bg-teal-600/90 text-white' : 'bg-rose-600/90 text-white'
            }`}>
              {isFound ? t.statusFound : t.statusLost}
            </span>
            {item.Status === 'Claimed' && (
              <span className="text-[11px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-xl shadow-md bg-amber-600/90 text-white backdrop-blur-sm">
                {t.statusClaimed}
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words">{item.ItemName}</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">{item.Description || 'No additional details provided.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.location}</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                {getLocationName(item.LocationName, lang) || 'Campus Building'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.date} ({isFound ? t.statusFound : t.statusLost})</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                {isFound ? item.DateFound : item.DateLost}
                {item.CreatedAt && (
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    · {new Date(item.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>

            {item.Brand && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.brand}</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                  <Tag className="w-4 h-4 text-teal-600 shrink-0" />
                  {item.Brand}
                </p>
              </div>
            )}

            {item.Color && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.color}</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                  <Tag className="w-4 h-4 text-teal-600 shrink-0" />
                  {item.Color}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">
              Reported by <strong className="text-slate-700 font-bold">{item.FinderName || item.OwnerName || 'Campus Member'}</strong>
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={() => { onClose(); onOpenChat(item.UserID); }}
              className="w-full sm:w-auto justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl sm:rounded-2xl cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-teal-600" />
              {t.chat}
            </button>

            {isFound && item.Status !== 'Claimed' && (
              isOwnerOrFinder ? (
                <button
                  onClick={() => { onClose(); onApproveDirect && onApproveDirect(item.FoundID, null); }}
                  className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl sm:rounded-2xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Returned
                </button>
              ) : (
                <button
                  onClick={() => { onClose(); onOpenClaim(item); }}
                  className="w-full sm:w-auto justify-center btn-primary text-xs px-5 py-3 rounded-xl sm:rounded-2xl cursor-pointer font-bold shadow-md active:scale-95"
                >
                  {t.claimItem}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
