const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect: auth } = require('../middleware/auth');

// Generate a stable conversationId from two user IDs
const getConversationId = (id1, id2) => {
  return [String(id1), String(id2)].sort().join('_');
};

const formatDoc = (doc) => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};

// GET /api/chat/conversations — list all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group in memory
    const convos = {};
    messages.forEach(m => {
      if (!convos[m.conversationId]) {
        convos[m.conversationId] = {
          _id: m.conversationId,
          lastMessage: m,
          unreadCount: 0
        };
      }
      if (m.receiverId === userId && !m.read) {
        convos[m.conversationId].unreadCount++;
      }
    });

    const result = Object.values(convos);

    // Populate partner info
    const populated = await Promise.all(
      result.map(async (m) => {
        const partnerId = m.lastMessage.senderId === userId
          ? m.lastMessage.receiverId
          : m.lastMessage.senderId;
        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: { id: true, name: true, avatar: true, headline: true }
        });
        return { 
          conversationId: m._id, 
          partner: formatDoc(partner), 
          lastMessage: formatDoc(m.lastMessage), 
          unreadCount: m.unreadCount 
        };
      })
    );
    
    // Sort by latest message
    populated.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/chat/:userId — fetch messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const myId = req.user.id;
    const theirId = req.params.userId;

    // Verify they are connected
    const me = await prisma.user.findUnique({
      where: { id: myId },
      include: { connections: { select: { id: true } } }
    });
    if (!me.connections.some(c => c.id === theirId)) {
      return res.status(403).json({ message: 'You can only chat with connections' });
    }

    const conversationId = getConversationId(myId, theirId);
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { sender: { select: { id: true, name: true, avatar: true } } }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId, receiverId: myId, read: false },
      data: { read: true }
    });

    const formatted = messages.map(m => {
      const fm = formatDoc(m);
      fm.sender = formatDoc(m.sender);
      return fm;
    }).reverse();

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/chat/:userId — send a message (REST fallback)
router.post('/:userId', auth, async (req, res) => {
  try {
    const myId = req.user.id;
    const theirId = req.params.userId;
    const { encryptedText, iv, encryptedKeyForReceiver, encryptedKeyForSender } = req.body;

    if (!encryptedText) return res.status(400).json({ message: 'Message cannot be empty' });

    // Verify connection
    const me = await prisma.user.findUnique({
      where: { id: myId },
      include: { connections: { select: { id: true } } }
    });
    if (!me.connections.some(c => c.id === theirId)) {
      return res.status(403).json({ message: 'You can only chat with connections' });
    }

    const conversationId = getConversationId(myId, theirId);
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: myId,
        receiverId: theirId,
        encryptedText,
        iv,
        encryptedKeyForReceiver,
        encryptedKeyForSender,
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } }
    });

    const fm = formatDoc(message);
    fm.sender = formatDoc(message.sender);
    res.status(201).json(fm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.getConversationId = getConversationId;
