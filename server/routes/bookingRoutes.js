const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { bookSeat, cancelSeat } = require("../controllers/bookingController");

router.post("/book", authMiddleware, bookSeat);
router.post("/cancel", authMiddleware, cancelSeat);

module.exports = router;