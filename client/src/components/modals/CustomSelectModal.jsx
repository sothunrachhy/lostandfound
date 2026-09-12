import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelectModal({ value, options, placeholder, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.id) === String(value));

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 hover:border-teal-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between shadow-xs transition-all cursor-pointer h-full min-h-[38px]"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 max-h-52 overflow-y-auto fade-up space-y-0.5">
          {options.map(o => {
            const isSelected = String(o.id) === String(value);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(String(o.id)); setIsOpen(false); }}
                className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
