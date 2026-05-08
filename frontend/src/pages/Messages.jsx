import { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { searchUsers } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch, HiOutlineCheckCircle, HiOutlineCheck,
  HiOutlineChatAlt2, HiOutlineX, HiOutlineUserAdd,
} from 'react-icons/hi';

/* ─── Relative "seen" time, live-updating ─────────────── */
const seenLabel = (seenAt) => {
  if (!seenAt) return 'Seen';
  const diff = Math.floor((Date.now() - new Date(seenAt).getTime()) / 1000);
  if (diff < 10)  return 'Seen just now';
  if (diff < 60)  return `Seen ${diff}s ago`;
  if (diff < 3600) return `Seen ${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `Seen ${Math.floor(diff / 3600)}h ago`;
  return `Seen ${new Date(seenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

const LiveSeenLabel = ({ seenAt }) => {
  const [label, setLabel] = useState(() => seenLabel(seenAt));
  useEffect(() => {
    setLabel(seenLabel(seenAt));
    const id = setInterval(() => setLabel(seenLabel(seenAt)), 15_000);
    return () => clearInterval(id);
  }, [seenAt]);
  return <>{label}</>;
};

/* ─── Main page ───────────────────────────────────────── */
const Messages = () => {
  const { conversations, loadConversations, openChat, onlineUsers } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [suggestions, setSuggestions] = useState([]); // autocomplete results
  const [sugLoading, setSugLoading]   = useState(false);
  const [showDrop, setShowDrop]       = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);  // keyboard nav

  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);
  const inputRef    = useRef(null);

  // Load conversations once on mount
  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  // Build suggestions: conversation partners first, then ALL users from API
  const buildSuggestions = useCallback(async (q) => {
    const lq = q.toLowerCase();

    // 1. Instant results from existing conversations
    const fromConversations = conversations
      .filter(c => c.partner?.name?.toLowerCase().includes(lq))
      .map(c => ({ ...c.partner, _inConversation: true, _isConnected: true }));

    // 2. Broader search via API — show ALL matching users (not just connections)
    setSugLoading(true);
    try {
      const { data } = await searchUsers(q, 1);
      const existingIds = new Set(fromConversations.map(p => String(p._id)));
      const myConnectionIds = new Set((user?.connections || []).map(String));

      const fromSearch = (data.users || [])
        .filter(u =>
          String(u._id) !== String(user?._id) &&  // exclude self
          !existingIds.has(String(u._id))           // not already listed
        )
        .map(u => ({
          ...u,
          _inConversation: false,
          _isConnected: myConnectionIds.has(String(u._id)),
        }));

      setSuggestions([...fromConversations, ...fromSearch].slice(0, 10));
    } catch {
      setSuggestions(fromConversations.slice(0, 10));
    } finally {
      setSugLoading(false);
    }
  }, [conversations, user]);

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      setActiveIdx(-1);
      return;
    }
    setShowDrop(true);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buildSuggestions(search), 250);
    return () => clearTimeout(debounceRef.current);
  }, [search, buildSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDrop(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (person) => {
    if (person._isConnected || person._inConversation) {
      openChat(person);          // connected → open chat
    } else {
      navigate(`/people/${person._id}`);  // not connected → go to profile
    }
    setSearch('');
    setShowDrop(false);
    setActiveIdx(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showDrop || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  };

  // Filtered conversations (for the list below search, when search is empty)
  const filtered = conversations.filter((c) =>
    c.partner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 680, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>
          💬 Messages
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Chat with your connections in real-time.
        </p>
      </div>

      {/* ── Search + Autocomplete ─────────────────────── */}
      <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <HiOutlineSearch style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: search ? '#818cf8' : '#64748b', width: 18, height: 18, transition: 'color 0.2s',
          }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or start a new chat…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search.trim() && setShowDrop(true)}
            onKeyDown={handleKeyDown}
            className="input-field"
            style={{ paddingLeft: 44, paddingRight: search ? 40 : 16 }}
            autoComplete="off"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setShowDrop(false); inputRef.current?.focus(); }}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', display: 'flex', alignItems: 'center',
              }}
            >
              <HiOutlineX style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDrop && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'rgba(15,23,42,0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}>
            {sugLoading && suggestions.length === 0 ? (
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13 }}>
                <div style={{ width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Searching…
              </div>
            ) : suggestions.length === 0 ? (
              <div style={{ padding: '16px', color: '#64748b', fontSize: 13, textAlign: 'center' }}>
                No users found for "{search}"
              </div>
            ) : (
              suggestions.map((person, idx) => {
                const isActive      = idx === activeIdx;
                const isOnline      = onlineUsers.includes(String(person._id));
                const initials      = person.name?.charAt(0).toUpperCase();
                const hasConv       = person._inConversation;
                const isConnected   = person._isConnected || hasConv;

                return (
                  <button
                    key={person._id}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(person); }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 16px',
                      background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                      border: 'none',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {person.avatar ? (
                        <img src={person.avatar} alt={person.name}
                          style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', border: isActive ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent', transition: 'border 0.15s' }} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: 'linear-gradient(135deg,#6366f1,#34d399)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 17,
                          border: isActive ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
                        }}>
                          {initials}
                        </div>
                      )}
                      <span style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: 11, height: 11, borderRadius: '50%',
                        background: isOnline ? '#22c55e' : '#6b7280',
                        border: '2px solid #0f172a',
                      }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Highlight matching part of name */}
                      <HighlightName name={person.name} query={search} isActive={isActive} />
                      <p style={{ color: '#64748b', fontSize: 11, margin: 0, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {person.headline || person.college || (isOnline ? 'Active now' : 'Offline')}
                      </p>
                    </div>

                    {/* Action label */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                      color: isConnected
                        ? (isActive ? '#818cf8' : '#475569')
                        : '#f59e0b',
                    }}>
                      {isConnected
                        ? <><HiOutlineChatAlt2 style={{ width: 13, height: 13 }} />{hasConv ? 'Open chat' : 'Message'}</>
                        : <><HiOutlineUserAdd style={{ width: 13, height: 13 }} />Connect</>
                      }
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Conversation List ─────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card" style={{ borderRadius: 16, padding: '16px', display: 'flex', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1e293b' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, background: '#1e293b', borderRadius: 6, width: '38%', marginBottom: 10 }} />
                <div style={{ height: 11, background: '#1e293b', borderRadius: 6, width: '65%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && !search ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>No messages yet</p>
          <p style={{ color: '#64748b', fontSize: 14 }}>Connect with people and start chatting!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((conv) => {
            const isOnline = onlineUsers.includes(String(conv.partner?._id));
            const lastMsg  = conv.lastMessage;
            const isMe     = String(lastMsg?.sender?._id || lastMsg?.sender) === String(user?._id);
            const isSeen   = isMe && lastMsg?.read;
            const initials = conv.partner?.name?.charAt(0).toUpperCase();

            return (
              <button
                key={conv.conversationId}
                onClick={() => openChat(conv.partner)}
                className="glass-card"
                style={{
                  borderRadius: 16, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  border: isSeen
                    ? '1px solid rgba(129,140,248,0.15)'
                    : conv.unreadCount > 0
                      ? '1px solid rgba(99,102,241,0.2)'
                      : '1px solid rgba(148,163,184,0.08)',
                  background: conv.unreadCount > 0 ? 'rgba(99,102,241,0.06)' : 'rgba(30,41,59,0.4)',
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {conv.partner?.avatar ? (
                    <img src={conv.partner.avatar} alt={conv.partner.name}
                      style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg,#6366f1,#34d399)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 22,
                    }}>
                      {initials}
                    </div>
                  )}
                  <span style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 13, height: 13, borderRadius: '50%',
                    background: isOnline ? '#22c55e' : '#6b7280',
                    border: '2px solid #0f172a',
                  }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{
                      color: 'white', fontWeight: conv.unreadCount > 0 ? 700 : 600, fontSize: 14,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%',
                    }}>
                      {conv.partner?.name}
                    </span>
                    <span style={{ color: isSeen ? '#818cf8' : '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {lastMsg?.createdAt
                        ? new Date(lastMsg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                      {isMe && (
                        isSeen
                          ? <HiOutlineCheckCircle style={{ width: 13, height: 13, color: '#818cf8', flexShrink: 0 }} />
                          : <HiOutlineCheck style={{ width: 13, height: 13, color: '#475569', flexShrink: 0 }} />
                      )}
                      {isSeen ? (
                        <span style={{ fontSize: 12, color: '#818cf8', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'fadeInSeen 0.3s ease-out' }}>
                          <LiveSeenLabel seenAt={lastMsg?.seenAt} />
                        </span>
                      ) : (
                        <span style={{
                          color: conv.unreadCount > 0 ? '#a5b4fc' : '#64748b',
                          fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {isMe ? 'You: ' : ''}{lastMsg?.text || '…'}
                        </span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span style={{ background: '#6366f1', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Highlight matched portion of name ──────────────── */
const HighlightName = ({ name = '', query = '', isActive }) => {
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (!query || idx === -1) {
    return <p style={{ color: 'white', fontWeight: 600, fontSize: 13, margin: 0 }}>{name}</p>;
  }
  return (
    <p style={{ color: 'white', fontWeight: 600, fontSize: 13, margin: 0 }}>
      {name.slice(0, idx)}
      <span style={{ color: '#818cf8', background: 'rgba(129,140,248,0.15)', borderRadius: 3, padding: '0 1px' }}>
        {name.slice(idx, idx + query.length)}
      </span>
      {name.slice(idx + query.length)}
    </p>
  );
};

export default Messages;
