import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import API from '../services/api';
import { encryptMessage, decryptMessage, getStoredPrivateKey } from '../services/crypto';

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

  // WebRTC Call State
  const [incomingCall, setIncomingCall] = useState(null); // { from, name, avatar, signal, isVideo }
  const [activeCall, setActiveCallState] = useState(null); // { partnerId, name, avatar, isVideo, isCaller }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  
  const peerConnectionRef = useRef(null);
  const activeCallRef = useRef(null);
  const callAcceptedRef = useRef(false);
  const iceCandidateQueueRef = useRef([]);

  const setActiveCall = (call) => {
    activeCallRef.current = call;
    setActiveCallState(call);
  };

  // Helper to decrypt a single message object
  const decryptPayload = async (msg, currentUserId) => {
    if (!msg.encryptedText) return msg; // Fallback for plain text or already decrypted

    const privateKey = await getStoredPrivateKey(currentUserId);
    if (!privateKey) {
      return { ...msg, text: 'Waiting for this message (Missing Private Key).' };
    }

    const senderId = msg.sender?._id || msg.sender || msg.senderId;
    const isSender = String(senderId) === String(currentUserId);
    const encryptedKey = isSender ? msg.encryptedKeyForSender : msg.encryptedKeyForReceiver;

    const decryptedText = await decryptMessage(
      msg.encryptedText,
      msg.iv,
      encryptedKey,
      privateKey
    );

    if (decryptedText === null) {
      return { ...msg, text: 'Decryption failed.' };
    }
    return { ...msg, text: decryptedText };
  };

  // Connect socket when user logs in
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = localStorage.getItem('univoid_token');
    const socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : 'https://univoid-backend.onrender.com';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('online_users', (ids) => setOnlineUsers(ids));

    socket.on('new_message', async (rawMsg) => {
      const msg = await decryptPayload(rawMsg, user._id);
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

    socket.on('message_notification', async (rawNotif) => {
      const notif = await decryptPayload(rawNotif, user._id);
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

    // ─── WebRTC Socket Listeners ───
    socket.on('call_user', ({ signal, from, name, avatar, isVideo }) => {
      setIncomingCall({ from, name, avatar, signal, isVideo });
    });

    socket.on('call_accepted', async (signal) => {
      setCallAccepted(true);
      setCallStartTime(Date.now());
      callAcceptedRef.current = true;
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        // Process queued ICE candidates
        while (iceCandidateQueueRef.current.length > 0) {
          const candidate = iceCandidateQueueRef.current.shift();
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) { console.error('Error adding queued ICE candidate', e); }
        }
      }
    });

    socket.on('ice_candidate', async (candidate) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      } else {
        iceCandidateQueueRef.current.push(candidate);
      }
    });

    socket.on('call_rejected', () => {
      const call = activeCallRef.current;
      if (call && call.isCaller && !callAcceptedRef.current) {
         sendMessage(call.partnerId, `☎️ Missed ${call.isVideo ? 'video' : 'voice'} call`);
      }
      cleanupCall();
      alert('Call was rejected or unanswered');
    });

    socket.on('call_ended', () => {
      cleanupCall();
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
      const decryptedConversations = await Promise.all(
        data.map(async (conv) => {
          if (conv.lastMessage) {
            conv.lastMessage = await decryptPayload(conv.lastMessage, user._id);
          }
          return conv;
        })
      );
      setConversations(decryptedConversations);
      setUnreadTotal(decryptedConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
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
      const decryptedMessages = await Promise.all(
        data.map(msg => decryptPayload(msg, user._id))
      );

      setOpenChats((prev) =>
        prev.map((c) =>
          String(c.partner._id) === String(partner._id)
            ? { ...c, messages: decryptedMessages, isLoading: false }
            : c
        )
      );
      // Mark as read in unread count
      setUnreadTotal((n) => Math.max(0, n - (conversations.find(c => String(c.partner?._id) === String(partner._id))?.unreadCount || 0)));
      // Tell the backend (and sender) that we've read the messages
      socketRef.current?.emit('mark_read', { partnerId: String(partner._id) });
    } catch (err) {
      console.error(err);
      setOpenChats((prev) =>
        prev.map((c) =>
          String(c.partner._id) === String(partner._id)
            ? { ...c, isLoading: false }
            : c
        )
      );
    }
  }, [conversations, user]);

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
  const sendMessage = useCallback(async (partnerId, text) => {
    if (!text?.trim()) return;
    try {
      // Get public keys
      const [receiverRes, senderRes] = await Promise.all([
        API.get(`/users/${partnerId}/public-key`),
        API.get(`/users/${user._id}/public-key`)
      ]);
      const receiverPubKey = receiverRes.data.publicKey;
      const senderPubKey = senderRes.data.publicKey;

      if (!receiverPubKey || !senderPubKey) {
        throw new Error('Public keys not found');
      }

      const payload = await encryptMessage(text, receiverPubKey, senderPubKey);
      
      socketRef.current?.emit('send_message', { receiverId: String(partnerId), ...payload });
    } catch (err) {
      console.error('Failed to encrypt and send message:', err);
      if (err.response?.status === 404 || err.message === 'Public keys not found') {
        alert("Cannot send message: This user hasn't logged in since E2EE was enabled, so they don't have a public key yet.");
      } else {
        alert("Failed to send encrypted message. Please try again.");
      }
    }
  }, [user]);

  // Emit typing
  const emitTyping = useCallback((partnerId, isTyping) => {
    socketRef.current?.emit('typing', { receiverId: String(partnerId), isTyping });
  }, []);

  // Manually emit mark_read (e.g. when user focuses/scrolls to bottom)
  const emitMarkRead = useCallback((partnerId) => {
    socketRef.current?.emit('mark_read', { partnerId: String(partnerId) });
  }, []);

  const clearNotifications = () => setNotifications([]);

  // ─── WebRTC Functions ───
  const createPeerConnection = (partnerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice_candidate', { to: partnerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async (partner, isVideo) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
      setLocalStream(stream);
      setActiveCall({ partnerId: partner._id, name: partner.name, avatar: partner.avatar, isVideo, isCaller: true });
      
      const pc = createPeerConnection(partner._id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('call_user', {
        userToCall: partner._id,
        signalData: offer,
        from: user._id,
        name: user.name,
        avatar: user.avatar,
        isVideo
      });
    } catch (err) {
      console.error('Failed to start call', err);
      alert('Could not access camera/microphone');
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.isVideo, audio: true });
      
      setCallAccepted(true);
      setCallStartTime(Date.now());
      callAcceptedRef.current = true;
      setLocalStream(stream);
      setActiveCall({ partnerId: incomingCall.from, name: incomingCall.name, avatar: incomingCall.avatar, isVideo: incomingCall.isVideo, isCaller: false });
      
      const pc = createPeerConnection(incomingCall.from);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      
      // Process queued ICE candidates
      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) { console.error(e); }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit('answer_call', { to: incomingCall.from, signal: answer });
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to accept call', err);
      alert('Could not access camera/microphone. Please allow permissions in your browser settings.');
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socketRef.current?.emit('reject_call', { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (activeCallRef.current) {
      socketRef.current?.emit('end_call', { to: activeCallRef.current.partnerId });
      // If caller hangs up before accepted, it's a missed call
      if (activeCallRef.current.isCaller && !callAcceptedRef.current) {
         sendMessage(activeCallRef.current.partnerId, `☎️ Missed ${activeCallRef.current.isVideo ? 'video' : 'voice'} call`);
      }
    } else if (incomingCall) {
      rejectCall();
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setCallAccepted(false);
    setCallStartTime(null);
    callAcceptedRef.current = false;
    iceCandidateQueueRef.current = [];
  };

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
      // WebRTC Exports
      incomingCall,
      activeCall,
      localStream,
      remoteStream,
      callAccepted,
      callStartTime,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
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
