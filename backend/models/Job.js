const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: { type: String, default: '', maxlength: 1000 },
  resumeLink:  { type: String, default: '' },   // URL to portfolio/drive/linkedin
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending',
  },
  appliedAt: { type: Date, default: Date.now },
}, { _id: true });

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  company:     { type: String, required: true, trim: true, maxlength: 100 },
  location:    { type: String, default: 'Remote', trim: true },
  type:        {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
    default: 'internship',
  },
  description: { type: String, required: true, maxlength: 3000 },
  requirements:{ type: String, default: '', maxlength: 2000 },
  skills:      [{ type: String, trim: true, maxlength: 40 }],
  salary:      { type: String, default: '' },          // e.g. "₹20,000/month" or "Unpaid"
  deadline:    { type: Date },
  isActive:    { type: Boolean, default: true },

  postedBy:    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applications: [applicationSchema],
}, { timestamps: true });

// Compound index for fast lookup by poster
jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
