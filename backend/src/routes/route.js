const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/TaskController");

router.get("/", tasksController.getAllTasks);
router.post("/add-task", tasksController.addTask);
router.delete("/delete", tasksController.deleteTaskById);
router.put("/update-task/:taskId",tasksController.updateTaskById);
router.get("/find-task-by-title",tasksController.findTaskByTitle);
router.get("/find-task-by-assignee",tasksController.findTaskByAssignee);
router.get("/all-user",tasksController.getAllUser);
router.get("/task",tasksController.getPaginationTasks);
module.exports = router;
