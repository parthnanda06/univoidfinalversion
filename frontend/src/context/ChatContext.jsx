import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import API from '../services/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  // Chat state
  const [openChats, setOpenChats] = useState([]); // [{partner, messages, unread}]
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [notifications, setNotifications] = useState([]); // incoming message notifications

  // Connect socket when user logs in
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = localStorage.getItem('univoid_token');
    const socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('online_users', (ids) => setOnlineUsers(ids));

    socket.on('new_message', (msg) => {
      setOpenChats((prev) =>
        prev.map((chat) => {
          if (String(chat.partner._id) === String(msg.sender._id) ||
              String(chat.partner._id) === String(msg.receiver)) {
            return { ...chat, messages: [...chat.messages, msg] };
          }
          return chat;
        })
      );
    });

    socket.on('message_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev.slice(0, 9)]);
      setUnreadTotal((n) => n + 1);
    });

    socket.on('typing', ({ senderId, isTyping }) => {
      setOpenChats((prev) =>
        prev.map((chat) =>
          String(chat.partner._id) === senderId ? { ...chat, isTyping } : chat
        )
      );
    });

    // Partner read our messages → mark them as read in state with seenAt
    socket.on('messages_read', ({ conversationId, seenAt }) => {
      // Update open chat windows
      setOpenChats((prev) =>
        prev.map((chat) => {
          const chatConvId = [String(user._id), String(chat.partner._id)].sort().join('_');
          if (chatConvId !== conversationId) return chat;
          return {
            ...chat,
            messages: chat.messages.map((m) =>
              !m.read ? { ...m, read: true, seenAt } : m
            ),
            lastSeenAt: seenAt,
          };
        })
      );
      // Also update the conversations inbox list so the seen label appears there too
      setConversations((prev) =>
        prev.map((conv) => {
          const convId = [String(user._id), String(conv.partner?._id)].sort().join('_');
          if (convId !== conversationId) return conv;
          return {
            ...conv,
            lastMessage: conv.lastMessage
              ? { ...conv.lastMessage, read: true, seenAt }
              : conv.lastMessage,
          };
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/chat/conversations');
      setConversations(data);
      setUnreadTotal(data.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Open a chat with a user
  const openChat = useCallback(async (partner) => {
    // Bring to front if already open
    setOpenChats((prev) => {
      const exists = prev.find((c) => String(c.partner._id) === String(partner._id));
      if (exists) {
        return prev.map((c) =>
          String(c.partner._id) === String(partner._id) ? { ...c, minimized: false } : c
        );
      }
      // Max 3 concurrent open chats
      const updated = prev.length >= 3 ? prev.slice(1) : prev;
      return [...updated, { partner, messages: [], isLoading: true, minimized: false, isTyping: false }];
    });

    // Join socket room
    socketRef.current?.emit('join_conversation', String(partner._id));

    // Fetch history
    try {
      const { data } = await API.get(`/chat/${partner._id}`);
      setOpenChats((prev) =>
        prev.map((c) =>
          String(c.partner._id) === String(partner._id)
            ? { ...c, messages: data, isLoading: false }
            : c
        )
      );
      // Mark as read in unread count
      setUnreadTotal((n) => Math.max(0, n - (conversations.find(c => String(c.partner?._id) === String(partner._id))?.unreadCount || 0)));
      // Tell the backend (and sender) that we've read the messages
      socketRef.current?.emit('mark_read', { partnerId: String(partner._id) });
    } catch {
      setOpenChats((prev) =>
        prev.map((c) =>
          String(c.partner._id) === String(partner._id)
            ? { ...c, isLoading: false }
            : c
        )
      );
    }
  }, [conversations]);

  // Close a chat window
  const closeChat = useCallback((partnerId) => {
    socketRef.current?.emit('leave_conversation', String(partnerId));
    setOpenChats((prev) => prev.filter((c) => String(c.partner._id) !== String(partnerId)));
  }, []);

  // Toggle minimize
  const toggleMinimize = useCallback((partnerId) => {
    setOpenChats((prev) =>
      prev.map((c) =>
        String(c.partner._id) === String(partnerId) ? { ...c, minimized: !c.minimized } : c
      )
    );
  }, []);

  // Send a message
  const sendMessage = useCallback((partnerId, text) => {
    if (!text?.trim()) return;
    socketRef.current?.emit('send_message', { receiverId: String(partnerId), text });
  }, []);

  // Emit typing
  const emitTyping = useCallback((partnerId, isTyping) => {
    socketRef.current?.emit('typing', { receiverId: String(partnerId), isTyping });
  }, []);

  // Manually emit mark_read (e.g. when user focuses/scrolls to bottom)
  const emitMarkRead = useCallback((partnerId) => {
    socketRef.current?.emit('mark_read', { partnerId: String(partnerId) });
  }, []);

  const clearNotifications = () => setNotifications([]);

  return (
    <ChatContext.Provider value={{
      openChats,
      conversations,
      onlineUsers,
      unreadTotal,
      notifications,
      openChat,
      closeChat,
      toggleMinimize,
      sendMessage,
      emitTyping,
      emitMarkRead,
      loadConversations,
      clearNotifications,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
