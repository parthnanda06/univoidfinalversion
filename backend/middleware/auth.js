const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      // Map id to _id for backward compatibility with existing route logic
      req.user._id = req.user.id;
      // Don't send password hash in req.user
      delete req.user.password;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { protect, adminOnly };
