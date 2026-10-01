const express = require('express');
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configure multer (memory storage for Supabase upload)
const upload = multer({ storage: multer.memoryStorage() });

// Lazy initialization function for Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';
  
  console.log('--- SUPABASE DEBUG ---');
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('KEY:', supabaseKey ? 'Found' : 'Missing');
  console.log('BUCKET:', process.env.SUPABASE_BUCKET ? 'Found' : 'Missing');
  console.log('----------------------');

  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

const formatDoc = (doc) => {
  if (!doc) return null;
  const { id, _id, ...rest } = doc;
  return { id: id || _id, _id: id || _id, ...rest };
};

// @route   GET /api/posts
// @desc    Get all global posts (posts without communityId)
// @access  Public or Protected
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { communityId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(p => {
      const fp = formatDoc(p);
      fp.author = formatDoc(p.author);
      fp.comments = p.comments.map(c => {
        const fc = formatDoc(c);
        fc.author = formatDoc(c.author);
        return fc;
      });
      return fp;
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error('Error fetching global posts:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});


// @route   GET /api/posts/feed
// @desc    Get all global posts prioritized by connections
// @access  Private
router.get('/feed', protect, async (req, res) => {
  try {
    // Get user's connections
    const userWithConnections = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        connections: { select: { id: true } },
        connectedTo: { select: { id: true } }
      }
    });

    const connectionIds = new Set();
    if (userWithConnections) {
      userWithConnections.connections.forEach(c => connectionIds.add(c.id));
      userWithConnections.connectedTo.forEach(c => connectionIds.add(c.id));
    }

    const posts = await prisma.post.findMany({
      where: { communityId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format posts
    const formattedPosts = posts.map(p => {
      const fp = formatDoc(p);
      fp.author = formatDoc(p.author);
      fp.comments = p.comments.map(c => {
        const fc = formatDoc(c);
        fc.author = formatDoc(c.author);
        return fc;
      });
      return fp;
    });

    // Sort: connection's posts first, then the rest
    formattedPosts.sort((a, b) => {
      const aIsConn = connectionIds.has(a.author.id);
      const bIsConn = connectionIds.has(b.author.id);
      if (aIsConn && !bIsConn) return -1;
      if (!aIsConn && bIsConn) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error('Error fetching feed posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: req.params.userId, communityId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(p => {
      const fp = formatDoc(p);
      fp.author = formatDoc(p.author);
      fp.comments = p.comments.map(c => {
        const fc = formatDoc(c);
        fc.author = formatDoc(c.author);
        return fc;
      });
      return fp;
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a global post with optional media
// @access  Private
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { content } = req.body;
    let mediaUrl = null;
    let mediaType = null;

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Post content or media is required' });
    }

    if (req.file) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return res.status(500).json({ message: 'Supabase storage is not configured on the server. Please check environment variables.' });
      }

      const supabaseBucket = process.env.SUPABASE_BUCKET || 'posts-media';
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `post-media/${fileName}`;

      const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ message: `Error uploading file to storage: ${error.message || JSON.stringify(error)}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(filePath);

      mediaUrl = publicUrlData.publicUrl;
      mediaType = req.file.mimetype;
    }

    const post = await prisma.post.create({
      data: {
        content: content || '',
        authorId: req.user.id,
        mediaUrl,
        mediaType
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: true
      }
    });

    res.status(201).json(formatDoc(post));
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// Update a post (text only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to edit this post' });

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          }
        },
      }
    });

    res.json(formatDoc(updatedPost));
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// Delete a post
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete this post' });

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

module.exports = router;
