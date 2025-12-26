const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { verifyToken } = require("../middleware/authMiddleware");

// 1. Chair route (Already works)
router.post("/create", verifyToken, taskController.createTask);

// 2. THIS IS THE MISSING ROAD - ADD THIS NOW
router.get("/my-tasks", verifyToken, taskController.getEmployeeTasks);

// Road for Employees to update status
router.put("/update-status", verifyToken, taskController.updateTaskStatus);

router.get("/chair-tasks", verifyToken, taskController.getChairTasks);

module.exports = router;