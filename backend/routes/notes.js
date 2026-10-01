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

const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const upload = multer({ storage: multer.memoryStorage() });

const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

// @route   POST /api/notes
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description, college, fileType } = req.body;
    let fileUrl = req.body.fileUrl;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    if (req.file) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return res.status(500).json({ message: 'Supabase storage is not configured on the server.' });
      }

      const supabaseBucket = process.env.SUPABASE_BUCKET || 'posts-media';
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `notes/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(supabaseBucket)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ message: `Error uploading file: ${error.message}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(fileName);

      fileUrl = publicUrlData.publicUrl;
    }

    const note = await prisma.note.create({
      data: {
        title,
        subject,
        description: description || '',
        college: college || req.user.college || '',
        fileUrl: fileUrl || '',
        fileType: fileType || (req.file ? 'pdf' : 'link'),
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
