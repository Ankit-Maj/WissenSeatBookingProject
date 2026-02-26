const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seatNumber: Number,
  type: String, // reserved / floating / temporaryFloating
  status: { type: String, default: "active" }
});

const sessionSchema = new mongoose.Schema({
  date: { type: Date, unique: true },

  reservedForBatch: String,  // Batch1 / Batch2

  totalSeats: { type: Number, default: 50 },
  reservedSeats: { type: Number, default: 40 },
  floatingSeats: { type: Number, default: 10 },

  bookings: [bookingSchema]
});

module.exports = mongoose.model("Session", sessionSchema);