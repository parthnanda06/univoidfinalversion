const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'hr'],
    default: 'student',
  },
  college: { type: String, trim: true, default: '' },
  branch: { type: String, trim: true, default: '' },
  year: { type: String, trim: true, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  avatar: { type: String, default: '' },

  // LinkedIn-style extended profile
  headline: { type: String, maxlength: 120, default: '' },
  skills: [{ type: String, trim: true, maxlength: 40 }],
  links: {
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  location: { type: String, trim: true, default: '' },
  openToWork: { type: Boolean, default: false },

  // Connections (follow system)
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  joinedCommunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
