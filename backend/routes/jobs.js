const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { protect } = require('../middleware/auth');

/* ── Middleware: HR only ────────────────────────────────── */
const hrOnly = (req, res, next) => {
  if (req.user.role !== 'hr' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only HR accounts can perform this action' });
  next();
};

const formatDoc = (doc) => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};

/* ══════════════════════════════════════════════════════════
   PUBLIC / STUDENT ROUTES
═══════════════════════════════════════════════════════════ */

// GET /api/jobs — list all active jobs
router.get('/', protect, async (req, res) => {
  try {
    const { q = '', type = '', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isActive: true };

    if (type) filter.type = type;
    const searchString = q.trim();
    if (searchString) {
      filter.OR = [
        { title: { contains: searchString, mode: 'insensitive' } },
        { company: { contains: searchString, mode: 'insensitive' } },
        { description: { contains: searchString, mode: 'insensitive' } },
        { location: { contains: searchString, mode: 'insensitive' } },
        { skills: { has: searchString } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: filter,
        include: { 
          postedBy: { select: { id: true, name: true, avatar: true, headline: true } },
          applications: { select: { applicantId: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.job.count({ where: filter }),
    ]);

    const userId = req.user.id;
    const jobsOut = jobs.map(j => {
      const obj = formatDoc(j);
      obj.postedBy = formatDoc(j.postedBy);
      obj.hasApplied = j.applications.some(a => a.applicantId === userId);
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
    const jobs = await prisma.job.findMany({
      where: { posterId: req.user.id },
      include: { applications: { select: { id: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const withCounts = jobs.map(j => {
      const obj = formatDoc(j);
      obj.applicantCount = j.applications.length;
      delete obj.applications;
      return obj;
    });
    res.json(withCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs — HR posts a new job
router.post('/', protect, hrOnly, async (req, res) => {
  try {
    const { title, company, location, type, description, requirements, skills, salary, deadline } = req.body;
    if (!title?.trim() || !company?.trim() || !description?.trim())
      return res.status(400).json({ message: 'Title, company, and description are required' });

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        location: location?.trim() || 'Remote',
        type: type || 'internship',
        description: description.trim(),
        requirements: requirements?.trim() || '',
        skills: Array.isArray(skills) ? skills.slice(0, 15) : [],
        salary: salary?.trim() || '',
        deadline: deadline ? new Date(deadline) : null,
        posterId: req.user.id,
      }
    });
    res.status(201).json(formatDoc(job));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id — single job detail
router.get('/:id', protect, async (req, res) => {
  try {
    const isHR = req.user.role === 'hr' || req.user.role === 'admin';
    
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        postedBy: { select: { id: true, name: true, avatar: true, headline: true } },
        applications: isHR ? {
          include: { applicant: { select: { id: true, name: true, email: true, avatar: true, headline: true, college: true, branch: true, year: true, skills: true, links: true } } }
        } : { select: { applicantId: true } }
      }
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const jobObj = formatDoc(job);
    jobObj.postedBy = formatDoc(job.postedBy);

    if (isHR && job.posterId === req.user.id) {
      jobObj.applications = job.applications.map(a => {
        const fa = formatDoc(a);
        fa.applicant = formatDoc(a.applicant);
        return fa;
      });
      return res.json(jobObj);
    }

    jobObj.hasApplied = job.applications.some(a => a.applicantId === req.user.id);
    jobObj.applicantCount = job.applications.length;
    delete jobObj.applications;
    
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

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { applications: { select: { applicantId: true } } }
    });
    
    if (!job)          return res.status(404).json({ message: 'Job not found' });
    if (!job.isActive) return res.status(400).json({ message: 'This job is no longer accepting applications' });
    if (job.deadline && new Date() > new Date(job.deadline))
      return res.status(400).json({ message: 'Application deadline has passed' });

    if (job.applications.some(a => a.applicantId === req.user.id)) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const { coverLetter = '', resumeLink = '' } = req.body;
    
    await prisma.application.create({
      data: {
        jobId: job.id,
        applicantId: req.user.id,
        coverLetter,
        resumeLink
      }
    });

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id/apply — student withdraws application
router.delete('/:id/apply', protect, async (req, res) => {
  try {
    const app = await prisma.application.findFirst({
      where: { jobId: req.params.id, applicantId: req.user.id }
    });
    
    if (!app) return res.status(400).json({ message: 'You have not applied to this job' });
    
    await prisma.application.delete({ where: { id: app.id } });

    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/jobs/:id — HR edits a job
router.put('/:id', protect, hrOnly, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, posterId: req.user.id }
    });
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });

    const { title, company, location, type, description, requirements, skills, salary, deadline, isActive } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (company !== undefined) updateFields.company = company;
    if (location !== undefined) updateFields.location = location;
    if (type !== undefined) updateFields.type = type;
    if (description !== undefined) updateFields.description = description;
    if (requirements !== undefined) updateFields.requirements = requirements;
    if (skills !== undefined) updateFields.skills = skills;
    if (salary !== undefined) updateFields.salary = salary;
    if (deadline !== undefined) updateFields.deadline = deadline ? new Date(deadline) : null;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: updateFields
    });
    
    res.json(formatDoc(updatedJob));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id — HR deletes a job
router.delete('/:id', protect, hrOnly, async (req, res) => {
  try {
    // Delete related applications first
    await prisma.application.deleteMany({ where: { jobId: req.params.id } });
    
    const job = await prisma.job.deleteMany({
      where: { id: req.params.id, posterId: req.user.id }
    });
    
    if (job.count === 0) return res.status(404).json({ message: 'Job not found or not authorized' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id/applicants — HR views all applicants for a job
router.get('/:id/applicants', protect, hrOnly, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, posterId: req.user.id },
      include: {
        applications: {
          include: {
            applicant: { select: { id: true, name: true, email: true, avatar: true, headline: true, college: true, branch: true, year: true, skills: true, links: true, openToWork: true } }
          }
        }
      }
    });

    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
    
    const apps = job.applications.map(a => {
      const fa = formatDoc(a);
      fa.applicant = formatDoc(a.applicant);
      return fa;
    });
    
    res.json(apps);
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

    const job = await prisma.job.findFirst({
      where: { id: req.params.id, posterId: req.user.id }
    });
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });

    const app = await prisma.application.findFirst({
      where: { id: req.params.appId, jobId: job.id }
    });
    if (!app) return res.status(404).json({ message: 'Application not found' });

    await prisma.application.update({
      where: { id: app.id },
      data: { status }
    });
    
    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
