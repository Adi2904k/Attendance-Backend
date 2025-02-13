const TaskModel = require("./todo.model");

exports.getTask = (req, res, next) => {
    TaskModel
      .find()
      .then((Tasks) => {
        res.status(200).json({
          Tasks: Tasks,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  };

  exports.createTask = (req, res, next) => {
    const newTask = new TaskModel({
      task: req.body.task,
    });
    newTask
      .save()
      .then((result) => {
        res.status(200).json({
          Task: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  };

  exports.getTaskById = (req, res, next) => {
    TaskModel
      .findById(req.params.id)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(404).json({
          error: err,
        });
      });
  }; 

  exports.deleteTaskById = (req, res, next) => {
    TaskModel
      .findByIdAndDelete(req.params.id)
      .then((result) => {
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(200).json({ msg: "Task not found" });
        }
      })
      .catch((err) => {
        res.status(404).json({
          error: err,
        });
      });
  };

  exports.updateTask = (req, res, next) => {
    TaskModel.findByIdAndUpdate(req.params.id, req.body)
        .then((result) => {
            res.status(202).json({ msg: 'Task updated', data: result });
        }).catch(err => {
            res.status(404).json({ msg: 'Task not found' });
        });
  };