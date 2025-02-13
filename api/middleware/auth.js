const jwt = require('jsonwebtoken');
const StudentController = require('../students/students.controller');
const Teacher = require('../teacher/teacher.model');
exports.authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Safely extract token

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request for later use
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};