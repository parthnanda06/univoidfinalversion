const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder'
);

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, college, branch, year, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        college: college || '',
        branch: branch || '',
        year: year || '',
        role: role === 'hr' ? 'hr' : 'student',
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar || '',
        headline: user.headline || '',
        location: user.location || '',
        openToWork: user.openToWork || false,
        skills: user.skills || [],
        links: user.links || {},
        connections: [],
        followers: [],
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        connections: { select: { id: true } },
        followers: { select: { id: true } }
      }
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar || '',
        headline: user.headline || '',
        location: user.location || '',
        openToWork: user.openToWork || false,
        skills: user.skills || [],
        links: user.links || {},
        connections: user.connections.map(c => c.id),
        followers: user.followers.map(f => f.id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/oauth
// @desc    Authenticate user via Google OAuth
// @access  Public
router.post('/oauth', async (req, res) => {
  try {
    const { token, provider } = req.body;
    
    if (provider !== 'supabase') {
      return res.status(400).json({ message: 'Unsupported provider' });
    }

    // Verify Supabase Token
    const { data: { user: supaUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !supaUser) {
      console.error("DEBUG SUPABASE ERROR:", error);
      throw new Error('Invalid Supabase token');
    }
    
    const email = supaUser.email;
    const name = supaUser.user_metadata?.full_name || email.split('@')[0];
    const picture = supaUser.user_metadata?.avatar_url || '';
    const sub = supaUser.id;

    let user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        connections: { select: { id: true } },
        followers: { select: { id: true } }
      }
    });

    if (!user) {
      // Create new user if they don't exist
      user = await prisma.user.create({
        data: {
          name,
          email,
          avatar: picture || '',
          provider: 'google',
          providerId: sub,
        }
      });
      user.connections = [];
      user.followers = [];
    }

    const jwtToken = generateToken(user.id);

    res.json({
      token: jwtToken,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar || '',
        headline: user.headline || '',
        location: user.location || '',
        openToWork: user.openToWork || false,
        skills: user.skills || [],
        links: user.links || {},
        connections: user.connections ? user.connections.map(c => c.id) : [],
        followers: user.followers ? user.followers.map(f => f.id) : [],
      },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(401).json({ message: 'Invalid OAuth token' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        joinedCommunities: { select: { id: true, name: true, icon: true } },
        connections: { select: { id: true } },
        followers: { select: { id: true } }
      }
    });
    
    // Format for frontend compatibility
    const formattedUser = {
      ...user,
      _id: user.id,
      connections: user.connections.map(c => c.id),
      followers: user.followers.map(f => f.id)
    };
    delete formattedUser.password;
    
    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
