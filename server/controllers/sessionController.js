const Session = require("../models/Session");
const { isWeekday, getReservedBatch } = require("../utils/sessionLogic");

exports.generateSessions = async (req, res) => {
  try {
    const { days = 14 } = req.body;

    const sessions = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      if (!isWeekday(date)) continue;

      const existing = await Session.findOne({ date });
      if (existing) continue;

      const reservedForBatch = getReservedBatch(date);

      const session = await Session.create({
        date,
        reservedForBatch
      });

      sessions.push(session);
    }

    res.json({ msg: "Sessions generated", sessions });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};