const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to format user for frontend
const formatUser = (u) => {
  if (!u) return u;
  const formatted = { ...u, _id: u.id };
  if (formatted.connections) formatted.connections = formatted.connections.map(c => ({ ...c, _id: c.id }));
  if (formatted.followers) formatted.followers = formatted.followers.map(f => ({ ...f, _id: f.id }));
  if (formatted.joinedCommunities) formatted.joinedCommunities = formatted.joinedCommunities.map(c => ({ ...c, _id: c.id }));
  if (formatted.experiences) formatted.experiences = formatted.experiences.map(e => ({ ...e, _id: e.id }));
  if (formatted.projectsList) formatted.projectsList = formatted.projectsList.map(p => ({ ...p, _id: p.id }));
  if (formatted.achievements) formatted.achievements = formatted.achievements.map(a => ({ ...a, _id: a.id }));
  if (formatted.activities) formatted.activities = formatted.activities.map(a => ({ ...a, _id: a.id }));
  delete formatted.password;
  return formatted;
};

// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        joinedCommunities: { select: { id: true, name: true, icon: true, memberCount: true } },
        connections: { select: { id: true, name: true, headline: true, avatar: true, college: true, branch: true, year: true } },
        followers: { select: { id: true, name: true, headline: true, avatar: true, college: true, branch: true, year: true } },
        experiences: { orderBy: { startDate: 'desc' } },
        projectsList: { orderBy: { startDate: 'desc' } },
        achievements: { orderBy: { date: 'desc' } },
        activities: { orderBy: { date: 'desc' } }
      }
    });
    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/keys
// @desc    Store user's public and private key
router.post('/keys', protect, async (req, res) => {
  try {
    const { publicKey, privateKey } = req.body;
    if (!publicKey) return res.status(400).json({ message: 'Public key is required' });
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { publicKey, privateKey }
    });
    res.json({ message: 'Keys stored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/my-keys
// @desc    Get current user's stored keys (public and private)
router.get('/my-keys', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { publicKey: true, privateKey: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      publicKey: user.publicKey,
      privateKey: user.privateKey
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/public-key
// @desc    Get a user's public key
router.get('/:id/public-key', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { publicKey: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.publicKey) return res.status(404).json({ message: 'Public key not found' });
    
    res.json({ publicKey: user.publicKey });
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

    const { name, college, branch, year, bio, avatar, headline, skills, links, location, openToWork, complexSkills } = req.body;
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
    if (complexSkills !== undefined) updateFields.complexSkills = complexSkills;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateFields,
      include: {
        joinedCommunities: { select: { id: true, name: true, icon: true, memberCount: true } },
        connections: { select: { id: true, name: true, headline: true, avatar: true, college: true, branch: true, year: true } },
        followers: { select: { id: true, name: true, headline: true, avatar: true, college: true, branch: true, year: true } }
      }
    });

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
router.get('/search', protect, async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = { id: { not: req.user.id } };
    const searchString = q.trim();
    if (searchString) {
      where.OR = [
        { name: { contains: searchString, mode: 'insensitive' } },
        { college: { contains: searchString, mode: 'insensitive' } },
        { branch: { contains: searchString, mode: 'insensitive' } },
        { headline: { contains: searchString, mode: 'insensitive' } },
        { location: { contains: searchString, mode: 'insensitive' } },
        { skills: { has: searchString } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, avatar: true, headline: true, college: true, branch: true, year: true, skills: true, location: true, openToWork: true, createdAt: true,
          connections: { select: { id: true } },
          followers: { select: { id: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    const formattedUsers = users.map(u => {
      const formatted = { ...u, _id: u.id };
      formatted.connections = u.connections.map(c => c.id);
      formatted.followers = u.followers.map(f => f.id);
      return formatted;
    });

    res.json({ users: formattedUsers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────
//  CONNECTION REQUEST SYSTEM
// ──────────────────────────────────────────────────────────

// @route   GET /api/users/connection-requests
router.get('/connection-requests', protect, async (req, res) => {
  try {
    const [incoming, outgoing] = await Promise.all([
      prisma.connectionRequest.findMany({
        where: { toId: req.user.id, status: 'pending' },
        include: { from: { select: { id: true, name: true, avatar: true, headline: true, college: true } } }
      }),
      prisma.connectionRequest.findMany({
        where: { fromId: req.user.id, status: 'pending' },
        include: { to: { select: { id: true, name: true, avatar: true, headline: true, college: true } } }
      }),
    ]);
    
    // Format for frontend
    const formatReq = (r, field) => ({
      _id: r.id,
      from: field === 'from' ? { ...r.from, _id: r.from.id } : r.fromId,
      to: field === 'to' ? { ...r.to, _id: r.to.id } : r.toId,
      status: r.status,
      createdAt: r.createdAt
    });

    res.json({ 
      incoming: incoming.map(r => formatReq(r, 'from')), 
      outgoing: outgoing.map(r => formatReq(r, 'to')) 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/request
router.post('/:id/request', protect, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Cannot send request to yourself' });

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Check if already connected
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { connections: { select: { id: true } } }
    });
    if (me.connections.some(c => c.id === req.params.id))
      return res.status(400).json({ message: 'Already connected' });

    // Upsert request (ignore if already pending)
    const existing = await prisma.connectionRequest.findUnique({
      where: { fromId_toId: { fromId: req.user.id, toId: req.params.id } }
    });
    
    if (existing && existing.status === 'pending') {
      return res.status(400).json({ message: 'Request already sent' });
    }

    if (existing) {
      await prisma.connectionRequest.update({
        where: { id: existing.id },
        data: { status: 'pending' }
      });
    } else {
      await prisma.connectionRequest.create({ 
        data: { fromId: req.user.id, toId: req.params.id, status: 'pending' } 
      });
    }
    
    res.json({ message: 'Connection request sent!', status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/request
router.delete('/:id/request', protect, async (req, res) => {
  try {
    await prisma.connectionRequest.deleteMany({
      where: { fromId: req.user.id, toId: req.params.id, status: 'pending' }
    });
    res.json({ message: 'Request cancelled', status: 'none' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/accept
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const existing = await prisma.connectionRequest.findFirst({
      where: { fromId: req.params.id, toId: req.user.id, status: 'pending' }
    });
    
    if (!existing) return res.status(404).json({ message: 'Request not found' });

    await prisma.connectionRequest.update({
      where: { id: existing.id },
      data: { status: 'accepted' }
    });

    // Add to both users' connections and followers
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        connections: { connect: { id: req.params.id } },
        followers: { connect: { id: req.params.id } }
      }
    });
    
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        connections: { connect: { id: req.user.id } },
        followers: { connect: { id: req.user.id } }
      }
    });

    res.json({ message: 'Connection accepted!', status: 'accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/decline
router.post('/:id/decline', protect, async (req, res) => {
  try {
    const existing = await prisma.connectionRequest.findFirst({
      where: { fromId: req.params.id, toId: req.user.id, status: 'pending' }
    });
    
    if (existing) {
      await prisma.connectionRequest.update({
        where: { id: existing.id },
        data: { status: 'declined' }
      });
    }
    res.json({ message: 'Request declined', status: 'declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/connection
router.delete('/:id/connection', protect, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Cannot remove yourself' });

    // Remove from both sides
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        connections: { disconnect: { id: req.params.id } },
        followers: { disconnect: { id: req.params.id } }
      }
    });
    
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        connections: { disconnect: { id: req.user.id } },
        followers: { disconnect: { id: req.user.id } }
      }
    });

    // Clean up any accepted request record too
    await prisma.connectionRequest.deleteMany({
      where: {
        status: 'accepted',
        OR: [
          { fromId: req.user.id, toId: req.params.id },
          { fromId: req.params.id, toId: req.user.id },
        ]
      }
    });

    res.json({ message: 'Connection removed', connected: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/profile/experience
router.post('/profile/experience', protect, async (req, res) => {
  try {
    const exp = await prisma.experience.create({
      data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json(exp);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/profile/project
router.post('/profile/project', protect, async (req, res) => {
  try {
    const proj = await prisma.project.create({
      data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json(proj);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/profile/achievement
router.post('/profile/achievement', protect, async (req, res) => {
  try {
    const ach = await prisma.achievement.create({
      data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json(ach);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/profile/activity
router.post('/profile/activity', protect, async (req, res) => {
  try {
    const act = await prisma.activity.create({
      data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json(act);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id  (must come AFTER named routes)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        joinedCommunities: { select: { id: true, name: true, icon: true, memberCount: true } },
        connections: { select: { id: true, name: true, headline: true, avatar: true, college: true } },
        followers: { select: { id: true, name: true, headline: true, avatar: true, college: true } },
        experiences: { orderBy: { startDate: 'desc' } },
        projectsList: { orderBy: { startDate: 'desc' } },
        achievements: { orderBy: { date: 'desc' } },
        activities: { orderBy: { date: 'desc' } }
      }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/projects
router.post('/projects', protect, async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/projects/:id
router.put('/projects/:id', protect, async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/projects/:id
router.delete('/projects/:id', protect, async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/experiences
router.post('/experiences', protect, async (req, res) => {
  try {
    const experience = await prisma.experience.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/experiences/:id
router.put('/experiences/:id', protect, async (req, res) => {
  try {
    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/experiences/:id
router.delete('/experiences/:id', protect, async (req, res) => {
  try {
    await prisma.experience.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
