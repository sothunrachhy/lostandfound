import React from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, title, message, type = 'success' }) {
  if (!isOpen) return null;

  const isError = type === 'error';
  const isInfo = type === 'info';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl p-7 max-w-sm w-full shadow-2xl text-center space-y-4 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
          isError ? 'bg-rose-100 text-rose-600' : isInfo ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {isError ? (
            <XCircle className="w-9 h-9" />
          ) : isInfo ? (
            <ShieldCheck className="w-9 h-9" />
          ) : (
            <CheckCircle2 className="w-9 h-9" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            {title || (isError ? 'Notice' : 'Success!')}
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className={`w-full font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all shadow-md active:scale-[0.98] ${
            isError
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              : isInfo
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }`}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
