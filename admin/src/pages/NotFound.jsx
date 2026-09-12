import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * Shown for any admin URL that does not match a section. Without this a
 * mistyped or stale link rendered an empty panel with no explanation.
 */
export default function NotFound() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
      <Compass className="w-10 h-10 mx-auto text-slate-300" />
      <h2 className="text-lg font-black text-slate-800">This page does not exist</h2>
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        The link may be out of date, or the address may have a typo.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
