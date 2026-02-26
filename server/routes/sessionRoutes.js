const express = require("express");
const router = express.Router();

const { generateSessions, getSessions, getSessionById } = require("../controllers/sessionController");

router.post("/generate", generateSessions);
router.get("/", getSessions);
router.get("/:id", getSessionById);

module.exports = router;