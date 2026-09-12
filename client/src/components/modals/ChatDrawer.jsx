import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Users, Search, MapPin, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { getLocationName } from '../../translations';
import OnlineDot from '../OnlineDot';
import { compressImage } from './compressImage';
import { usePolling } from '../../usePolling';
import { ChatLocationModal } from './ChatLocationModal';

export function ChatDrawer({ isOpen, onClose, messages, currentUser, recipient, allUsers, onSelectRecipient, onSend, onFetchMessages, onApproveDirect, lang = 'en' }) {
  // `recipient` is a snapshot taken when the chat opened; `allUsers` is
  // refreshed by polling, so prefer the live record for presence.
  const liveRecipient =
    (recipient && allUsers?.find(u => u.UserID === recipient.UserID)) || recipient;

  const [text, setText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showContactList, setShowContactList] = useState(false);
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

  // Polls the open thread, but stops entirely while the tab is hidden.
  usePolling(
    () => onFetchMessages && onFetchMessages(recipient.UserID),
    isOpen && recipient && onFetchMessages ? 2000 : null
  );

  useEffect(() => {
    userScrolledUpRef.current = false;
    scrollToBottom(true);
  }, [recipient?.UserID]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !recipient) return;
    onSend({ SenderID: currentUser.UserID, ReceiverID: recipient.UserID, MessageText: text });
    setText('');
    userScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom(true), 50);
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
    if (!previewImage || !recipient) return;
    onSend({ SenderID: currentUser.UserID, ReceiverID: recipient.UserID, MessageText: `[IMAGE]${previewImage}` });
    setPreviewImage('');
    userScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom(true), 50);
  };

  const handleSendLocation = ({ locationName, note }) => {
    if (!recipient) return;
    const locPayload = note ? `${locationName}|${note}` : locationName;
    onSend({ SenderID: currentUser.UserID, ReceiverID: recipient.UserID, MessageText: `[LOCATION]${locPayload}` });
    userScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom(true), 50);
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
                      recipient.Name?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'
                    )}
                  </div>
                  <OnlineDot user={liveRecipient} size="sm" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate leading-snug">{recipient.Name}</h4>
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
                      <OnlineDot user={u} />
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
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
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
              <p className="text-[10px] text-slate-400">Say hi, send a photo, or pin your location below.</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.SenderID === currentUser.UserID;
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

                  <div className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-teal-700 text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
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
                          <p className="font-bold text-xs leading-snug">{getLocationName(locName, lang)}</p>
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
                      <p className="break-words whitespace-pre-wrap">{textMsg}</p>
                    )}

                    <span className={`text-[9px] block text-right mt-1 font-mono ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
                      {m.Timestamp ? new Date(m.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input with Photo & Location Pin buttons */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white shrink-0 space-y-2">
          {/* Photo Preview Strip */}
          {previewImage && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <img src={previewImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                <span className="text-xs font-bold text-slate-700 truncate">Photo ready to send</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={handleSendPhoto} className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
                <button type="button" onClick={() => setPreviewImage('')} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
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
              disabled={!recipient}
              className="p-2 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              title="Attach Photo"
            >
              <ImageIcon className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              disabled={!recipient}
              className="p-2 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              title="Share Location Pin"
            >
              <MapPin className="w-4.5 h-4.5" />
            </button>

            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={recipient ? `Message ${recipient.Name.split(' ')[0]}...` : "Select a contact above to message..."}
              disabled={!recipient}
              className="input-field flex-1 text-xs"
            />
            <button type="submit" disabled={!recipient || !text.trim()} className="btn-primary px-3.5 py-2 rounded-xl cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <ChatLocationModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSendLocation={handleSendLocation}
        lang={lang}
      />
    </div>
  );
}
