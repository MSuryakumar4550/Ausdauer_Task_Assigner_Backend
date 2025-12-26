const express = require("express");
const router = express.Router(); 
const authController = require("../controllers/authController");

// FIXED: Added curly braces to destructure the function from the object
const { verifyToken } = require("../middleware/authMiddleware"); 

// Ensure these functions exist in your authController
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/employees", verifyToken, authController.getAllEmployees);

module.exports = router;