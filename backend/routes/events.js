const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const formatDoc = (doc) => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};

router.get('/', async (req, res) => {
  try {
    const { upcoming } = req.query;
    const query = {};
    if (upcoming === 'true') query.date = { gte: new Date() };
    
    const events = await prisma.event.findMany({
      where: query,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { date: 'asc' }
    });
    
    const formatted = events.map(e => {
      const f = formatDoc(e);
      f.createdBy = formatDoc(e.createdBy);
      return f;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { createdBy: { select: { id: true, name: true } } }
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const f = formatDoc(event);
    f.createdBy = formatDoc(event.createdBy);
    res.json(f);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, adminOnly, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('date').notEmpty().withMessage('Date required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    
    const { title, description, date, endDate, location, link, category } = req.body;
    
    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location: location || 'Online',
        link: link || '',
        category: category || 'General',
        creatorId: req.user.id
      },
      include: { createdBy: { select: { id: true, name: true } } }
    });
    
    const f = formatDoc(event);
    f.createdBy = formatDoc(event.createdBy);
    res.status(201).json(f);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { registrations: { select: { id: true } } }
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const already = event.registrations.some(r => r.id === req.user.id);
    if (already) return res.status(400).json({ message: 'Already registered' });
    
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        registrations: { connect: { id: req.user.id } },
        registrationCount: { increment: 1 }
      }
    });
    
    res.json({ message: 'Registered', registrationCount: updated.registrationCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
