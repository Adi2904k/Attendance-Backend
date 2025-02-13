var express = require("express");
var router = express.Router();
const TaskController=require("./todo.controller")

router.get("/", TaskController.getTask);
router.get("/:id", TaskController.getTaskById);
router.delete("/:id", TaskController.deleteTaskById);
router.put('/:id', TaskController.updateTask);
router.post("/", TaskController.createTask);

module.exports = router;
