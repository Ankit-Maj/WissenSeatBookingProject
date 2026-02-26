const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: { type: String },
  seatNumber: Number,
  type: { type: String, enum: ["reserved", "floating", "temporaryFloating"] },
  status: { type: String, default: "active" },
  bookedAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  date: { type: Date, unique: true },

  reservedForBatch: { type: String, enum: ["BatchA", "BatchB"] },

  isHoliday: { type: Boolean, default: false },

  totalSeats: { type: Number, default: 50 },
  reservedSeats: { type: Number, default: 40 },
  floatingSeats: { type: Number, default: 10 },

  bookings: [bookingSchema]
});

module.exports = mongoose.model("Session", sessionSchema);