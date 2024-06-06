const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/TaskController");

router.get("/", tasksController.getAllTasks);
router.get("/task/:id", tasksController.getTaskById);
router.post("/add-task", tasksController.addTask);
router.delete("/delete", tasksController.deleteTaskById);
router.put("/update-task/:taskId",tasksController.updateTaskById);
router.get("/task",tasksController.getTasks);
router.get("/user-by-task/:taskId",tasksController.getUserByTask);

module.exports = router;
