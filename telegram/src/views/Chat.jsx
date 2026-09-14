import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Image as ImageIcon, X, MapPin, ExternalLink, MessageSquare } from 'lucide-react';
import { compressImage } from '../lib/compressImage';
import { ScreenHeader, EmptyState } from '../components/Ui';
import OnlineDot from '../components/OnlineDot';
import { usePolling } from '../usePolling';
import { haptic } from '../telegram';

/**
 * Direct messages, ported from the web portal's ChatDrawer.
 *
 * The wire format is the web's: a plain string, or one prefixed with
 * [IMAGE] or [LOCATION] so both clients render the same thread.
 */
const IMAGE_PREFIX = '[IMAGE]';
const LOCATION_PREFIX = '[LOCATION]';

export default function Chat({ API, currentUser, contacts, initialRecipient, onBack, t }) {
  const [recipient, setRecipient] = useState(initialRecipient || contacts[0] || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const endRef = useRef(null);
  // Tracks whether the reader has scrolled up to read history. Polling must
  // not yank them back to the bottom every two seconds while they do.
  const scrolledUpRef = useRef(false);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    scrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight >= 120;
  };

  const scrollToBottom = useCallback((force = false) => {
    if (force || !scrolledUpRef.current) {
      endRef.current?.scrollIntoView({ behavior: force ? 'auto' : 'smooth' });
    }
  }, []);

  const fetchThread = useCallback(async () => {
    if (!recipient) return;
    const res = await fetch(`${API}/api/messages?userId2=${recipient.UserID}`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, [API, recipient]);

  // Poll the open thread; usePolling pauses it while the app is hidden.
  usePolling(fetchThread, recipient ? 2000 : null);

  // Switching conversation clears the thread here rather than in an effect,
  // so the old messages never flash under the new name.
  const selectContact = (u) => {
    haptic();
    scrolledUpRef.current = false;
    setMessages([]);
    setRecipient(u);
  };

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const send = async (messageText) => {
    if (!recipient || !messageText || sending) return;
    setSending(true);
    try {
      await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SenderID: currentUser.UserID,
          ReceiverID: recipient.UserID,
          MessageText: messageText,
        }),
      });
      scrolledUpRef.current = false;
      await fetchThread();
      scrollToBottom(true);
    } catch { /* the next poll retries */ } finally {
      setSending(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    send(body);
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    compressImage(file, 900, 0.75, (url) => {
      if (url) setPreview(url);
      setCompressing(false);
    });
  };

  if (contacts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <ScreenHeader title="Messages" onBack={onBack} />
        <div className="p-4 flex-1">
          <EmptyState icon={MessageSquare} title="Nobody to message yet"
            hint="Once other students have accounts, they appear here." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ScreenHeader title={recipient ? recipient.Name : 'Messages'} onBack={onBack} />

      {/* Contact strip */}
      <div className="bg-white border-b border-slate-200 px-3 py-2.5 shrink-0">
        <div className="flex gap-3 overflow-x-auto">
          {contacts.map((u) => {
            const selected = recipient?.UserID === u.UserID;
            return (
              <button key={u.UserID}
                onClick={() => selectContact(u)}
                className="flex flex-col items-center gap-1 shrink-0 w-14">
                <div className={`relative rounded-full ${selected ? 'ring-2 ring-teal-600 ring-offset-2' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                    {u.ProfileImage
                      ? <img src={u.ProfileImage} alt="" className="w-full h-full object-cover" />
                      : (u.Name?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <OnlineDot user={u} size="sm" />
                </div>
                <span className={`text-[10px] truncate max-w-full ${selected ? 'text-teal-800 font-bold' : 'text-slate-500'}`}>
                  {u.Name?.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-[11px] text-slate-400 text-center py-10 leading-relaxed">
            No messages yet.<br />Say hello to {recipient?.Name?.split(' ')[0]}.
          </p>
        )}

        {messages.map((m, i) => (
          <Bubble key={m.MessageID ?? i} message={m} isMine={m.SenderID === currentUser.UserID} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Photo preview before sending */}
      {preview && (
        <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-3 shrink-0">
          <img src={preview} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
          <p className="text-xs text-slate-500 flex-1">Send this photo?</p>
          <button onClick={() => setPreview('')} className="btn-ghost px-3 py-1.5 rounded-lg text-xs">
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { const p = preview; setPreview(''); send(IMAGE_PREFIX + p); }}
            className="btn-primary px-3 py-1.5 rounded-lg text-xs">
            Send
          </button>
        </div>
      )}

      {/* Composer */}
      <form onSubmit={submit} className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2 shrink-0">
        <label className="p-2 rounded-xl text-slate-400 cursor-pointer shrink-0" aria-label="Send a photo">
          <ImageIcon className={`w-5 h-5 ${compressing ? 'animate-pulse text-teal-600' : ''}`} />
          <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
        </label>
        <input
          className="input-field flex-1" placeholder={t.typeMessage || 'Write a message…'}
          value={text} onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="btn-primary w-10 h-10 rounded-full shrink-0 disabled:opacity-40" aria-label="Send">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

/* ─── One message ────────────────────────────────────────────── */
function Bubble({ message, isMine }) {
  const body = message.MessageText || '';
  const base = `max-w-[80%] p-2.5 rounded-2xl text-xs leading-relaxed ${
    isMine
      ? 'bg-teal-700 text-white rounded-br-sm'
      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
  }`;

  let content;
  if (body.startsWith(IMAGE_PREFIX)) {
    content = (
      <img src={body.slice(IMAGE_PREFIX.length)} alt="Shared"
        className="rounded-xl max-h-56 w-auto object-cover" />
    );
  } else if (body.startsWith(LOCATION_PREFIX)) {
    const [place, note] = body.slice(LOCATION_PREFIX.length).split('|');
    content = (
      <div className="space-y-1">
        <p className="font-bold flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />{place}
        </p>
        {note && <p className="opacity-90">{note}</p>}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place + ' Royal University of Phnom Penh')}`}
          target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-[11px] font-bold underline ${isMine ? 'text-white' : 'text-teal-700'}`}
        >
          <ExternalLink className="w-3 h-3" />Open in Maps
        </a>
      </div>
    );
  } else {
    content = <p className="whitespace-pre-wrap break-words">{body}</p>;
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={base}>
        {content}
        {message.Timestamp && (
          <span className={`block text-right text-[9px] mt-1 ${isMine ? 'text-teal-100' : 'text-slate-400'}`}>
            {new Date(message.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
