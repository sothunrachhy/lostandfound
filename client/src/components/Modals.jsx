import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Send, Bell, MessageSquare, Upload, Trash2, ChevronDown, Check, CheckCircle2, XCircle, Users, Search, MapPin, Calendar, Tag, MessageCircle, LogOut, AlertCircle } from 'lucide-react';
import { translations, getCategoryName, getLocationName } from '../translations';

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
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        callback(compressed || rawDataUrl);
      } catch (err) {
        console.error("Canvas compression error:", err);
        callback(rawDataUrl);
      }
    };
    img.onerror = () => {
      console.error("Image load failed");
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

export function ReportModal({ isOpen, onClose, mode, categories, locations, currentUser, onSubmit, lang = 'en' }) {
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
            {mode === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
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
                options={categories.map(c => ({ id: c.CategoryID, label: getCategoryName(c.CategoryName, lang) }))}
                placeholder="Select Category"
                onChange={(val) => setForm(f => ({ ...f, CategoryID: val }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Location *</label>
              <CustomSelectModal
                value={form.LocationID}
                options={locations.map(l => ({ id: l.LocationID, label: getLocationName(l.LocationName, lang) }))}
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

export function ClaimModal({ isOpen, onClose, foundItem, lostItem, currentUser, onSubmit, lang = 'en' }) {
  const [proof, setProof] = useState('');
  const [contact, setContact] = useState(currentUser ? `${currentUser.Email} | ${currentUser.Phone}` : '');
  if (!isOpen || !foundItem) return null;

  const t = translations[lang] || translations.en;

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
          <span className="text-[10px] font-black bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full uppercase">{t.claimItem}</span>
          <h2 className="text-xl font-black text-slate-800 mt-2">{t.claimItem}: {foundItem.ItemName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Provide proof so campus safety can verify and approve the release.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-0.5">
          <p className="font-bold text-slate-700">{foundItem.ItemName} · {foundItem.Brand || 'Unbranded'}</p>
          <p className="text-slate-400">Found at: {getLocationName(foundItem.LocationName, lang)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div><label className="block text-xs font-bold text-slate-600 mb-1">{t.proofOfOwnership} *</label>
            <textarea required rows={4} className="input-field font-mono resize-none" placeholder="Serial number, passcode, invoice number, unique engraving..." value={proof} onChange={e => setProof(e.target.value)} />
          </div>
          <div><label className="block text-xs font-bold text-slate-600 mb-1">{t.contactDetails}</label>
            <input className="input-field" value={contact} onChange={e => setContact(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">{t.cancel}</button>
            <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl"><ShieldCheck className="w-3.5 h-3.5" /> {t.submitClaim}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChatDrawer({ isOpen, onClose, messages, currentUser, recipient, allUsers, onSelectRecipient, onSend, onFetchMessages, onApproveDirect }) {
  const [text, setText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showContactList, setShowContactList] = useState(false);
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

  const filteredUsers = (allUsers || []).filter(u =>
    u.Name.toLowerCase().includes(searchContact.toLowerCase()) ||
    (u.RoleName && u.RoleName.toLowerCase().includes(searchContact.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="drawer w-full max-w-md h-full flex flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {recipient ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold text-sm flex items-center justify-center overflow-hidden shadow-xs border border-teal-600">
                    {recipient.ProfileImage || recipient.profile_image ? (
                      <img src={recipient.ProfileImage || recipient.profile_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      recipient.Name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{recipient.Name}</h4>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    recipient.RoleName === 'Admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {recipient.RoleName || 'User'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-700" />
                <h4 className="text-sm font-bold text-slate-800">Messages</h4>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowContactList(!showContactList)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showContactList ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="All Contacts"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contacts</span>
            </button>

            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messenger Contact Selector Bar / List */}
        {(showContactList || !recipient) && (
          <div className="bg-slate-50 border-b border-slate-200 p-3 space-y-2.5 shrink-0 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search people or role..."
                value={searchContact}
                onChange={e => setSearchContact(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-600 shadow-xs"
              />
            </div>

            {/* Horizontal Contacts Avatar Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {filteredUsers.map(u => {
                const isSelected = recipient?.UserID === u.UserID;
                return (
                  <button
                    key={u.UserID}
                    onClick={() => {
                      onSelectRecipient(u);
                      setShowContactList(false);
                    }}
                    className={`flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group transition-transform active:scale-95`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all overflow-hidden ${
                        isSelected ? 'bg-teal-700 text-white ring-2 ring-teal-600 ring-offset-2' : 'bg-white text-slate-700 border border-slate-200 group-hover:border-teal-500'
                      }`}>
                        {u.ProfileImage || u.profile_image ? (
                          <img src={u.ProfileImage || u.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.Name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                          u.isOnline || u.IsOnline || u.RoleID === 2 ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={u.isOnline || u.IsOnline || u.RoleID === 2 ? 'Online' : 'Offline'}
                      />
                    </div>
                    <span className={`text-[10px] truncate max-w-[64px] font-medium ${isSelected ? 'text-teal-800 font-bold' : 'text-slate-600'}`}>
                      {u.Name?.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
          {!recipient ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">Select a Contact</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Pick a student or admin from the contact list above to start chatting instantly.</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 font-semibold">Start conversation with {recipient.Name}</p>
              <p className="text-[10px] text-slate-400">Say hi or ask about your lost item below.</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.SenderID === currentUser.UserID;
              return (
                <div key={i} className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mb-0.5 overflow-hidden border border-slate-200">
                      {recipient.ProfileImage || recipient.profile_image ? (
                        <img src={recipient.ProfileImage || recipient.profile_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        recipient.Name?.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                  <div className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-teal-700 text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                  }`}>
                    <p>{m.MessageText}</p>
                    <span className={`text-[9px] block text-right mt-1 font-mono ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
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
        <form onSubmit={handleSend} className="flex gap-2 p-3.5 border-t border-slate-100 bg-white shrink-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={recipient ? `Message ${recipient.Name.split(' ')[0]}...` : "Select a contact above to message..."}
            disabled={!recipient}
            className="input-field flex-1 text-xs"
          />
          <button type="submit" disabled={!recipient || !text.trim()} className="btn-primary px-3.5 py-2.5 rounded-xl cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
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

export function NotificationModal({ isOpen, onClose, title, message, type = 'success' }) {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isError = type === 'error';

  return (
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
    </div>
  );
}

export const SuccessModal = NotificationModal;

export function ItemDetailModal({ isOpen, onClose, item, currentUser, onOpenChat, onOpenClaim, onApproveDirect, onDeleteReport, lang = 'en' }) {
  if (!isOpen || !item) return null;

  const t = translations[lang] || translations.en;
  const isFound = 'FoundID' in item;
  const isOwnerOrFinder = currentUser && currentUser.UserID === item.UserID;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto min-h-screen">
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-all active:scale-90"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Full Image Lightbox Header */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[280px] sm:max-h-[380px] overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20 pointer-events-none z-0" />

          {item.Image ? (
            <img
              src={item.Image}
              alt={item.ItemName}
              className="w-full h-full object-contain min-h-[220px] max-h-[280px] sm:max-h-[380px] transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Upload className="w-10 h-10 opacity-40" />
              <p className="text-xs font-semibold">No Image Provided</p>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 z-10 flex gap-2">
            <span className={`text-[11px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-xl shadow-md backdrop-blur-sm ${
              isFound ? 'bg-teal-600/90 text-white' : 'bg-rose-600/90 text-white'
            }`}>
              {isFound ? t.statusFound : t.statusLost}
            </span>
            {item.Status === 'Claimed' && (
              <span className="text-[11px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-xl shadow-md bg-amber-600/90 text-white backdrop-blur-sm">
                {t.statusClaimed}
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words">{item.ItemName}</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">{item.Description || 'No additional details provided.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.location}</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                {getLocationName(item.LocationName, lang) || 'Campus Building'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.date} ({isFound ? t.statusFound : t.statusLost})</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                {isFound ? item.DateFound : item.DateLost}
                {item.CreatedAt && (
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    · {new Date(item.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>

            {item.Brand && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.brand}</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                  <Tag className="w-4 h-4 text-teal-600 shrink-0" />
                  {item.Brand}
                </p>
              </div>
            )}

            {item.Color && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.color}</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 break-words">
                  <Tag className="w-4 h-4 text-teal-600 shrink-0" />
                  {item.Color}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">
              Reported by <strong className="text-slate-700 font-bold">{item.FinderName || item.OwnerName || 'Campus Member'}</strong>
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={() => { onClose(); onOpenChat(item.UserID); }}
              className="w-full sm:w-auto justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl sm:rounded-2xl cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-teal-600" />
              {t.chat}
            </button>

            {isFound && item.Status !== 'Claimed' && (
              isOwnerOrFinder ? (
                <button
                  onClick={() => { onClose(); onApproveDirect && onApproveDirect(item.FoundID, null); }}
                  className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl sm:rounded-2xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Returned
                </button>
              ) : (
                <button
                  onClick={() => { onClose(); onOpenClaim(item); }}
                  className="w-full sm:w-auto justify-center btn-primary text-xs px-5 py-3 rounded-xl sm:rounded-2xl cursor-pointer font-bold shadow-md active:scale-95"
                >
                  {t.claimItem}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, lang = 'en', variant }) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;
  const resolvedConfirmText = confirmText || t.delete || 'Delete';
  const resolvedCancelText = cancelText || t.cancel || 'Cancel';

  const textLower = (resolvedConfirmText + ' ' + (title || '') + ' ' + (message || '')).toLowerCase();
  const isDelete = variant === 'danger' || textLower.includes('delete') || textLower.includes('remove') || textLower.includes('លុប') || textLower.includes('削除');
  const isLogout = variant === 'warning' || textLower.includes('sign out') || textLower.includes('logout') || textLower.includes('ចាកចេញ') || textLower.includes('サインアウト');

  // Dynamic button color styling
  const btnColorClass = isDelete
    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25'
    : isLogout
    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25'
    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center space-y-4 relative animate-in zoom-in-95 duration-200 my-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Text Details */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{title || 'Are you sure?'}</h3>
          {message && (
            <p className="text-xs font-semibold text-slate-500 leading-relaxed px-1 break-words">
              {message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all active:scale-95"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-all active:scale-95 ${btnColorClass}`}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
