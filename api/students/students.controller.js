const Student = require("../students/students.model");
const Teacher = require('../teacher/teacher.model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Register a new student
exports.register = async (req, res) => {
  try {
    const { rollNumber, name, email, password ,batch } = req.body;

    // Validate input
    if (!rollNumber || !name || !email || !password || !batch) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email or rollNumber is already registered
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingStudent) {
      return res.status(400).json({ error: "Email or Roll Number already registered" });
    }

    // Create a new student
    const newStudent = new Student({ rollNumber, name, email, password, batch });
    await newStudent.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Validate that rollNumber is valid before generating the token
    if (!student.rollNumber || typeof student.rollNumber !== "string" || !/^\d+$/.test(student.rollNumber)) {
      return res.status(400).json({ error: "Invalid roll number format" });
    }

    // Validate that batch is present
    if (!student.batch || typeof student.batch !== "string") {
      return res.status(400).json({ error: "Batch information missing or invalid" });
    }

    // Generate a JWT token including rollNumber and batch
    const token = jwt.sign(
      { id: student._id, role: "student", rollNumber: student.rollNumber, batch: student.batch },
      process.env.JWT_SECRET_KEY || "your_jwt_secret_key", // Replace with an environment variable in production
      { expiresIn: "1d" }
    );

    // Respond with token and student details
    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        batch: student.batch,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// exports.markAttendance = async (req, res) => {
//   const { sessionId } = req.body;
//   const studentId = req.user.id; // Authenticated student ID from token

//   try {
//     const teacher = await Teacher.findOne({ 'sessions._id': sessionId });

//     if (!teacher) {
//       return res.status(404).json({ message: 'Session not found' });
//     }

//     const session = teacher.sessions.id(sessionId);

//     if (!session) {
//       return res.status(404).json({ message: 'Session not found' });
//     }

//     if (session.attendance && session.attendance.includes(studentId)) {
//       return res.status(400).json({ message: 'Attendance already marked for this session' });
//     }

//     if (!session.attendance) {
//       session.attendance = [];
//     }

//     session.attendance.push(studentId);
//     await teacher.save();

//     res.status(200).json({ message: 'Attendance marked successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'An error occurred while marking attendance' });
//   }
// };