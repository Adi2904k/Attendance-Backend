const express = require('express');
const router = express.Router();
const teacherController = require('./teacher.controller');
const { authMiddleware } = require('../middleware/auth');

// Register and Login
router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);
//Mark Attendance
router.post('/create-session', teacherController.createSession);
// router.post('/mark-attendance',  teacherController.markAttendance);
// router.get('/attendance/:sessionId', authMiddleware, teacherController.getAttendance);

module.exports = router;
