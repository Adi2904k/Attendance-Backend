const express = require("express");
const router = express.Router();
const attendanceController = require("./attendance.controller.js");

// Routes for Attendance


// Add a new attendance record
router.post("/mark", attendanceController.markAttendance);
router.get("/getAttendance", attendanceController.getPresentStudents);
router.get("/report", attendanceController.getAttendanceReport)
module.exports = router;
