const Teacher = require('./teacher.model');
const Student = require('../students/students.model');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const LZString = require('lz-string'); // Import the LZString library for compression
const Attendance = require('../attendance/attendance.model');
const mongoose = require('mongoose');
// Register Teacher
exports.registerTeacher = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const teacher = new Teacher({ name, email, password });
    await teacher.save();
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login Teacher
exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: 'Login successful',
      token,
      teacherId: teacher._id  // ✅ Include teacherId in response
    });

    console.log('Teacher ID:', teacher._id); // Log teacher ID for debugging
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a Session (with QR Code)
exports.createSession = async (req, res) => {
  try {
    const { topic, date, batch, teacherEmail } = req.body;

    // Validate input
    if (!topic || !date || !batch || !teacherEmail) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Find the teacher
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ message: 'Faculty not found!' });
    }
    console.log(teacher._id);
    // Ensure teacher.sessions is an array
    teacher.sessions = teacher.sessions || [];

    // Generate a unique session ID
    const sessionId = `${teacher._id}-${teacher.sessions.length + 1}`; // Create a custom sessionId
    console.log('Generated sessionId:', sessionId);

    // Generate the QR Code
    const qrCode = await QRCode.toDataURL(`http://localhost:3000/api/attendance/mark?teacherId=${teacher._id}&sessionId=${sessionId}`);

    // Create the session object
    const session = {
      topic,
      date,
      batch,
      sessionId, // Use the generated sessionId
      qrCode,
      createdAt: new Date(),
    };
    console.log('Session object:', session,"teacher Id",teacher._id);

    // Push the session into the sessions array
    teacher.sessions.push(session);

    // Log teacher object before saving
    console.log('Teacher object before save:', teacher);

    // Save the updated teacher object
    await teacher.save();

    return res.status(201).json({
      message: 'Session created successfully!',
      sessionId: sessionId,
      qrCode: qrCode,
    });
  } catch (err) {
    console.error('Error creating session:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
