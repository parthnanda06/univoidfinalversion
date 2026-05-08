import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import {
  HiX, HiMinus, HiPaperAirplane, HiOutlineCheck, HiOutlineCheckCircle,
} from 'react-icons/hi';

/* ─── Relative "seen" time helper ───────────────────────── */
const seenLabel = (seenAt) => {
  if (!seenAt) return 'Seen';
  const diff = Math.floor((Date.now() - new Date(seenAt).getTime()) / 1000);
  if (diff < 10)  return 'Seen just now';
  if (diff < 60)  return `Seen ${diff}s ago`;
  if (diff < 3600) return `Seen ${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `Seen ${Math.floor(diff / 3600)}h ago`;
  return `Seen ${new Date(seenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

/* ─── Live-updating seen label (re-renders every 30s) ───── */
const SeenReceipt = ({ seenAt, avatar, name }) => {
  const [label, setLabel] = useState(() => seenLabel(seenAt));
  const initials = name?.charAt(0).toUpperCase();

  useEffect(() => {
    setLabel(seenLabel(seenAt));
    const id = setInterval(() => setLabel(seenLabel(seenAt)), 30_000);
    return () => clearInterval(id);
  }, [seenAt]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 5,
      marginTop: 3,
      animation: 'fadeInSeen 0.35s ease-out forwards',
    }}>
      {/* Mini avatar */}
      {avatar ? (
        <img src={avatar} alt={name} style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover', opacity: 0.85 }} />
      ) : (
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'white', fontWeight: 700, opacity: 0.85 }}>
          {initials}
        </div>
      )}
      <span style={{ fontSize: 10, color: '#818cf8', letterSpacing: '0.01em' }}>{label}</span>
    </div>
  );
};

/* ─── Single Chat Window ─────────────────────────────── */
const ChatWindow = ({ chat, index, total }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { closeChat, toggleMinimize, sendMessage, emitTyping, emitMarkRead, onlineUsers } = useChat();
  const [text, setText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const isOnline = onlineUsers.includes(String(chat.partner._id));

  // Auto-scroll on new messages
  useEffect(() => {
    if (!chat.minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, chat.minimized]);

  // Emit mark_read when chat is focused/unminimized
  useEffect(() => {
    if (!chat.minimized && chat.messages.length > 0) {
      emitMarkRead(chat.partner._id);
    }
  }, [chat.minimized, chat.partner._id, emitMarkRead]);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage(chat.partner._id, text.trim());
    setText('');
    emitTyping(chat.partner._id, false);
    if (typingTimeout) clearTimeout(typingTimeout);
  }, [text, chat.partner._id, sendMessage, emitTyping, typingTimeout]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping(chat.partner._id, true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => emitTyping(chat.partner._id, false), 2000));
  };

  // Position: stack from right, each window 320px wide + 12px gap
  const rightOffset = 12 + (total - 1 - index) * (320 + 12);

  const initials = chat.partner.name?.charAt(0).toUpperCase();

  // Find the last message I sent that has been read — to show "Seen" under it
  const myMessages = chat.messages
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => String(m.sender?._id || m.sender) === String(user?._id));
  const lastReadIdx = myMessages.reduce((acc, { m, i }) => (m.read ? i : acc), -1);
  const lastReadMsg = lastReadIdx >= 0 ? chat.messages[lastReadIdx] : null;

  return (
    <div
      className="chat-window"
      style={{
        position: 'fixed',
        bottom: 0,
        right: `${rightOffset}px`,
        width: '320px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -4px 40px rgba(99,102,241,0.25), 0 4px 24px rgba(0,0,0,0.5)',
        border: '1px solid rgba(99,102,241,0.2)',
        background: 'rgba(15,23,42,0.98)',
        backdropFilter: 'blur(24px)',
        transition: 'height 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Header */}
      <div
        className="chat-header"
        onClick={() => navigate(`/people/${chat.partner._id}`)}
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {chat.partner.avatar ? (
            <img
              src={chat.partner.avatar}
              alt={chat.partner.name}
              style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#a5b4fc,#34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 16,
            }}>
              {initials}
            </div>
          )}
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 10, height: 10, borderRadius: '50%',
            background: isOnline ? '#22c55e' : '#6b7280',
            border: '2px solid #4f46e5',
          }} />
        </div>

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 13, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {chat.partner.name}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>
            {chat.isTyping ? '✍️ typing…' : isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleMinimize(chat.partner._id)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HiMinus style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => closeChat(chat.partner._id)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HiX style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!chat.minimized && (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              height: 340,
              background: 'rgba(15,23,42,0.95)',
            }}
            onFocus={() => emitMarkRead(chat.partner._id)}
            onClick={() => emitMarkRead(chat.partner._id)}
          >
            {chat.isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{ width: 28, height: 28, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : chat.messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 60 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                <p>Say hi to {chat.partner.name}!</p>
              </div>
            ) : (
              chat.messages.map((msg, i) => {
                const isMine = String(msg.sender?._id || msg.sender) === String(user?._id);
                const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(chat.messages[i-1].createdAt).toDateString();
                const isLastRead = isMine && lastReadMsg && (msg._id ? msg._id === lastReadMsg._id : i === lastReadIdx);

                return (
                  <div key={msg._id || i} style={{ marginBottom: isLastRead ? 2 : 0 }}>
                    {showDate && (
                      <div style={{ textAlign: 'center', color: '#475569', fontSize: 10, margin: '8px 0' }}>
                        {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%',
                        padding: '8px 12px',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMine
                          ? 'linear-gradient(135deg,#4f46e5,#6366f1)'
                          : 'rgba(51,65,85,0.8)',
                        color: 'white',
                        fontSize: 13,
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        boxShadow: isMine ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                      }}>
                        {msg.text}
                        <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : '#64748b', marginTop: 2, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          {/* Delivery tick — only for my messages */}
                          {isMine && (
                            msg.read
                              ? <HiOutlineCheckCircle style={{ width: 11, height: 11, color: '#818cf8' }} title="Seen" />
                              : <HiOutlineCheck style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.4)' }} title="Delivered" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* "Seen just now" — only below the very last read message I sent */}
                    {isLastRead && (
                      <SeenReceipt
                        seenAt={msg.seenAt || chat.lastSeenAt}
                        avatar={chat.partner.avatar}
                        name={chat.partner.name}
                      />
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            background: 'rgba(15,23,42,0.98)',
          }}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              style={{
                flex: 1,
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 10,
                color: '#f1f5f9',
                fontSize: 13,
                padding: '8px 12px',
                resize: 'none',
                outline: 'none',
                maxHeight: 80,
                overflowY: 'auto',
                lineHeight: 1.5,
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                emitMarkRead(chat.partner._id);
              }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.2)'; }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: text.trim() ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'rgba(51,65,85,0.5)',
                border: 'none',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                boxShadow: text.trim() ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <HiPaperAirplane style={{ width: 16, height: 16, transform: 'rotate(90deg)' }} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Chat Container (renders all open windows) ─────── */
const ChatContainer = () => {
  const { openChats } = useChat();
  if (!openChats.length) return null;

  return (
    <>
      {openChats.map((chat, i) => (
        <ChatWindow key={chat.partner._id} chat={chat} index={i} total={openChats.length} />
      ))}
    </>
  );
};

export default ChatContainer;
