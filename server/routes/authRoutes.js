const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { signup, login, getMe, getStats } = require("../controllers/authController");

router.get("/me", authMiddleware, getMe);
router.get("/stats", getStats);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;