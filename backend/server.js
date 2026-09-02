const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');


dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Removed MongoDB connection

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let dashboardCache = { data: null, lastFetch: 0 };
const CACHE_TTL = 30000; // 30 seconds

// Dashboard feed endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    if (Date.now() - dashboardCache.lastFetch < CACHE_TTL && dashboardCache.data) {
      return res.json(dashboardCache.data);
    }

    const prisma = require('./prismaClient');

    const [latestNotes, recentPosts, upcomingEvents] = await Promise.all([
      prisma.note.findMany({
        include: { uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 6
      }),
      prisma.post.findMany({
        include: { 
          author: { select: { name: true, avatar: true } },
          community: { select: { name: true, icon: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      }),
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 6
      }),
    ]);

    dashboardCache = {
      data: { latestNotes, recentPosts, upcomingEvents },
      lastFetch: Date.now()
    };

    res.json(dashboardCache.data);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ─── Socket.IO Chat ───────────────────────────────────────────────────────────
const prisma = require('./prismaClient');
const { getConversationId } = require('./routes/chat');

// Map userId -> Set of socketIds (user may have multiple tabs)
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = String(decoded.id);
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;

  // Track online
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Broadcast updated online list (just IDs)
  io.emit('online_users', Array.from(onlineUsers.keys()));

  socket.on('join_conversation', (partnerId) => {
    const room = getConversationId(userId, partnerId);
    socket.join(room);
  });

  socket.on('leave_conversation', (partnerId) => {
    const room = getConversationId(userId, partnerId);
    socket.leave(room);
  });

  socket.on('send_message', async ({ receiverId, encryptedText, iv, encryptedKeyForReceiver, encryptedKeyForSender }) => {
    if (!encryptedText || !receiverId) return;

    try {
      // Verify connection
      const me = await prisma.user.findUnique({
        where: { id: userId },
        include: { connections: { select: { id: true } } }
      });
      
      const isConnected = me?.connections.some(c => c.id === receiverId);
      if (!isConnected) return;

      const conversationId = getConversationId(userId, receiverId);
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          receiverId,
          encryptedText,
          iv,
          encryptedKeyForReceiver,
          encryptedKeyForSender,
        },
        include: { sender: { select: { id: true, name: true, avatar: true } } }
      });

      const formattedMessage = {
        ...message,
        _id: message.id,
        sender: { ...message.sender, _id: message.sender.id },
      };

      // Emit to both users in the room
      io.to(conversationId).emit('new_message', formattedMessage);

      // Notify receiver even if not in the room (for notification badge)
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((sid) => {
          const s = io.sockets.sockets.get(sid);
          if (s && !s.rooms.has(conversationId)) {
            s.emit('message_notification', {
              senderId: userId,
              senderName: message.sender.name,
              // Send the encrypted payload so the client can decrypt it for the notification
              encryptedText,
              iv,
              encryptedKeyForReceiver,
              conversationId,
            });
          }
        });
      }
    } catch (err) {
      console.error('socket send_message error:', err);
    }
  });

  socket.on('typing', ({ receiverId, isTyping }) => {
    const room = getConversationId(userId, receiverId);
    socket.to(room).emit('typing', { senderId: userId, isTyping });
  });

  // Receiver marks a conversation as read → update DB + notify sender
  socket.on('mark_read', async ({ partnerId }) => {
    if (!partnerId) return;
    try {
      const conversationId = getConversationId(userId, partnerId);
      const seenAt = new Date();

      // Mark all unread messages sent by partnerId as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: partnerId,
          read: false
        },
        data: { read: true }
      });

      // Tell the sender their messages were seen
      const partnerSockets = onlineUsers.get(String(partnerId));
      if (partnerSockets) {
        partnerSockets.forEach((sid) => {
          io.to(sid).emit('messages_read', {
            conversationId,
            readerId: userId,
            seenAt: seenAt.toISOString(),
          });
        });
      }
    } catch (err) {
      console.error('mark_read error:', err);
    }
  });

  // ─── WebRTC Signaling ────────────────────────────────────────────────────────
  socket.on('call_user', ({ userToCall, signalData, from, name, avatar, isVideo }) => {
    const receiverSockets = onlineUsers.get(String(userToCall));
    if (receiverSockets) {
      receiverSockets.forEach(sid => {
        io.to(sid).emit('call_user', { signal: signalData, from, name, avatar, isVideo });
      });
    }
  });

  socket.on('answer_call', ({ to, signal }) => {
    const receiverSockets = onlineUsers.get(String(to));
    if (receiverSockets) {
      receiverSockets.forEach(sid => {
        io.to(sid).emit('call_accepted', signal);
      });
    }
  });

  socket.on('ice_candidate', ({ to, candidate }) => {
    const receiverSockets = onlineUsers.get(String(to));
    if (receiverSockets) {
      receiverSockets.forEach(sid => {
        io.to(sid).emit('ice_candidate', candidate);
      });
    }
  });

  socket.on('reject_call', ({ to }) => {
    const receiverSockets = onlineUsers.get(String(to));
    if (receiverSockets) {
      receiverSockets.forEach(sid => {
        io.to(sid).emit('call_rejected');
      });
    }
  });

  socket.on('end_call', ({ to }) => {
    const receiverSockets = onlineUsers.get(String(to));
    if (receiverSockets) {
      receiverSockets.forEach(sid => {
        io.to(sid).emit('call_ended');
      });
    }
  });


  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) onlineUsers.delete(userId);
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
