const express = require('express');
const { body, validationResult } = require('express-validator');
const Community = require('../models/Community');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/communities
// @desc    Get all communities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('createdBy', 'name')
      .sort({ memberCount: -1 });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id
// @desc    Get single community with posts
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members', 'name avatar');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities
// @desc    Create a community
// @access  Private
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Community name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, category, icon } = req.body;

    const existing = await Community.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'A community with this name already exists' });
    }

    const community = await Community.create({
      name,
      description: description || '',
      category: category || 'General',
      icon: icon || '💬',
      createdBy: req.user._id,
      members: [req.user._id],
      memberCount: 1,
    });

    // Add community to user's joined list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id },
    });

    await community.populate('createdBy', 'name');
    res.status(201).json(community);
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(m => m.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    community.members.push(req.user._id);
    community.memberCount = community.members.length;
    await community.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id },
    });

    res.json({ message: 'Joined community', memberCount: community.memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    community.members = community.members.filter(m => m.toString() !== req.user._id.toString());
    community.memberCount = community.members.length;
    await community.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedCommunities: community._id },
    });

    res.json({ message: 'Left community', memberCount: community.memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id/posts
// @desc    Get posts for a community
// @access  Public
router.get('/:id/posts', async (req, res) => {
  try {
    const posts = await Post.find({ community: req.params.id })
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
      .populate('comments.replies.author', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   POST /api/communities/:id/posts
// @desc    Create a post in a community
// @access  Private (members only)
router.post('/:id/posts', protect, [
  body('content').trim().notEmpty().withMessage('Post content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You must join the community to post' });
    }

    const post = await Post.create({
      content: req.body.content,
      community: req.params.id,
      author: req.user._id,
    });

    await post.populate('author', 'name avatar');
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/like
// @desc    Toggle like on a post
// @access  Private
router.post('/posts/:postId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(l => l.toString() === req.user._id.toString());
    if (alreadyLiked) {
      post.likes = post.likes.filter(l => l.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    post.likeCount = post.likes.length;
    await post.save();

    res.json({ likeCount: post.likeCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/posts/:postId/comment', protect, [
  body('text').trim().notEmpty().withMessage('Comment text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      text: req.body.text,
      author: req.user._id,
    });
    await post.save();

    await post.populate('comments.author', 'name avatar');
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comments/:commentId/like
// @desc    Toggle like on a comment
// @access  Private
router.post('/posts/:postId/comments/:commentId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const alreadyLiked = comment.likes.some(l => l.toString() === req.user._id.toString());
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(l => l.toString() !== req.user._id.toString());
    } else {
      comment.likes.push(req.user._id);
    }
    comment.likeCount = comment.likes.length;
    await post.save();

    res.json({ likeCount: comment.likeCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comments/:commentId/reply
// @desc    Add a reply to a comment
// @access  Private
router.post('/posts/:postId/comments/:commentId/reply', protect, [
  body('text').trim().notEmpty().withMessage('Reply text is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.replies.push({ text: req.body.text, author: req.user._id });
    await post.save();

    await post.populate('comments.replies.author', 'name avatar');
    const updatedComment = post.comments.id(req.params.commentId);
    const newReply = updatedComment.replies[updatedComment.replies.length - 1];
    res.status(201).json(newReply);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/posts/:postId/comments/:commentId/replies/:replyId/like
// @desc    Toggle like on a reply
// @access  Private
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const alreadyLiked = reply.likes.some(l => l.toString() === req.user._id.toString());
    if (alreadyLiked) {
      reply.likes = reply.likes.filter(l => l.toString() !== req.user._id.toString());
    } else {
      reply.likes.push(req.user._id);
    }
    reply.likeCount = reply.likes.length;
    await post.save();

    res.json({ likeCount: reply.likeCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

