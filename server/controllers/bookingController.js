const Session = require("../models/Session");
const User = require("../models/User");
const { isFloatingAllowed, canBookReservedSeat } = require("../utils/bookingLogic");

// Max 2 weeks (14 days) in advance
const MAX_ADVANCE_DAYS = 14;

exports.bookSeat = async (req, res) => {
  try {
    const { sessionId, type } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    // Block holidays
    if (session.isHoliday)
      return res.status(400).json({ msg: "Cannot book on a holiday" });

    // Block weekends (safety check)
    const dow = new Date(session.date).getDay();
    if (dow === 0 || dow === 6)
      return res.status(400).json({ msg: "Cannot book on weekends" });

    // 2-week advance booking check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDay = new Date(session.date);
    sessionDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((sessionDay - today) / 86400000);
    if (diffDays > MAX_ADVANCE_DAYS)
      return res.status(400).json({ msg: "Cannot book more than 2 weeks in advance" });
    if (diffDays < 0)
      return res.status(400).json({ msg: "Session has already passed" });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Prevent duplicate booking
    const existingBooking = session.bookings.find(
      b => b.userId && b.userId.toString() === user._id.toString() && b.status === "active"
    );
    if (existingBooking)
      return res.status(400).json({ msg: "You already have a booking for this session" });

    let seatNumber;

    if (type === "reserved") {
      // Must be the batch that owns this day
      if (!canBookReservedSeat(user, session))
        return res.status(400).json({ msg: `This day is reserved for ${session.reservedForBatch}` });

      const reservedBooked = session.bookings.filter(
        b => b.type === "reserved" && b.status === "active"
      ).length;

      if (reservedBooked >= session.reservedSeats)
        return res.status(400).json({ msg: "All reserved seats are full" });

      // Assign lowest available reserved seat (1-40)
      const usedReservedSeats = new Set(
        session.bookings
          .filter(b => b.type === "reserved" && b.status === "active")
          .map(b => b.seatNumber)
      );
      for (let s = 1; s <= session.reservedSeats; s++) {
        if (!usedReservedSeats.has(s)) { seatNumber = s; break; }
      }

    } else if (type === "floating") {
      // Floaters open only after 3PM the day before
      if (!isFloatingAllowed(session.date))
        return res.status(400).json({ msg: "Floating seats open after 3 PM the previous day" });

      // Count all floating types (normal + temporary)
      const floatingBooked = session.bookings.filter(
        b => (b.type === "floating" || b.type === "temporaryFloating") && b.status === "active"
      ).length;

      // Temporary floaters created when reserved seats are vacated
      const temporaryFloatingCount = session.bookings.filter(
        b => b.type === "temporaryFloating" && b.status === "active"
      ).length;

      const totalFloatingCapacity = session.floatingSeats + temporaryFloatingCount;

      if (floatingBooked >= totalFloatingCapacity)
        return res.status(400).json({ msg: "All floating seats are full" });

      // Assign a temporary-floating seat first if one is free, else a regular floating seat
      const usedFloatingSeats = new Set(
        session.bookings
          .filter(b => (b.type === "floating" || b.type === "temporaryFloating") && b.status === "active" && b.userId)
          .map(b => b.seatNumber)
      );

      // Temp floater placeholders — give one of these seat numbers to this user
      const tempFloaterPlaceholders = session.bookings.filter(
        b => b.type === "temporaryFloating" && b.status === "active" && !b.userId
      );

      if (tempFloaterPlaceholders.length > 0) {
        // Take over a vacated reserved seat
        const placeholder = tempFloaterPlaceholders[0];
        placeholder.userId = user._id;
        placeholder.username = user.username;
        seatNumber = placeholder.seatNumber;
        await session.save();
        return res.json({ msg: `Seat ${seatNumber} booked (temporary floater)`, seatNumber });
      }

      // Assign a regular floating seat (41-50)
      for (let s = 41; s <= 50; s++) {
        if (!usedFloatingSeats.has(s)) { seatNumber = s; break; }
      }

    } else {
      return res.status(400).json({ msg: "Invalid booking type. Use 'reserved' or 'floating'" });
    }

    session.bookings.push({
      userId: user._id,
      username: user.username,
      seatNumber,
      type
    });

    await session.save();

    res.json({ msg: `Seat ${seatNumber} booked successfully`, seatNumber, type });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.cancelSeat = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    // Check session hasn't passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDay = new Date(session.date);
    sessionDay.setHours(0, 0, 0, 0);
    if (sessionDay < today)
      return res.status(400).json({ msg: "Cannot cancel a past session" });

    const booking = session.bookings.find(
      b => b.userId && b.userId.toString() === req.user && b.status === "active"
    );

    if (!booking)
      return res.status(400).json({ msg: "No active booking found for this session" });

    // If it was a reserved seat → create a temporaryFloating placeholder so someone else can grab it
    if (booking.type === "reserved") {
      session.bookings.push({
        userId: null,
        username: null,
        seatNumber: booking.seatNumber,
        type: "temporaryFloating",
        status: "active"
      });
    }

    booking.status = "cancelled";

    await session.save();

    res.json({ msg: "Booking cancelled. Seat is now available as a temporary floater." });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};