const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { upcoming } = req.query;
    const query = {};
    if (upcoming === 'true') query.date = { $gte: new Date() };
    const events = await Event.find(query).populate('createdBy', 'name').sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
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
    const event = await Event.create({ title, description: description || '', date, endDate: endDate || null, location: location || 'Online', link: link || '', category: category || 'General', createdBy: req.user._id });
    await event.populate('createdBy', 'name');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const already = event.registrations.some(r => r.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already registered' });
    event.registrations.push(req.user._id);
    event.registrationCount = event.registrations.length;
    await event.save();
    res.json({ message: 'Registered', registrationCount: event.registrationCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
