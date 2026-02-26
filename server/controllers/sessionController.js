const Session = require("../models/Session");
const { isValidSessionDate, getReservedBatch, isHoliday } = require("../utils/sessionLogic");

/**
 * POST /api/sessions/generate
 * Generates sessions for the next N days (default: 30 days = ~2 weeks forward always available).
 * Skips weekends and holidays.
 */
exports.generateSessions = async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const sessions = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);

      // Always skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const holiday = isHoliday(date);
      const reservedForBatch = holiday ? null : getReservedBatch(date);

      // Upsert by date
      const existing = await Session.findOne({ date });
      if (existing) continue;

      const session = await Session.create({
        date,
        reservedForBatch,
        isHoliday: holiday
      });

      sessions.push(session);
    }

    res.json({ msg: "Sessions generated", count: sessions.length, sessions });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/sessions
 * Returns all sessions sorted by date ascending.
 */
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/sessions/:id
 * Returns a single session by its Mongo _id.
 */
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};