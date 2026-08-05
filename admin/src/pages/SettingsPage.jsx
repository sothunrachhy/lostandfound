import React, { useState } from 'react';
import { Tag, MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function SettingsPage({
  categories, locations,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddLocation, onUpdateLocation, onDeleteLocation
}) {
  const [newCat, setNewCat] = useState('');
  const [newLoc, setNewLoc] = useState('');

  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatText, setEditCatText] = useState('');

  const [editingLocId, setEditingLocId] = useState(null);
  const [editLocText, setEditLocText] = useState('');

  const handleStartEditCat = (c) => {
    setEditingCatId(c.CategoryID);
    setEditCatText(c.CategoryName);
  };

  const handleSaveCat = async (id) => {
    if (editCatText.trim()) {
      await onUpdateCategory(id, editCatText.trim());
    }
    setEditingCatId(null);
  };

  const handleStartEditLoc = (l) => {
    setEditingLocId(l.LocationID);
    setEditLocText(l.LocationName);
  };

  const handleSaveLoc = async (id) => {
    if (editLocText.trim()) {
      await onUpdateLocation(id, editLocText.trim());
    }
    setEditingLocId(null);
  };

  return (
    <div className="space-y-8 pb-16 fade-up">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Categories */}
        <div className="admin-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-600" /> Item Categories
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); if (newCat.trim()) { onAddCategory(newCat.trim()); setNewCat(''); } }} className="flex gap-2">
            <input value={newCat} onChange={e => setNewCat(e.target.value)}
              placeholder="Category name..." className="admin-input flex-1" />
            <button type="submit" className="btn-admin text-xs px-4 py-2 rounded-xl shrink-0 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
          <div className="space-y-2">
            {categories.map(c => {
              const isEditing = String(editingCatId) === String(c.CategoryID);
              return (
                <div key={c.CategoryID} className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-sm text-slate-700">
                  {isEditing ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveCat(c.CategoryID); }} className="flex items-center gap-1.5 flex-1">
                      <input
                        value={editCatText}
                        onChange={e => setEditCatText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingCatId(null); }}
                        className="admin-input flex-1 text-xs py-1 px-2"
                        autoFocus
                      />
                      <button type="submit" className="p-1.5 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 cursor-pointer" title="Save">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditingCatId(null)} className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer" title="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="font-semibold">{c.CategoryName}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleStartEditCat(c)} title="Edit Category"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => { if (confirm(`Delete category "${c.CategoryName}"?`)) onDeleteCategory(c.CategoryID); }} title="Delete Category"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Locations */}
        <div className="admin-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" /> Campus Locations
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); if (newLoc.trim()) { onAddLocation(newLoc.trim()); setNewLoc(''); } }} className="flex gap-2">
            <input value={newLoc} onChange={e => setNewLoc(e.target.value)}
              placeholder="Location name..." className="admin-input flex-1" />
            <button type="submit" className="btn-admin text-xs px-4 py-2 rounded-xl shrink-0 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
          <div className="space-y-2">
            {locations.map(l => {
              const isEditing = String(editingLocId) === String(l.LocationID);
              return (
                <div key={l.LocationID} className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-sm text-slate-700">
                  {isEditing ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveLoc(l.LocationID); }} className="flex items-center gap-1.5 flex-1">
                      <input
                        value={editLocText}
                        onChange={e => setEditLocText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingLocId(null); }}
                        className="admin-input flex-1 text-xs py-1 px-2"
                        autoFocus
                      />
                      <button type="submit" className="p-1.5 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 cursor-pointer" title="Save">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditingLocId(null)} className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer" title="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="font-semibold">{l.LocationName}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleStartEditLoc(l)} title="Edit Location"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => { if (confirm(`Delete location "${l.LocationName}"?`)) onDeleteLocation(l.LocationID); }} title="Delete Location"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
