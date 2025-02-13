const mongoose = require("mongoose");

const TodoSchema=new mongoose.Schema({
    task: String,
});
const model = mongoose.model("Task", TodoSchema);
module.exports = model;
