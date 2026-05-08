const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  college: {
    type: String,
    trim: true,
    default: '',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    enum: ['pdf', 'link', 'other'],
    default: 'link',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  downloads: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Text index for search
noteSchema.index({ title: 'text', subject: 'text', description: 'text', college: 'text' });

module.exports = mongoose.model('Note', noteSchema);
