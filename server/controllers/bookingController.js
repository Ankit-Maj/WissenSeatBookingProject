const Session = require("../models/Session");
const User = require("../models/User");
const { isFloatingAllowed, canBookReservedSeat } = require("../utils/bookingLogic");

exports.bookSeat = async (req, res) => {
  try {
    const { sessionId, type } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Prevent duplicate booking
    const existingBooking = session.bookings.find(
      b => b.userId.toString() === user._id.toString() && b.status === "active"
    );

    if (existingBooking)
      return res.status(400).json({ msg: "Already booked" });

    let seatNumber;

    if (type === "reserved") {

      if (!canBookReservedSeat(user, session))
        return res.status(400).json({ msg: "Not your batch day" });

      const reservedBooked = session.bookings.filter(
        b => b.type === "reserved" && b.status === "active"
      ).length;

      if (reservedBooked >= session.reservedSeats)
        return res.status(400).json({ msg: "Reserved seats full" });

      seatNumber = reservedBooked + 1;

    } else if (type === "floating") {

      if (!isFloatingAllowed(session.date))
        return res.status(400).json({ msg: "Floating not open yet" });

      const floatingBooked = session.bookings.filter(
        b => b.type === "floating" && b.status === "active"
      ).length;

      if (floatingBooked >= session.floatingSeats)
        return res.status(400).json({ msg: "Floating seats full" });

      seatNumber = 41 + floatingBooked;

    } else {
      return res.status(400).json({ msg: "Invalid booking type" });
    }

    session.bookings.push({
      userId: user._id,
      seatNumber,
      type
    });

    await session.save();

    res.json({ msg: "Seat booked", seatNumber });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.cancelSeat = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const booking = session.bookings.find(
      b => b.userId.toString() === req.user && b.status === "active"
    );

    if (!booking)
      return res.status(400).json({ msg: "No active booking" });

    // Convert reserved → temporary floating
    if (booking.type === "reserved") {
      session.bookings.push({
        userId: null,
        seatNumber: booking.seatNumber,
        type: "temporaryFloating"
      });
    }

    booking.status = "cancelled";

    await session.save();

    res.json({ msg: "Seat cancelled" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};