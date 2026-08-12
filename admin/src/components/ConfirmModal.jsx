import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', variant }) {
  if (!isOpen) return null;

  const textLower = (confirmText + ' ' + (title || '')).toLowerCase();
  const isDelete = variant === 'danger' || textLower.includes('delete') || textLower.includes('remove');
  const isLogout = variant === 'warning' || textLower.includes('sign out') || textLower.includes('logout');

  // Dynamic button color styling
  const btnColorClass = isDelete
    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25'
    : isLogout
    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25'
    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center space-y-4 relative animate-in zoom-in-95 duration-200 my-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Text Details */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{title || 'Are you sure?'}</h3>
          {message && (
            <p className="text-xs font-semibold text-slate-500 leading-relaxed px-1 break-words">
              {message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all active:scale-95 ${btnColorClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
