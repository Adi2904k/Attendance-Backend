const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: false },
  name: { type: String, required: true },
  batch: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  attendance: [
    {
      sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
      date: { type: String },
    },
  ],
});

// Hash the password before saving the student
studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
