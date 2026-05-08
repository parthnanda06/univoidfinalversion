import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCommunities, getCommunityPosts, getConnectionRequests, acceptConnectionRequest, declineConnectionRequest } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const STORAGE_KEY = 'univoid_notifications';
const SEEN_KEY = 'univoid_notifications_seen_at';

const loadStored = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

const saveStored = (notifs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50)));
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(loadStored);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionRequests, setConnectionRequests] = useState([]); // incoming pending
  const [lastSeenAt, setLastSeenAt] = useState(
    () => localStorage.getItem(SEEN_KEY) || new Date(0).toISOString()
  );

  // Recalculate unread: community notifs + connection requests
  useEffect(() => {
    const communityUnread = notifications.filter(n => new Date(n.createdAt) > new Date(lastSeenAt)).length;
    setUnreadCount(communityUnread + connectionRequests.length);
  }, [notifications, lastSeenAt, connectionRequests]);

  // Poll for new posts across joined communities every 30 seconds
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data: communities } = await getCommunities();
      const joined = communities.filter(c =>
        c.members?.some(m => (m._id || m) === user._id)
      );

      const stored = loadStored();
      const storedIds = new Set(stored.map(n => n._id));
      const newNotifs = [];

      await Promise.all(
        joined.map(async (community) => {
          try {
            const { data: posts } = await getCommunityPosts(community._id);
            posts.forEach(post => {
              // New post notification (not by the current user)
              if (!storedIds.has(post._id) && (post.author?._id || post.author) !== user._id) {
                newNotifs.push({
                  _id: post._id,
                  type: 'post',
                  title: `New post in ${community.name}`,
                  body: post.content?.slice(0, 80) + (post.content?.length > 80 ? '…' : ''),
                  author: post.author?.name || 'Someone',
                  communityId: community._id,
                  communityName: community.name,
                  createdAt: post.createdAt,
                  icon: community.icon || '💬',
                });
              }

              // New comment notifications
              (post.comments || []).forEach((c, idx) => {
                const commentId = `${post._id}-c${idx}`;
                if (!storedIds.has(commentId) && (c.author?._id || c.author) !== user._id) {
                  newNotifs.push({
                    _id: commentId,
                    type: 'comment',
                    title: `New comment in ${community.name}`,
                    body: c.text?.slice(0, 80) + (c.text?.length > 80 ? '…' : ''),
                    author: c.author?.name || 'Someone',
                    communityId: community._id,
                    communityName: community.name,
                    createdAt: c.createdAt || post.createdAt,
                    icon: community.icon || '💬',
                  });
                }
              });
            });
          } catch { /* skip failed community */ }
        })
      );

      if (newNotifs.length > 0) {
        const merged = [...newNotifs, ...stored];
        saveStored(merged);
        setNotifications(merged);
      }
    } catch { /* network error – silent */ }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Poll connection requests every 30s
  const fetchConnectionRequests = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await getConnectionRequests();
      setConnectionRequests(data.incoming || []);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchConnectionRequests();
    const interval = setInterval(fetchConnectionRequests, 30_000);
    return () => clearInterval(interval);
  }, [user, fetchConnectionRequests]);

  const handleAccept = async (fromId) => {
    try {
      await acceptConnectionRequest(fromId);
      setConnectionRequests(prev => prev.filter(r => String(r.from._id || r.from) !== String(fromId)));
    } catch { /* silent */ }
  };

  const handleDecline = async (fromId) => {
    try {
      await declineConnectionRequest(fromId);
      setConnectionRequests(prev => prev.filter(r => String(r.from._id || r.from) !== String(fromId)));
    } catch { /* silent */ }
  };

  const markAllRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem(SEEN_KEY, now);
    setLastSeenAt(now);
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    saveStored([]);
    const now = new Date().toISOString();
    localStorage.setItem(SEEN_KEY, now);
    setLastSeenAt(now);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, markAllRead, clearAll,
      connectionRequests, handleAccept, handleDecline,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
