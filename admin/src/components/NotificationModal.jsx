import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, title, message, type = 'success' }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isError = type === 'error';
  const isInfo = type === 'info';

  return ReactDOM.createPortal(
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 slide-in-from-right-5 duration-300">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          isError ? 'bg-rose-50 text-rose-600 border-rose-200' : isInfo ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {isError ? (
            <XCircle className="w-5 h-5" />
          ) : isInfo ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-4">
          <h4 className="text-xs font-black text-slate-900 leading-tight">
            {title || (isError ? 'Notice' : 'Success!')}
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">{message}</p>
        </div>

        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
