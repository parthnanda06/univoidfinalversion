const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');

const router = express.Router();

const formatDoc = (doc) => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};

// @route   GET /api/notes
router.get('/', async (req, res) => {
  try {
    const { search, subject, college, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (subject) {
      query.subject = { contains: subject, mode: 'insensitive' };
    }
    if (college) {
      query.college = { contains: college, mode: 'insensitive' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: query,
        include: { uploadedBy: { select: { id: true, name: true, college: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.note.count({ where: query }),
    ]);
    
    const formatted = notes.map(n => {
      const fn = formatDoc(n);
      fn.uploadedBy = formatDoc(n.uploadedBy);
      return fn;
    });

    res.json({
      notes: formatted,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { uploadedBy: { select: { id: true, name: true, college: true } } }
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    const fn = formatDoc(note);
    fn.uploadedBy = formatDoc(note.uploadedBy);
    res.json(fn);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notes
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, subject, description, college, fileUrl, fileType } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        subject,
        description: description || '',
        college: college || req.user.college || '',
        fileUrl: fileUrl || '',
        fileType: fileType || 'link',
        uploaderId: req.user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true, college: true } } }
    });

    const fn = formatDoc(note);
    fn.uploadedBy = formatDoc(note.uploadedBy);

    res.status(201).json(fn);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.uploaderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id/download
router.put('/:id/download', async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: { downloads: { increment: 1 } }
    });
    
    res.json({ downloads: updated.downloads });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
