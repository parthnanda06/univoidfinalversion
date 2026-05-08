const express = require('express');
const router  = express.Router();
const Job     = require('../models/Job');
const { protect } = require('../middleware/auth');

/* ── Middleware: HR only ────────────────────────────────── */
const hrOnly = (req, res, next) => {
  if (req.user.role !== 'hr' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only HR accounts can perform this action' });
  next();
};

/* ══════════════════════════════════════════════════════════
   PUBLIC / STUDENT ROUTES
═══════════════════════════════════════════════════════════ */

// GET /api/jobs — list all active jobs
router.get('/', protect, async (req, res) => {
  try {
    const { q = '', type = '', page = 1, limit = 20 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (q.trim()) {
      filter.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { company:     { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { skills:      { $elemMatch: { $regex: q, $options: 'i' } } },
        { location:    { $regex: q, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name avatar company headline')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(filter),
    ]);

    // Attach hasApplied flag and strip full applications array for privacy
    const userId = String(req.user._id);
    const jobsOut = jobs.map(j => {
      const obj = j.toObject();
      obj.hasApplied = j.applications.some(a => String(a.applicant) === userId);
      obj.applicantCount = j.applications.length;
      delete obj.applications;
      return obj;
    });

    res.json({ jobs: jobsOut, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/hr/posted — MUST be before /:id
router.get('/hr/posted', protect, hrOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    const withCounts = jobs.map(j => ({ ...j.toObject(), applicantCount: j.applications.length }));
    res.json(withCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs — HR posts a new job (before /:id)
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, company, location, type, description, requirements, skills, salary, deadline } = req.body;
    if (!title?.trim() || !company?.trim() || !description?.trim())
      return res.status(400).json({ message: 'Title, company, and description are required' });

    const job = await Job.create({
      title: title.trim(), company: company.trim(),
      location: location?.trim() || 'Remote',
      type: type || 'internship',
      description: description.trim(),
      requirements: requirements?.trim() || '',
      skills: Array.isArray(skills) ? skills.slice(0, 15) : [],
      salary: salary?.trim() || '',
      deadline: deadline || null,
      postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id — single job detail (students see it without applicant names)
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name avatar headline company');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Students: check if they've already applied
    const isHR = req.user.role === 'hr' || req.user.role === 'admin';
    if (isHR && String(job.postedBy._id) === String(req.user._id)) {
      // HR owner: populate applicants
      await job.populate('applications.applicant', 'name email avatar headline college branch year skills links');
      return res.json(job);
    }

    const hasApplied = job.applications.some(a => String(a.applicant) === String(req.user._id));
    const jobObj     = job.toObject();
    jobObj.hasApplied       = hasApplied;
    jobObj.applicantCount   = job.applications.length;
    delete jobObj.applications;  // students can't see who else applied
    return res.json(jobObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs/:id/apply — student applies to a job
router.post('/:id/apply', protect, async (req, res) => {
  try {
    if (req.user.role === 'hr')
      return res.status(403).json({ message: 'HR accounts cannot apply to jobs' });

    const job = await Job.findById(req.params.id);
    if (!job)          return res.status(404).json({ message: 'Job not found' });
    if (!job.isActive) return res.status(400).json({ message: 'This job is no longer accepting applications' });
    if (job.deadline && new Date() > new Date(job.deadline))
      return res.status(400).json({ message: 'Application deadline has passed' });

    const already = job.applications.find(a => String(a.applicant) === String(req.user._id));
    if (already) return res.status(400).json({ message: 'You have already applied to this job' });

    const { coverLetter = '', resumeLink = '' } = req.body;
    job.applications.push({ applicant: req.user._id, coverLetter, resumeLink });
    await job.save();

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id/apply — student withdraws application
router.delete('/:id/apply', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const before = job.applications.length;
    job.applications = job.applications.filter(a => String(a.applicant) !== String(req.user._id));
    if (job.applications.length === before)
      return res.status(400).json({ message: 'You have not applied to this job' });

    await job.save();
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// (hr/posted moved above /:id — see above)

// PUT /api/jobs/:id — HR edits a job
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });

    const allowed = ['title', 'company', 'location', 'type', 'description', 'requirements', 'skills', 'salary', 'deadline', 'isActive'];
    allowed.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id — HR deletes a job
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id/applicants — HR views all applicants for a job
router.get('/:id/applicants', protect, hrOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id })
      .populate('applications.applicant', 'name email avatar headline college branch year skills links openToWork connections');

    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
    res.json(job.applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/jobs/:id/applicants/:appId — HR updates application status
router.patch('/:id/applicants/:appId', protect, hrOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });

    const app = job.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    app.status = status;
    await job.save();
    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
