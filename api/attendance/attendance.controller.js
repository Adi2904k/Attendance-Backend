// Import the Attendance model
const Student = require("../students/students.model");
const Teacher = require('../teacher/teacher.model');
const Attendance = require("./attendance.model"); // Import the Attendance model
exports.markAttendance = async (req, res) => { 
  try {
    console.log("Received Query Params:", req.query);

    const { sessionId, teacherId, studentRollNo , batch } = req.query;
    console.log("Extracted studentRollNo:", studentRollNo);

    if (!studentRollNo || !/^\d+$/.test(studentRollNo)) {
      return res.status(400).json({ error: "Invalid studentRollNo format!" });
    }

    // Validate teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found!" });
   
    // Validate batch

    // Validate session
    const session = teacher.sessions.find((s) => s.sessionId === sessionId);
    if (!session) return res.status(404).json({ message: "Session not found!" });

    // Validate batch
    if (session.batch !== batch) {
      return res.status(404).json({ message: "Batch not found!" });
    }
    // Validate student
    const student = await Student.findOne({ rollNumber: studentRollNo });
    console.log("Student from DB:", student);
    if (!student) return res.status(404).json({ message: "Student not found!" });

    // Find the existing attendance record for this session and teacher
    let attendance = await Attendance.findOne({ sessionId, teacherId });

    if (!attendance) {
      // If no attendance record exists, create a new one
      attendance = new Attendance({
        sessionId,
        teacherId,
        batchno :session.batch,
        date: session.date ? new Date(session.date) : new Date(), // Use session date if available, else current date
        presentStudents: [],
      });
    }

    // Check if the student is already marked present
    if (attendance.presentStudents.includes(student._id)) {
      return res.status(400).json({ message: "Student already marked present!" });
    }

    // Add the student ID to the presentStudents array
    attendance.presentStudents.push(student._id);
    await attendance.save();

    res.status(200).json({ 
      message: "Attendance marked successfully!",
      attendance
    });

  } catch (err) {
    console.error("Error in markAttendance:", err);
    res.status(500).json({ error: err.message });
  }
};

// exports.getPresentStudents = async (req, res) => {
//   try {
//     console.log("Received Query Params:", req.query);
//     const { date, batch } = req.query;

//     if (!date || !batch) {
//       return res.status(400).json({ error: "Missing date or batch!" });
//     }

//     const attendanceRecords = await Attendance.find({ date, batch })  // FIXED: Querying using correct field
//       .populate("presentStudents", "rollNumber name email");

//     if (!attendanceRecords || attendanceRecords.length === 0) {
//       return res.status(404).json({ message: "No attendance records found for this date and batch!" });
//     }

//     console.log("Attendance Records from DB:", attendanceRecords);

//     // Extract present students from all attendance records
//     const presentStudents = attendanceRecords.flatMap(record => record.presentStudents);

//     return res.status(200).json({
//       date,
//       batch,
//       presentStudents, // FIXED: Flattening the student list
//     });
//   } catch (err) {
//     console.error("Error fetching present students:", err);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

exports.getPresentStudents = async (req, res) => {
  try {
    console.log("Received Query Params:", req.query);
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId!" });
    }

    const attendanceRecords = await Attendance.find({ sessionId })
      .populate("presentStudents", "rollNumber name email");

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this sessionId!" });
    }

    console.log("Attendance Records from DB:", attendanceRecords);

    // Extract present students from all attendance records
    const presentStudents = attendanceRecords.flatMap(record => record.presentStudents);

    return res.status(200).json({
      sessionId,
      presentStudents,
    });
  } catch (err) {
    console.error("Error fetching present students:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};



exports.getAttendanceReport = async (req, res) => {
  try {
    console.log("Received Query Params:", req.query);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing startDate or endDate!" });
    }

    // Convert startDate and endDate to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire endDate

    // Fetch attendance records within the date range
    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate("presentStudents", "rollNumber name");

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this date range!" });
    }

    console.log("Attendance Records from DB:", attendanceRecords);

    // Map to store attendance count for each student
    const studentAttendanceMap = new Map();

    attendanceRecords.forEach(record => {
      record.presentStudents.forEach(student => {
        const studentId = student._id.toString();
        if (!studentAttendanceMap.has(studentId)) {
          studentAttendanceMap.set(studentId, {
            name: student.name,
            rollNumber: student.rollNumber,
            presentDays: 0,
          });
        }
        studentAttendanceMap.get(studentId).presentDays++;
      });
    });

    // Calculate total days in the given date range
    const totalDays = attendanceRecords.length;

    // Generate the attendance report
    const attendanceReport = Array.from(studentAttendanceMap.values()).map(student => ({
      name: student.name,
      rollNumber: student.rollNumber,
      attendancePercentage: ((student.presentDays / totalDays) * 100).toFixed(2),
    }));

    return res.status(200).json({
      startDate,
      endDate,
      totalDays,
      students: attendanceReport,
    });
  } catch (err) {
    console.error("Error fetching attendance report:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};