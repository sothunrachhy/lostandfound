import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Search, CheckCheck, X, Phone, Mail, CreditCard, Shield, Image as ImageIcon, MapPin, Navigation, ExternalLink, Check } from 'lucide-react';

const compressImage = (file, maxDimension = 900, quality = 0.75, callback) => {
  const reader = new FileReader();
  reader.onerror = () => callback('');
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
        callback(canvas.toDataURL('image/jpeg', quality) || rawDataUrl);
      } catch (err) {
        callback(rawDataUrl);
      }
    };
    img.onerror = () => callback(rawDataUrl);
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
};

function AdminLocationModal({ isOpen, onClose, onSendLocation }) {
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
                      <p className="truncate text-xs font-semibold">{loc.name}</p>
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
              className="admin-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button type="submit" className="btn-admin text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <MapPin className="w-3.5 h-3.5" />
              <span>Send Location Pin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MessagesPage({ currentAdmin, users, API, onRefresh }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 120;
    userScrolledUpRef.current = !isBottom;
  };

  const scrollToBottom = (force = false) => {
    if (force || !userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const studentUsers = (users || []).filter(u => u.UserID !== currentAdmin.UserID);

  const filteredUsers = studentUsers.filter(u =>
    u.Name.toLowerCase().includes(search.toLowerCase()) ||
    u.Email.toLowerCase().includes(search.toLowerCase()) ||
    (u.StudentID && u.StudentID.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    if (!selectedUser && filteredUsers.length > 0) {
      setSelectedUser(filteredUsers[0]);
    }
  }, [users]);

  const fetchThread = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API}/api/messages?userId1=${currentAdmin.UserID}&userId2=${selectedUser.UserID}`);
      const data = await res.json();
      setMessages(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchThread();
    const interval = setInterval(fetchThread, 2000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    userScrolledUpRef.current = false;
    scrollToBottom(true);
  }, [selectedUser?.UserID]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  const sendMessagePayload = async (msgText) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SenderID: currentAdmin.UserID,
          ReceiverID: selectedUser.UserID,
          MessageText: msgText
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchThread();
        userScrolledUpRef.current = false;
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    sendMessagePayload(text.trim());
    setText('');
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 900, 0.75, (compressedUrl) => {
        if (compressedUrl) {
          setPreviewImage(compressedUrl);
        }
      });
      e.target.value = '';
    }
  };

  const handleSendPhoto = () => {
    if (!previewImage || !selectedUser) return;
    sendMessagePayload(`[IMAGE]${previewImage}`);
    setPreviewImage('');
  };

  const handleSendLocation = ({ locationName, note }) => {
    if (!selectedUser) return;
    const locPayload = note ? `${locationName}|${note}` : locationName;
    sendMessagePayload(`[LOCATION]${locPayload}`);
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] flex rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ── Left Sidebar: Conversations ──────── */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-700" /> Direct Messages
            </h3>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              {studentUsers.length} Users
            </span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student or email..."
              className="admin-input admin-input-search text-xs py-2 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-8">No users found.</p>
          ) : (
            filteredUsers.map(u => {
              const isSelected = selectedUser?.UserID === u.UserID;
              return (
                <div
                  key={u.UserID}
                  onClick={() => setSelectedUser(u)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50/80 border-l-4 border-teal-600' : 'hover:bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={u.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.Name)}`}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        u.isOnline || u.IsOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                        {u.Name}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{u.Email}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Window: Chat Thread ─────────── */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <MessageSquare className="w-12 h-12 stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">Select a student user to start chatting</p>
            <p className="text-xs text-slate-400 mt-1">Communicate directly with users regarding lost & found claims.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div
                onClick={() => setProfileModalUser(selectedUser)}
                className="flex items-center gap-3 cursor-pointer group"
                title="Click to view full user profile"
              >
                <img
                  src={selectedUser.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.Name)}`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-600 group-hover:border-teal-700 transition-all shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                    {selectedUser.Name}
                    <span className="text-[10px] font-normal text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      View Profile
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">{selectedUser.Email}</p>
                </div>
              </div>

              <button
                onClick={() => setProfileModalUser(selectedUser)}
                className="btn-ghost text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-teal-700" /> Profile Details
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
              {messages.length === 0 ? (
                <div className="text-center py-20 space-y-1">
                  <p className="text-xs font-semibold text-slate-500">No message history with {selectedUser.Name} yet.</p>
                  <p className="text-[10px] text-slate-400">Send a message, photo, or location pin below to reach out.</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.SenderID === currentAdmin.UserID;
                  const textMsg = m.MessageText || '';
                  const isImage = textMsg.startsWith('[IMAGE]');
                  const isLocation = textMsg.startsWith('[LOCATION]');

                  let imageSrc = '';
                  if (isImage) {
                    imageSrc = textMsg.replace('[IMAGE]', '');
                  }

                  let locName = '', locNote = '';
                  if (isLocation) {
                    const rawLoc = textMsg.replace('[LOCATION]', '');
                    const parts = rawLoc.split('|');
                    locName = parts[0];
                    locNote = parts[1] || '';
                  }

                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-teal-700 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}>
                        {isImage ? (
                          <div className="space-y-1.5">
                            <div className="rounded-xl overflow-hidden border border-white/20 max-w-xs max-h-60 bg-slate-900">
                              <img src={imageSrc} alt="Shared Photo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => window.open(imageSrc, '_blank')} />
                            </div>
                            <p className="text-[10px] opacity-80 flex items-center gap-1 font-semibold">
                              <ImageIcon className="w-3 h-3" /> Shared Photo
                            </p>
                          </div>
                        ) : isLocation ? (
                          <div className="space-y-2 min-w-[210px]">
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isMe ? 'text-teal-200' : 'text-teal-700'}`}>
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span>Campus Location Pin</span>
                            </div>

                            <div className={`p-2.5 rounded-xl border ${isMe ? 'bg-teal-800/80 border-teal-600' : 'bg-slate-50 border-slate-200'} space-y-1`}>
                              <p className="font-bold text-xs leading-snug">{locName}</p>
                              {locNote && <p className={`text-[11px] ${isMe ? 'text-teal-100' : 'text-slate-500'}`}>{locNote}</p>}
                            </div>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locName + ' Royal University of Phnom Penh')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-[11px] font-bold underline transition-opacity hover:opacity-80 ${isMe ? 'text-white' : 'text-teal-700'}`}
                            >
                              <ExternalLink className="w-3 h-3" /> Open in Google Maps
                            </a>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{textMsg}</p>
                        )}

                        <div className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 opacity-70 font-mono ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                          <span>{new Date(m.Timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-teal-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-2">
              {/* Photo Preview Strip */}
              {previewImage && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={previewImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                    <span className="text-xs font-bold text-slate-700 truncate">Photo ready to send</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={handleSendPhoto} className="btn-admin text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                    <button type="button" onClick={() => setPreviewImage('')} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedUser}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-40 cursor-pointer shrink-0 border border-slate-200"
                  title="Attach Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  disabled={!selectedUser}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-40 cursor-pointer shrink-0 border border-slate-200"
                  title="Share Location Pin"
                >
                  <MapPin className="w-4 h-4" />
                </button>

                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={`Type a message to ${selectedUser.Name.split(' ')[0]}...`}
                  className="admin-input flex-1 text-xs"
                />
                <button type="submit" disabled={!text.trim()} className="btn-admin text-xs px-5 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <AdminLocationModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSendLocation={handleSendLocation}
      />

      {/* ── User Profile Details Modal ─────────── */}
      {profileModalUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative fade-up space-y-5">
            <button
              onClick={() => setProfileModalUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <img
                src={profileModalUser.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileModalUser.Name)}`}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-4 border-teal-600 shadow-md"
              />
              <div>
                <h3 className="text-lg font-black text-slate-800">{profileModalUser.Name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 inline-block mt-1">
                  {profileModalUser.RoleName || 'Student User'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-b border-slate-100 py-4">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-semibold">{profileModalUser.Email}</span>
              </div>
              {profileModalUser.Phone && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">{profileModalUser.Phone}</span>
                </div>
              )}
              {profileModalUser.StudentID && (
                <div className="flex items-center gap-3 text-slate-700">
                  <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">ID: {profileModalUser.StudentID}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setProfileModalUser(null)}
              className="btn-ghost w-full justify-center py-2 text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
