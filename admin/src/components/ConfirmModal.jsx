import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center space-y-3.5 relative animate-in zoom-in-95 duration-200 my-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3.5 right-3.5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner mt-1">
          <Trash2 className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">{title || 'Are you sure?'}</h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed px-2">{message}</p>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-2xl cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-2xl cursor-pointer transition-all shadow-md shadow-rose-600/20 active:scale-[0.98]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
