const express = require("express");
const router = express.Router();

const { generateSessions, getSessions } = require("../controllers/sessionController");

router.post("/generate", generateSessions);
router.get("/", getSessions);

module.exports = router;