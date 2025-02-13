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
