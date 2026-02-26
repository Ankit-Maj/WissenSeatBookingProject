const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { signup, login, getMe } = require("../controllers/authController");

router.get("/me", authMiddleware, getMe);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;