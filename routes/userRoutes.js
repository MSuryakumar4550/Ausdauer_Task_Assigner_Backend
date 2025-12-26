const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, isChair } = require("../middleware/authMiddleware");

// 1. CHAIR ONLY: Lifecycle Management
// The road for registering new employees into the system
router.post("/register", verifyToken, isChair, userController.addNewUser);

// The road for revoking access (Soft Delete)
router.delete("/remove/:id", verifyToken, isChair, userController.removeEmployee);

// 2. ALL USERS: Account Management
// Consolidate Road: Handles Name, Designation, AND Optional Verified Password Change
router.put("/update-profile", verifyToken, userController.updateProfile);

// Security Road: Triggers the OTP generation to terminal/email
router.post("/request-verification", verifyToken, userController.requestVerification);

module.exports = router;