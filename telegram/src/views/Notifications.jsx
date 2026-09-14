import { Bell, CheckCheck } from 'lucide-react';
import { EmptyState, ScreenHeader } from '../components/Ui';
import { haptic } from '../telegram';

const TYPE_STYLES = {
  Match:    { dot: 'bg-teal-500',   tint: 'bg-teal-50 border-teal-200' },
  Approval: { dot: 'bg-emerald-500', tint: 'bg-emerald-50 border-emerald-200' },
  Report:   { dot: 'bg-amber-500',  tint: 'bg-amber-50 border-amber-200' },
};

function when(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return d.toLocaleDateString();
}

export default function Notifications({ notifications, onMarkRead, onBack }) {
  const unread = notifications.filter((n) => n.Status === 'Unread');

  return (
    <div className="min-h-screen flex flex-col">
      <ScreenHeader
        title="Notifications"
        onBack={onBack}
        action={unread.length > 0 ? (
          <button
            onClick={() => { haptic(); unread.forEach((n) => onMarkRead(n.NotificationID)); }}
            className="text-[11px] font-bold text-teal-700 shrink-0 inline-flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />Mark all read
          </button>
        ) : null}
      />

      <div className="p-4 space-y-2.5 flex-1">
        {notifications.length === 0 && (
          <EmptyState icon={Bell} title="No notifications yet"
            hint="You'll hear here when a report is approved or a match is found." />
        )}

        {notifications.map((n) => {
          const style = TYPE_STYLES[n.Type] || { dot: 'bg-slate-400', tint: 'bg-white border-slate-200' };
          const isUnread = n.Status === 'Unread';
          return (
            <button
              key={n.NotificationID}
              onClick={() => { if (isUnread) { haptic(); onMarkRead(n.NotificationID); } }}
              className={`w-full text-left border rounded-2xl p-3.5 flex gap-3 fade-up transition-colors ${
                isUnread ? style.tint : 'bg-white border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isUnread ? style.dot : 'bg-slate-200'}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs leading-relaxed ${isUnread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                  {n.Message}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{when(n.Date)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
