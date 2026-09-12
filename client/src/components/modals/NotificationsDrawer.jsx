import { X, Bell } from 'lucide-react';

export function NotificationsDrawer({ isOpen, onClose, notifications, onMarkRead }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
      <div className="drawer w-full max-w-sm h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" /> Notifications</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {notifications.length === 0 ? <p className="text-xs text-slate-400 italic text-center py-10">No notifications.</p>
            : notifications.map(n => (
              <div key={n.NotificationID} onClick={() => onMarkRead(n.NotificationID)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${n.Status === 'Unread' ? 'bg-white border-teal-200 shadow-sm' : 'bg-white/50 border-slate-100 opacity-60'}`}>
                <p className="text-[9px] font-black text-amber-600 uppercase mb-1">{n.Type} Alert</p>
                <p className="text-slate-700 leading-relaxed">{n.Message}</p>
                <span className="text-[9px] text-slate-400 mt-1 block">{new Date(n.Date).toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
