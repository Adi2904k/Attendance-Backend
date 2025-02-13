const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  presentStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',  // Reference to Student model
    },
  ],
  date: {
    type: Date,
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  batchno: {
    type: String,
    required: [true, 'Batch is required'],
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
