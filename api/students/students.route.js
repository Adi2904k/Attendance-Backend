const express = require("express");
const studentController = require("./students.controller");
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Register a new student
router.post("/register", studentController.register);

// Student login
router.post("/login", studentController.login);

//Mark Attendance
// router.post('/mark-attendance', authMiddleware, studentController.markAttendance);

module.exports = router;
