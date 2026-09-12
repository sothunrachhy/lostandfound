import { useState } from 'react';
import { X, Check, Search, MapPin, Navigation } from 'lucide-react';
import { getLocationName } from '../../translations';

export function ChatLocationModal({ isOpen, onClose, onSendLocation, lang = 'en' }) {
  const [selectedLocation, setSelectedLocation] = useState('RUPP Campus 1 — Building T');
  const [customNote, setCustomNote] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const RUPP_LOCATIONS = [
    { name: 'RUPP Campus 1 — Building A (Humanities)', desc: 'Humanities & Social Sciences' },
    { name: 'RUPP Campus 1 — Building B (Science & IT)', desc: 'Science & Computer Labs' },
    { name: 'RUPP Campus 1 — IFL (Institute of Foreign Languages)', desc: 'Foreign Language Classrooms' },
    { name: 'RUPP Campus 1 — Central Library (បណ្ណាល័យ)', desc: 'Central Library & Reading Rooms' },
    { name: 'RUPP Campus 1 — Sports Field & Canteen', desc: 'Football field & Student Canteen' },
    { name: 'RUPP Campus 2 — Faculty of Engineering (FE)', desc: 'Engineering & Technology' },
    { name: 'RUPP — Building T', desc: 'STEM & IT Department' },
    { name: 'RUPP — Building C', desc: 'Classroom Block C' },
    { name: 'RUPP — Building D', desc: 'Classroom Block D' },
    { name: 'RUPP — STEM Building', desc: 'STEM Research Labs' },
    { name: 'RUPP — DMC Café', desc: 'Media & Communication Café' },
    { name: 'RUPP — Motorcycle Parking', desc: 'Main Campus Parking' },
    { name: 'RUPP — Auditorium', desc: 'Main Events Auditorium' },
  ];

  const filteredLocations = RUPP_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.desc.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendLocation({
      locationName: selectedLocation,
      note: customNote.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Share Campus Location Pin</h3>
              <p className="text-[11px] text-slate-500 font-medium">Select RUPP building or location pin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Preview (Google Maps Embed of RUPP) */}
        <div className="relative w-full h-44 bg-slate-100 shrink-0 border-b border-slate-100">
          <iframe
            title="RUPP Campus Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src="https://maps.google.com/maps?q=Royal+University+of+Phnom+Penh&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full"
          />
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs flex items-center gap-1">
            <Navigation className="w-3 h-3 text-teal-600 animate-pulse" />
            <span>Royal University of Phnom Penh</span>
          </div>
        </div>

        {/* Location List & Note */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Select Building / Pin Spot *</label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter location building..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700"
              />
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
              {filteredLocations.map(loc => {
                const isSelected = selectedLocation === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => setSelectedLocation(loc.name)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-700 text-white font-bold' : 'hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-xs font-semibold">{getLocationName(loc.name, lang)}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{loc.desc}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room / Specific Spot Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 2nd Floor, Room 204 near stairs"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <MapPin className="w-3.5 h-3.5" />
              <span>Send Location Pin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
