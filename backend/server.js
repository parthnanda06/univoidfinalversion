const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/events', require('./routes/events'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard feed endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const Note = require('./models/Note');
    const Post = require('./models/Post');
    const Event = require('./models/Event');

    const [latestNotes, recentPosts, upcomingEvents] = await Promise.all([
      Note.find().populate('uploadedBy', 'name').sort({ createdAt: -1 }).limit(6),
      Post.find().populate('author', 'name avatar').populate('community', 'name icon').sort({ createdAt: -1 }).limit(6),
      Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(6),
    ]);

    res.json({ latestNotes, recentPosts, upcomingEvents });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ─── Socket.IO Chat ───────────────────────────────────────────────────────────
const Message = require('./models/Message');
const User = require('./models/User');
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

  socket.on('send_message', async ({ receiverId, text }) => {
    if (!text?.trim() || !receiverId) return;

    try {
      // Verify connection
      const me = await User.findById(userId);
      if (!me?.connections?.map(String).includes(receiverId)) return;

      const conversationId = getConversationId(userId, receiverId);
      const message = await Message.create({
        conversationId,
        sender: userId,
        receiver: receiverId,
        text: text.trim(),
      });
      const populated = await message.populate('sender', 'name avatar');

      // Emit to both users in the room
      io.to(conversationId).emit('new_message', populated);

      // Notify receiver even if not in the room (for notification badge)
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((sid) => {
          const s = io.sockets.sockets.get(sid);
          if (s && !s.rooms.has(conversationId)) {
            s.emit('message_notification', {
              senderId: userId,
              senderName: populated.sender.name,
              text: text.trim(),
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
      await Message.updateMany(
        { conversationId, sender: partnerId, read: false },
        { read: true }
      );

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
