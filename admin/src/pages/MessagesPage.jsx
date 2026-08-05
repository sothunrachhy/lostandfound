import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Search, CheckCheck, X, Phone, Mail, CreditCard, Shield } from 'lucide-react';

export default function MessagesPage({ currentAdmin, users, API, onRefresh }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [profileModalUser, setProfileModalUser] = useState(null);
  const messagesEndRef = useRef(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SenderID: currentAdmin.UserID,
          ReceiverID: selectedUser.UserID,
          MessageText: text.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setText('');
        fetchThread();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] flex rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                  <img
                    src={u.ProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.Name)}`}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
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
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
              {messages.length === 0 ? (
                <div className="text-center py-20 space-y-1">
                  <p className="text-xs font-semibold text-slate-500">No message history with {selectedUser.Name} yet.</p>
                  <p className="text-[10px] text-slate-400">Send a message below to reach out to this student.</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.SenderID === currentAdmin.UserID;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-teal-700 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.MessageText}</p>
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
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex gap-2 bg-white">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Type a message to ${selectedUser.Name.split(' ')[0]}...`}
                className="admin-input flex-1 text-xs"
              />
              <button type="submit" disabled={!text.trim()} className="btn-admin text-xs px-5 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </>
        )}
      </div>

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
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="font-semibold truncate">{profileModalUser.Email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Student ID</p>
                  <p className="font-mono font-semibold">{profileModalUser.StudentID || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="font-semibold">{profileModalUser.Phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setProfileModalUser(null)}
              className="w-full btn-admin text-xs py-2.5 rounded-xl justify-center cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
