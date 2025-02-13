var express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
var TodoRouter =require("./api/todo/todo.route")
var attendanceRoutes = require("./api/attendance/attendance.route");
var studentRouter = require("./api/students/students.route");
var teacherRouter = require("./api/teacher/teacher.route");

var app = express();

require("dotenv").config();

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("Data base connection Established");
  })
  .catch((error) => {
    console.log(error);
    console.log("Error in connecting Mongodb");
  });


  app.use(cors({
    origin: '*', // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  
  app.use(bodyParser.json());

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
}
  next();
});

app.use("/todo",TodoRouter);
app.use("/attendance", attendanceRoutes);
app.use("/student", studentRouter);
app.use("/teacher",teacherRouter);

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});