const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Note = require('./models/Note');
const Community = require('./models/Community');
const Post = require('./models/Post');
const Event = require('./models/Event');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Note.deleteMany({}),
      Community.deleteMany({}),
      Post.deleteMany({}),
      Event.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@univoid.com', password: 'admin123', role: 'admin', college: 'IIT Delhi', branch: 'Computer Science', year: '4th Year', bio: 'Platform administrator' },
      { name: 'Rahul Sharma', email: 'rahul@test.com', password: 'test123', role: 'student', college: 'IIT Delhi', branch: 'Computer Science', year: '3rd Year', bio: 'Full-stack developer and open source enthusiast' },
      { name: 'Priya Patel', email: 'priya@test.com', password: 'test123', role: 'student', college: 'NIT Trichy', branch: 'Electronics', year: '2nd Year', bio: 'Embedded systems nerd' },
      { name: 'Arjun Singh', email: 'arjun@test.com', password: 'test123', role: 'student', college: 'BITS Pilani', branch: 'Mechanical', year: '4th Year', bio: 'Startup enthusiast and hackathon lover' },
    ]);
    console.log(`Created ${users.length} users`);

    // Create communities
    const communities = await Community.create([
      { name: 'Code Warriors', description: 'A community for competitive programmers and coding enthusiasts.', category: 'Coding', icon: '⚔️', createdBy: users[1]._id, members: [users[0]._id, users[1]._id, users[2]._id], memberCount: 3 },
      { name: 'Startup Hub', description: 'Connect with fellow entrepreneurs, share ideas, and build the next big thing.', category: 'Business', icon: '🚀', createdBy: users[3]._id, members: [users[1]._id, users[3]._id], memberCount: 2 },
      { name: 'Design Thinkers', description: 'UI/UX designers sharing work, feedback, and inspiration.', category: 'Design', icon: '🎨', createdBy: users[2]._id, members: [users[0]._id, users[2]._id, users[3]._id], memberCount: 3 },
      { name: 'ML & AI Club', description: 'Discuss papers, share projects, and learn machine learning together.', category: 'Technology', icon: '🤖', createdBy: users[0]._id, members: [users[0]._id, users[1]._id], memberCount: 2 },
    ]);
    console.log(`Created ${communities.length} communities`);

    // Update users' joinedCommunities
    await User.findByIdAndUpdate(users[0]._id, { joinedCommunities: [communities[0]._id, communities[2]._id, communities[3]._id] });
    await User.findByIdAndUpdate(users[1]._id, { joinedCommunities: [communities[0]._id, communities[1]._id, communities[3]._id] });
    await User.findByIdAndUpdate(users[2]._id, { joinedCommunities: [communities[0]._id, communities[2]._id] });
    await User.findByIdAndUpdate(users[3]._id, { joinedCommunities: [communities[1]._id, communities[2]._id] });

    // Create notes
    const notes = await Note.create([
      { title: 'Data Structures & Algorithms Complete Notes', subject: 'DSA', description: 'Comprehensive notes covering arrays, linked lists, trees, graphs, DP, and more.', college: 'IIT Delhi', fileUrl: 'https://example.com/dsa-notes.pdf', fileType: 'pdf', uploadedBy: users[1]._id, downloads: 42 },
      { title: 'Operating Systems Handwritten Notes', subject: 'Operating Systems', description: 'Detailed handwritten notes on process management, memory, file systems.', college: 'IIT Delhi', fileUrl: 'https://example.com/os-notes.pdf', fileType: 'pdf', uploadedBy: users[1]._id, downloads: 28 },
      { title: 'Digital Electronics Reference', subject: 'Digital Electronics', description: 'Quick reference for logic gates, flip-flops, and combinational circuits.', college: 'NIT Trichy', fileUrl: 'https://example.com/de-notes.pdf', fileType: 'pdf', uploadedBy: users[2]._id, downloads: 15 },
      { title: 'Machine Learning Stanford CS229', subject: 'Machine Learning', description: 'Summary notes from Stanford CS229 course by Andrew Ng.', college: 'BITS Pilani', fileUrl: 'https://cs229.stanford.edu/notes2022fall/main_notes.pdf', fileType: 'link', uploadedBy: users[3]._id, downloads: 67 },
      { title: 'Thermodynamics Formulas Sheet', subject: 'Thermodynamics', description: 'All important formulas and derivations for thermodynamics.', college: 'BITS Pilani', fileUrl: 'https://example.com/thermo.pdf', fileType: 'pdf', uploadedBy: users[3]._id, downloads: 33 },
      { title: 'DBMS Complete Guide', subject: 'DBMS', description: 'SQL, normalization, transactions, indexing — everything you need.', college: 'IIT Delhi', fileUrl: 'https://example.com/dbms.pdf', fileType: 'pdf', uploadedBy: users[0]._id, downloads: 51 },
    ]);
    console.log(`Created ${notes.length} notes`);

    // Create posts
    const posts = await Post.create([
      { content: 'Just solved my first graph problem using BFS! The feeling is amazing 🎉', community: communities[0]._id, author: users[1]._id, likes: [users[2]._id, users[3]._id], likeCount: 2, comments: [{ text: 'Congrats! Which problem was it?', author: users[2]._id }, { text: 'Keep it up! Try DFS next.', author: users[0]._id }] },
      { content: 'Looking for a co-founder for an EdTech startup. DM if interested!', community: communities[1]._id, author: users[3]._id, likes: [users[1]._id], likeCount: 1 },
      { content: 'Check out this amazing Figma plugin for generating color palettes: https://coolors.co', community: communities[2]._id, author: users[2]._id, likes: [users[0]._id, users[3]._id], likeCount: 2 },
      { content: 'Has anyone tried the new GPT-4 API? The structured output feature is a game changer.', community: communities[3]._id, author: users[0]._id, likes: [users[1]._id], likeCount: 1, comments: [{ text: 'Yes! It handles JSON schemas really well now.', author: users[1]._id }] },
    ]);
    console.log(`Created ${posts.length} posts`);

    // Create events
    const now = new Date();
    const events = await Event.create([
      { title: 'HackTheVoid 2024', description: 'A 48-hour national level hackathon. Build, innovate, and win exciting prizes!', date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), location: 'IIT Delhi Campus', link: 'https://hackthevoid.devfolio.co', category: 'Hackathon', createdBy: users[0]._id, registrations: [users[1]._id, users[3]._id], registrationCount: 2 },
      { title: 'Resume Building Workshop', description: 'Learn how to craft an ATS-friendly resume that gets you interviews.', date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), location: 'Online (Zoom)', link: 'https://zoom.us/meeting/resume-workshop', category: 'Workshop', createdBy: users[0]._id, registrations: [users[2]._id], registrationCount: 1 },
      { title: 'Google Summer of Code Info Session', description: 'Everything you need to know about GSoC 2025 — eligibility, orgs, and tips.', date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), location: 'Online (Google Meet)', link: 'https://meet.google.com/gsoc-info', category: 'Info Session', createdBy: users[0]._id },
      { title: 'Inter-College Coding Contest', description: 'Compete against the best coders from top colleges across India.', date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), location: 'BITS Pilani Campus', link: 'https://codingcontest.in', category: 'Competition', createdBy: users[0]._id, registrations: [users[1]._id, users[2]._id, users[3]._id], registrationCount: 3 },
    ]);
    console.log(`Created ${events.length} events`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('  Admin: admin@univoid.com / admin123');
    console.log('  Student: rahul@test.com / test123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
