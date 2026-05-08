const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('joinedCommunities', 'name icon memberCount')
      .populate('connections', 'name headline avatar college branch year')
      .populate('followers', 'name headline avatar college branch year');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio too long'),
  body('headline').optional().isLength({ max: 120 }).withMessage('Headline too long'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, college, branch, year, bio, avatar, headline, skills, links, location, openToWork } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (college !== undefined) updateFields.college = college;
    if (branch !== undefined) updateFields.branch = branch;
    if (year !== undefined) updateFields.year = year;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (headline !== undefined) updateFields.headline = headline;
    if (skills !== undefined) updateFields.skills = skills.slice(0, 20);
    if (links !== undefined) updateFields.links = links;
    if (location !== undefined) updateFields.location = location;
    if (openToWork !== undefined) updateFields.openToWork = openToWork;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, runValidators: true })
      .populate('joinedCommunities', 'name icon memberCount')
      .populate('connections', 'name headline avatar college branch year')
      .populate('followers', 'name headline avatar college branch year');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
router.get('/search', protect, async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = q.trim()
      ? { _id: { $ne: req.user._id }, $or: [
          { name: { $regex: q, $options: 'i' } },
          { college: { $regex: q, $options: 'i' } },
          { branch: { $regex: q, $options: 'i' } },
          { headline: { $regex: q, $options: 'i' } },
          { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
          { location: { $regex: q, $options: 'i' } },
        ]}
      : { _id: { $ne: req.user._id } };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email avatar headline college branch year skills location openToWork connections followers createdAt')
        .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────
//  CONNECTION REQUEST SYSTEM
// ──────────────────────────────────────────────────────────

// @route   GET /api/users/connection-requests
// @desc    Get all pending requests FOR the current user (incoming) + requests sent BY them (outgoing)
router.get('/connection-requests', protect, async (req, res) => {
  try {
    const [incoming, outgoing] = await Promise.all([
      ConnectionRequest.find({ to: req.user._id, status: 'pending' })
        .populate('from', 'name avatar headline college'),
      ConnectionRequest.find({ from: req.user._id, status: 'pending' })
        .populate('to', 'name avatar headline college'),
    ]);
    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/request
// @desc    Send a connection request
router.post('/:id/request', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot send request to yourself' });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Check if already connected
    const me = await User.findById(req.user._id);
    if (me.connections.map(String).includes(req.params.id))
      return res.status(400).json({ message: 'Already connected' });

    // Upsert request (ignore if already pending)
    const existing = await ConnectionRequest.findOne({ from: req.user._id, to: req.params.id });
    if (existing) return res.status(400).json({ message: 'Request already sent' });

    await ConnectionRequest.create({ from: req.user._id, to: req.params.id });
    res.json({ message: 'Connection request sent!', status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/request
// @desc    Cancel a sent connection request
router.delete('/:id/request', protect, async (req, res) => {
  try {
    await ConnectionRequest.findOneAndDelete({ from: req.user._id, to: req.params.id, status: 'pending' });
    res.json({ message: 'Request cancelled', status: 'none' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/accept
// @desc    Accept an incoming connection request
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const request = await ConnectionRequest.findOneAndUpdate(
      { from: req.params.id, to: req.user._id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Add to both users' connections
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { connections: req.params.id, followers: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { connections: req.user._id, followers: req.user._id } });

    res.json({ message: 'Connection accepted!', status: 'accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/decline
// @desc    Decline an incoming connection request
router.post('/:id/decline', protect, async (req, res) => {
  try {
    await ConnectionRequest.findOneAndUpdate(
      { from: req.params.id, to: req.user._id, status: 'pending' },
      { status: 'declined' }
    );
    res.json({ message: 'Request declined', status: 'declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/connection
// @desc    Remove an existing mutual connection
router.delete('/:id/connection', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot remove yourself' });

    // Remove from both sides
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { connections: req.params.id, followers: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { connections: req.user._id, followers: req.user._id },
    });

    // Clean up any accepted request record too
    await ConnectionRequest.deleteMany({
      status: 'accepted',
      $or: [
        { from: req.user._id, to: req.params.id },
        { from: req.params.id, to: req.user._id },
      ],
    });

    res.json({ message: 'Connection removed', connected: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id  (must come AFTER named routes)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedCommunities', 'name icon memberCount')
      .populate('connections', 'name headline avatar college')
      .populate('followers', 'name headline avatar college');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
