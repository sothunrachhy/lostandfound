import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Send, Bell, MessageSquare, Upload, Trash2, ChevronDown, Check } from 'lucide-react';

const compressImage = (file, maxDimension = 1200, quality = 0.8, callback) => {
  const reader = new FileReader();
  reader.onerror = () => {
    console.error("FileReader failed");
    callback('');
  };
  reader.onload = (e) => {
    const rawDataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width || 800;
        let height = img.height || 600;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        console.warn("Canvas compression fallback used:", err);
        callback(rawDataUrl);
      }
    };
    img.onerror = () => {
      console.warn("Image load fallback used");
      callback(rawDataUrl);
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
};

function CustomSelectModal({ value, options, placeholder, onChange, className = "" }) {
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
        className="w-full bg-white border border-slate-300 hover:border-teal-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 shadow-xs transition-all cursor-pointer h-full min-h-[38px]"
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

export function ReportModal({ isOpen, onClose, mode, categories, locations, currentUser, onSubmit }) {
  const [form, setForm] = useState({ ItemName: '', Brand: '', Color: '', CategoryID: '', LocationID: '', date: new Date().toISOString().split('T')[0], Description: '', Image: '' });
  const [isCompressing, setIsCompressing] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  React.useEffect(() => {
    if (isOpen) {
      setForm(f => ({
        ...f,
        CategoryID: f.CategoryID || (categories && categories[0] ? categories[0].CategoryID : ''),
        LocationID: f.LocationID || (locations && locations[0] ? locations[0].LocationID : '')
      }));
    }
  }, [isOpen, categories, locations]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      compressImage(file, 1200, 0.8, (compressedDataUrl) => {
        if (compressedDataUrl) {
          setForm(f => ({ ...f, Image: compressedDataUrl }));
        }
        setIsCompressing(false);
      });
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, Image: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const catId = parseInt(form.CategoryID, 10) || (categories && categories[0] ? categories[0].CategoryID : 1);
    const locId = parseInt(form.LocationID, 10) || (locations && locations[0] ? locations[0].LocationID : 1);

    onSubmit({
      mode,
      UserID: currentUser?.UserID,
      ItemName: form.ItemName,
      Brand: form.Brand,
      Color: form.Color,
      CategoryID: catId,
      LocationID: locId,
      DateLost: form.date,
      DateFound: form.date,
      Description: form.Description,
      Image: form.Image
    });
    setForm({ ItemName: '', Brand: '', Color: '', CategoryID: '', LocationID: '', date: new Date().toISOString().split('T')[0], Description: '', Image: '' });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-xl p-7 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
        <div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${mode === 'lost' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {mode === 'lost' ? '⚠ Report Lost Item' : '✓ Report Found Item'}
          </span>
          <h2 className="text-xl font-black text-slate-800 mt-2">{mode === 'lost' ? 'What did you lose?' : 'What did you find?'}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Accurate details help find matches faster.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Item Name *</label>
            <input required className="input-field" placeholder="e.g. Apple MacBook Pro, Fossil Wallet" value={form.ItemName} onChange={set('ItemName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Brand(Optional)</label><input className="input-field" placeholder="Apple, Nike..." value={form.Brand} onChange={set('Brand')} /></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Color(Optional)</label><input className="input-field" placeholder="Black, Brown..." value={form.Color} onChange={set('Color')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
              <CustomSelectModal
                value={form.CategoryID}
                options={categories.map(c => ({ id: c.CategoryID, label: c.CategoryName }))}
                placeholder="Select Category"
                onChange={(val) => setForm(f => ({ ...f, CategoryID: val }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Location *</label>
              <CustomSelectModal
                value={form.LocationID}
                options={locations.map(l => ({ id: l.LocationID, label: l.LocationName }))}
                placeholder="Select Location"
                onChange={(val) => setForm(f => ({ ...f, LocationID: val }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
            <input type="date" required className="input-field" value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Item Photo</label>
            {isCompressing ? (
              <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 flex flex-col items-center justify-center bg-teal-50/50 space-y-2">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-teal-800">Processing photo...</p>
              </div>
            ) : form.Image ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img src={form.Image} alt="Item Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-md flex items-center gap-1 text-xs font-bold">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-teal-50/30 group">
                <input type="file" accept="image/*, .jpg, .jpeg, .png, .webp, .heic, .heif" onChange={handleImageUpload} className="hidden" />
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Click to upload photo from your device</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP formats supported</p>
              </label>
            )}
          </div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
            <textarea rows={3} className="input-field resize-none" placeholder="Unique features, contents, exact location..." value={form.Description} onChange={set('Description')} />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" disabled={isCompressing} className="btn-primary text-xs px-5 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
              {isCompressing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Photo...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClaimModal({ isOpen, onClose, foundItem, lostItem, currentUser, onSubmit }) {
  const [proof, setProof] = useState('');
  const [contact, setContact] = useState(currentUser ? `${currentUser.Email} | ${currentUser.Phone}` : '');
  if (!isOpen || !foundItem) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ FoundID: foundItem.FoundID, LostID: lostItem?.LostID || null, OwnerID: currentUser.UserID, FinderID: foundItem.UserID, Proof: proof, ContactInfo: contact });
    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-lg p-7 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
        <div>
          <span className="text-[10px] font-black bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full uppercase">Ownership Verification</span>
          <h2 className="text-xl font-black text-slate-800 mt-2">Claim: {foundItem.ItemName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Provide proof so campus safety can verify and approve the release.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-0.5">
          <p className="font-bold text-slate-700">{foundItem.ItemName} · {foundItem.Brand || 'Unbranded'}</p>
          <p className="text-slate-400">Found at: {foundItem.LocationName}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div><label className="block text-xs font-bold text-slate-600 mb-1">Proof of Ownership *</label>
            <textarea required rows={4} className="input-field font-mono resize-none" placeholder="Serial number, passcode, invoice number, unique engraving..." value={proof} onChange={e => setProof(e.target.value)} />
          </div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">Contact Details</label>
            <input className="input-field" value={contact} onChange={e => setContact(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl"><ShieldCheck className="w-3.5 h-3.5" /> Submit Claim</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChatDrawer({ isOpen, onClose, messages, currentUser, recipient, allUsers, onSelectRecipient, onSend, onFetchMessages, onApproveDirect }) {
  const [text, setText] = useState('');
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen && recipient && onFetchMessages) {
      onFetchMessages(recipient.UserID);
      const interval = setInterval(() => {
        onFetchMessages(recipient.UserID);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, recipient]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !recipient) return;
    onSend({ SenderID: currentUser.UserID, ReceiverID: recipient.UserID, MessageText: text });
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
      <div className="drawer w-full max-w-sm h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <MessageSquare className="w-5 h-5 text-teal-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">Chat</p>
              {allUsers && allUsers.length > 0 ? (
                <select
                  value={recipient?.UserID || ''}
                  onChange={(e) => {
                    const u = allUsers.find(x => x.UserID === parseInt(e.target.value, 10));
                    if (u) onSelectRecipient(u);
                  }}
                  className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-2 py-0.5 mt-0.5 cursor-pointer max-w-full truncate"
                >
                  {allUsers.map(u => (
                    <option key={u.UserID} value={u.UserID}>
                      with {u.Name} ({u.RoleName})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[10px] text-slate-400">with {recipient?.Name || 'User'}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Handover Banner */}
        {recipient && onApproveDirect && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-emerald-800">Done talking & handed over item?</span>
            <button onClick={() => onApproveDirect(null, recipient.UserID)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg shrink-0 cursor-pointer transition-colors shadow-xs">
              Confirm Handover
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {!recipient ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-xs font-semibold text-slate-500">No other users registered yet.</p>
              <p className="text-[10px] text-slate-400">When another student or admin signs up, you can chat with them here!</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 space-y-1">
              <p className="text-xs text-slate-500 font-semibold">No messages yet with {recipient.Name}.</p>
              <p className="text-[10px] text-slate-400">Type a message below to start the conversation.</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.SenderID === currentUser.UserID;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${isMe ? 'bg-teal-700 text-white rounded-br-none shadow-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                    <p className="leading-relaxed">{m.MessageText}</p>
                    <span className="text-[9px] opacity-65 block text-right mt-1 font-mono">
                      {new Date(m.Timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input */}
        <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-slate-100 bg-white">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={recipient ? `Message ${recipient.Name.split(' ')[0]}...` : "Select a contact first..."}
            disabled={!recipient}
            className="input-field flex-1"
          />
          <button type="submit" disabled={!recipient || !text.trim()} className="btn-primary p-2.5 rounded-xl cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

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

export function ProfileModal({ isOpen, onClose, currentUser, onSaveProfile }) {
  const [form, setForm] = useState({
    Name: currentUser?.Name || '',
    Phone: currentUser?.Phone || '',
    StudentID: currentUser?.StudentID || '',
    ProfileImage: currentUser?.ProfileImage || ''
  });

  React.useEffect(() => {
    if (currentUser) {
      setForm({
        Name: currentUser.Name || '',
        Phone: currentUser.Phone || '',
        StudentID: currentUser.StudentID || '',
        ProfileImage: currentUser.ProfileImage || ''
      });
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 600, 0.8, (compressedDataUrl) => {
        setForm(f => ({ ...f, ProfileImage: compressedDataUrl }));
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      UserID: currentUser.UserID,
      Name: form.Name,
      Phone: form.Phone,
      StudentID: form.StudentID,
      ProfileImage: form.ProfileImage
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box w-full max-w-md p-7 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">Account Settings</span>
          <h2 className="text-xl font-black text-slate-800 mt-2">Edit Your Profile</h2>
          <p className="text-xs text-slate-400 mt-0.5">Update your photo and contact details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-teal-600 bg-slate-100 shadow-sm">
              <img src={form.ProfileImage || currentUser.ProfileImage} alt="" className="w-full h-full object-cover" />
            </div>
            <label className="btn-outline text-xs py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
            <input required className="input-field" value={form.Name} onChange={e => setForm(f => ({ ...f, Name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Student ID</label>
              <input className="input-field" value={form.StudentID} onChange={e => setForm(f => ({ ...f, StudentID: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
              <input className="input-field" value={form.Phone} onChange={e => setForm(f => ({ ...f, Phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email (Read Only)</label>
            <input className="input-field bg-slate-100 text-slate-500 cursor-not-allowed" value={currentUser.Email} disabled />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
