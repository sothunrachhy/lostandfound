import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

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

  return ReactDOM.createPortal(
    <div className="fixed bottom-5 right-5 z-50 max-w-xs w-full animate-in slide-in-from-bottom-5 slide-in-from-right-5 duration-300">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-3.5 px-4 flex items-center justify-between gap-3 relative">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-slate-900 leading-tight">
            {title || (isError ? 'Notice' : 'Success!')}
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">{message}</p>
        </div>

        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
}
