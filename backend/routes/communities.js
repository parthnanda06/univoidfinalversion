const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper for formatting
const formatDoc = (doc) => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};
const formatArr = (arr) => arr.map(formatDoc);

// @route   GET /api/communities
router.get('/', async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { memberCount: 'desc' }
    });
    
    const formatted = communities.map(c => {
      const f = formatDoc(c);
      f.createdBy = formatDoc(c.creator);
      delete f.creator;
      return f;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id
router.get('/:id', async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, name: true } },
        members: { select: { id: true, name: true, avatar: true } }
      }
    });
    if (!community) return res.status(404).json({ message: 'Community not found' });
    
    const f = formatDoc(community);
    f.createdBy = formatDoc(community.creator);
    f.members = formatArr(community.members);
    delete f.creator;
    res.json(f);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Community name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, description, category, icon } = req.body;

    const existing = await prisma.community.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (existing) return res.status(400).json({ message: 'A community with this name already exists' });

    const community = await prisma.community.create({
      data: {
        name,
        description: description || '',
        category: category || 'General',
        icon: icon || '💬',
        creatorId: req.user.id,
        members: { connect: { id: req.user.id } },
        memberCount: 1,
      },
      include: { creator: { select: { id: true, name: true } } }
    });

    const f = formatDoc(community);
    f.createdBy = formatDoc(community.creator);
    delete f.creator;
    res.status(201).json(f);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/join
router.post('/:id/join', protect, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: { members: { select: { id: true } } }
    });
    if (!community) return res.status(404).json({ message: 'Community not found' });

    if (community.members.some(m => m.id === req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    const updated = await prisma.community.update({
      where: { id: req.params.id },
      data: {
        members: { connect: { id: req.user.id } },
        memberCount: { increment: 1 }
      }
    });

    res.json({ message: 'Joined community', memberCount: updated.memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/leave
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: { members: { select: { id: true } } }
    });
    if (!community) return res.status(404).json({ message: 'Community not found' });

    if (!community.members.some(m => m.id === req.user.id)) {
       return res.status(400).json({ message: 'Not a member' });
    }

    const updated = await prisma.community.update({
      where: { id: req.params.id },
      data: {
        members: { disconnect: { id: req.user.id } },
        memberCount: { decrement: 1 }
      }
    });

    res.json({ message: 'Left community', memberCount: updated.memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id/posts
router.get('/:id/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { communityId: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            replies: { include: { author: { select: { id: true, name: true, avatar: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // format recursively
    const formattedPosts = posts.map(p => {
      const fp = formatDoc(p);
      fp.author = formatDoc(p.author);
      fp.comments = p.comments.map(c => {
        const fc = formatDoc(c);
        fc.author = formatDoc(c.author);
        fc.replies = c.replies.map(r => {
          const fr = formatDoc(r);
          fr.author = formatDoc(r.author);
          return fr;
        });
        return fc;
      });
      return fp;
    });

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/posts
router.post('/:id/posts', protect, [
  body('content').trim().notEmpty().withMessage('Post content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: { members: { select: { id: true } } }
    });
    if (!community) return res.status(404).json({ message: 'Community not found' });

    if (!community.members.some(m => m.id === req.user.id)) {
      return res.status(403).json({ message: 'You must join the community to post' });
    }

    const post = await prisma.post.create({
      data: {
        content: req.body.content,
        communityId: req.params.id,
        authorId: req.user.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });

    const fp = formatDoc(post);
    fp.author = formatDoc(post.author);
    fp.comments = [];
    res.status(201).json(fp);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/like
router.post('/posts/:postId/like', protect, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
      include: { likes: { select: { id: true } } }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.some(l => l.id === req.user.id);
    let updated;
    if (alreadyLiked) {
      updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          likes: { disconnect: { id: req.user.id } },
          likeCount: { decrement: 1 }
        }
      });
    } else {
      updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          likes: { connect: { id: req.user.id } },
          likeCount: { increment: 1 }
        }
      });
    }

    res.json({ likeCount: updated.likeCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comment
router.post('/posts/:postId/comment', protect, [
  body('text').trim().notEmpty().withMessage('Comment text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        text: req.body.text,
        postId: post.id,
        authorId: req.user.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });

    const fc = formatDoc(comment);
    fc.author = formatDoc(comment.author);
    fc.replies = [];
    res.status(201).json(fc);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comments/:commentId/like
router.post('/posts/:postId/comments/:commentId/like', protect, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.commentId },
      include: { likes: { select: { id: true } } }
    });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const alreadyLiked = comment.likes.some(l => l.id === req.user.id);
    let updated;
    if (alreadyLiked) {
      updated = await prisma.comment.update({
        where: { id: comment.id },
        data: {
          likes: { disconnect: { id: req.user.id } },
          likeCount: { decrement: 1 }
        }
      });
    } else {
      updated = await prisma.comment.update({
        where: { id: comment.id },
        data: {
          likes: { connect: { id: req.user.id } },
          likeCount: { increment: 1 }
        }
      });
    }

    res.json({ likeCount: updated.likeCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comments/:commentId/reply
router.post('/posts/:postId/comments/:commentId/reply', protect, [
  body('text').trim().notEmpty().withMessage('Reply text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = await prisma.reply.create({
      data: {
        text: req.body.text,
        commentId: comment.id,
        authorId: req.user.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });

    const fr = formatDoc(reply);
    fr.author = formatDoc(reply.author);
    res.status(201).json(fr);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comments/:commentId/replies/:replyId/like
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', protect, async (req, res) => {
  try {
    const reply = await prisma.reply.findUnique({
      where: { id: req.params.replyId },
      include: { likes: { select: { id: true } } }
    });
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const alreadyLiked = reply.likes.some(l => l.id === req.user.id);
    let updated;
    if (alreadyLiked) {
      updated = await prisma.reply.update({
        where: { id: reply.id },
        data: {
          likes: { disconnect: { id: req.user.id } },
          likeCount: { decrement: 1 }
        }
      });
    } else {
      updated = await prisma.reply.update({
        where: { id: reply.id },
        data: {
          likes: { connect: { id: req.user.id } },
          likeCount: { increment: 1 }
        }
      });
    }

    res.json({ likeCount: updated.likeCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
