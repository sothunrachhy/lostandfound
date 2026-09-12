import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * Shown for any address that is not a real page. Previously every unknown
 * path silently rendered the board, so a mistyped or dead link looked as if
 * it had worked.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-10 text-center space-y-3">
        <Compass className="w-10 h-10 mx-auto text-slate-300" />
        <h1 className="text-lg font-black text-slate-800">This page does not exist</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The link may be out of date, or the address may have a typo.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors"
        >
          Back to the board
        </Link>
      </div>
    </div>
  );
}
