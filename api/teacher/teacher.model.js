const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const FacultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Faculty name is required'],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  sessions: [
    {
      topic: {
        type: String,
        required: [true, 'Session topic is required'],
      },
      date: {
        type: Date,
        required: [true, 'Session date is required'],
      },
      batch: {
        type: String,
        required: [true, 'Batch is required'],
      },
      qrCode: {
        type: String,
        required: [true, 'QR Code is required'],
      },
      sessionId: {
        type: String,
        required: [true, 'Session ID is required'],
        unique: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ], default: [],
});

// Hash password before saving the faculty document
FacultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if the password is new/modified
  const salt = await bcrypt.genSalt(10); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Method to compare provided password with the hashed password in the database
FacultySchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Faculty', FacultySchema);
