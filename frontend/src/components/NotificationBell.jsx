import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineBell, HiBell, HiOutlineUserAdd } from 'react-icons/hi';
import { HiChatBubbleLeftRight, HiDocumentText, HiXMark, HiCheck } from 'react-icons/hi2';
import { useNotifications } from '../context/NotificationContext';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead, clearAll, connectionRequests, handleAccept, handleDecline } = useNotifications();
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) markAllRead();
  };

  const goToCommunity = (communityId) => { navigate(`/communities/${communityId}`); setOpen(false); };

  const onAccept = async (fromId) => {
    setLoadingId(fromId + '_accept');
    await handleAccept(fromId);
    setLoadingId(null);
  };

  const onDecline = async (fromId) => {
    setLoadingId(fromId + '_decline');
    await handleDecline(fromId);
    setLoadingId(null);
  };

  const totalItems = connectionRequests.length + notifications.length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:bg-surface-800/60"
      >
        {unreadCount > 0 ? (
          <HiBell className="w-5 h-5 text-primary-400" />
        ) : (
          <HiOutlineBell className="w-5 h-5 text-surface-200 hover:text-white" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-[9px] font-bold text-white flex items-center justify-center leading-none animate-pulse-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl border border-white/8 overflow-hidden z-50"
          style={{
            background: 'rgba(15,23,42,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            animation: 'notifSlideDown 0.18s ease-out forwards',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <HiBell className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {totalItems > 0 && <span className="text-[10px] text-surface-700 font-normal">{totalItems}</span>}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[10px] text-surface-700 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-surface-800/50"
              >
                <HiXMark className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {totalItems === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-3">
                  <HiOutlineBell className="w-6 h-6 text-surface-700" />
                </div>
                <p className="text-sm font-medium text-surface-200">All caught up!</p>
                <p className="text-xs text-surface-700 mt-1">Connection requests and community updates appear here.</p>
              </div>
            ) : (
              <>
                {/* ── Connection Requests (top, most important) ── */}
                {connectionRequests.map((req) => {
                  const from = req.from;
                  const fromId = String(from._id || from);
                  return (
                    <Link
                      key={req._id}
                      to={`/people/${fromId}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer"
                    >
                      {/* Avatar */}
                      <div className="shrink-0">
                        {from.avatar ? (
                          <img src={from.avatar} alt={from.name} className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                            {from.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <HiOutlineUserAdd className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-primary-300">Connection Request</span>
                        </div>
                        <p className="text-[11px] text-surface-200 leading-relaxed">
                          <span className="text-white font-medium">{from.name}</span>
                          {from.headline && <span className="text-surface-400"> · {from.headline.slice(0, 30)}{from.headline.length > 30 ? '…' : ''}</span>}
                          {' wants to connect with you'}
                        </p>
                        <span className="text-[10px] text-surface-700 mt-0.5 block">{timeAgo(req.createdAt)}</span>

                        {/* Action buttons — stop propagation so they don't navigate */}
                        <div className="flex gap-2 mt-2" onClick={e => e.preventDefault()}>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAccept(fromId); }}
                            disabled={loadingId !== null}
                            className="flex items-center gap-1 text-[11px] font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30 px-3 py-1 rounded-lg transition-all duration-200 disabled:opacity-50"
                          >
                            {loadingId === fromId + '_accept'
                              ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : <HiCheck className="w-3.5 h-3.5" />
                            }
                            Accept
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDecline(fromId); }}
                            disabled={loadingId !== null}
                            className="flex items-center gap-1 text-[11px] font-semibold bg-surface-700 text-surface-200 hover:bg-red-500/20 hover:text-red-400 px-3 py-1 rounded-lg transition-all duration-200 disabled:opacity-50"
                          >
                            {loadingId === fromId + '_decline'
                              ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : <HiXMark className="w-3.5 h-3.5" />
                            }
                            Decline
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* ── Community notifications ── */}
                {notifications.map((notif, i) => (
                  <button
                    key={notif._id}
                    onClick={() => goToCommunity(notif.communityId)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-surface-800/40 transition-colors border-b border-white/[0.03] last:border-0"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center text-base shrink-0 mt-0.5">
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-white truncate">{notif.title}</span>
                        {notif.type === 'comment'
                          ? <HiChatBubbleLeftRight className="w-3 h-3 text-accent-400 shrink-0" />
                          : <HiDocumentText className="w-3 h-3 text-primary-400 shrink-0" />
                        }
                      </div>
                      <p className="text-[11px] text-surface-200 line-clamp-2 leading-relaxed">
                        <span className="text-white font-medium">{notif.author}: </span>
                        {notif.body}
                      </p>
                      <span className="text-[10px] text-surface-700 mt-0.5 block">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/5 text-center">
              <button
                onClick={() => { navigate('/communities'); setOpen(false); }}
                className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors"
              >
                View all communities →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
