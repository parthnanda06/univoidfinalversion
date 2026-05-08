const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');

// Generate a stable conversationId from two user IDs
const getConversationId = (id1, id2) => {
  return [String(id1), String(id2)].sort().join('_');
};

// GET /api/chat/conversations — list all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id; // Already an ObjectId from auth middleware
    const mongoose = require('mongoose');

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$read', false] }, { $eq: ['$receiver', userId] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate partner info
    const populated = await Promise.all(
      messages.map(async (m) => {
        const partnerId = String(m.lastMessage.sender) === String(userId)
          ? m.lastMessage.receiver
          : m.lastMessage.sender;
        const partner = await User.findById(partnerId).select('name avatar headline');
        return { conversationId: m._id, partner, lastMessage: m.lastMessage, unreadCount: m.unreadCount };
      })
    );

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
    const me = await User.findById(myId);
    if (!me.connections.map(String).includes(theirId)) {
      return res.status(403).json({ message: 'You can only chat with connections' });
    }

    const conversationId = getConversationId(myId, theirId);
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name avatar')
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: myId, read: false },
      { read: true }
    );

    res.json(messages.reverse());
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
    const { text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    // Verify connection
    const me = await User.findById(myId);
    if (!me.connections.map(String).includes(theirId)) {
      return res.status(403).json({ message: 'You can only chat with connections' });
    }

    const conversationId = getConversationId(myId, theirId);
    const message = await Message.create({
      conversationId,
      sender: myId,
      receiver: theirId,
      text: text.trim(),
    });

    const populated = await message.populate('sender', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.getConversationId = getConversationId;
