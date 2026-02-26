const Session = require("../models/Session");
const User = require("../models/User");
const { isFloatingAllowed, canBookReservedSeat } = require("../utils/bookingLogic");

// Max 2 weeks (14 days) in advance
const MAX_ADVANCE_DAYS = 14;

exports.bookSeat = async (req, res) => {
  try {
    const { sessionId, type, requestedSeat } = req.body;

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

    let seatNumber = requestedSeat;
    const activeBookings = session.bookings.filter(b => b.status === "active");

    if (type === "reserved") {
      if (!canBookReservedSeat(user, session))
        return res.status(400).json({ msg: `This day is reserved for ${session.reservedForBatch}` });

      if (seatNumber) {
        if (seatNumber < 1 || seatNumber > session.reservedSeats)
          return res.status(400).json({ msg: `Invalid seat. Reserved seats are 1-${session.reservedSeats}` });

        const isTaken = activeBookings.some(b => b.seatNumber === seatNumber);
        if (isTaken) return res.status(400).json({ msg: `Seat ${seatNumber} is already taken` });
      } else {
        const used = new Set(activeBookings.filter(b => b.type === "reserved").map(b => b.seatNumber));
        for (let s = 1; s <= session.reservedSeats; s++) {
          if (!used.has(s)) { seatNumber = s; break; }
        }
        if (!seatNumber) return res.status(400).json({ msg: "All reserved seats are full" });
      }

    } else if (type === "floating") {
      if (!isFloatingAllowed(session.date))
        return res.status(400).json({ msg: "Floating seats open after 3 PM the previous day" });

      const tempFloatPlaceholders = activeBookings.filter(b => b.type === "temporaryFloating" && !b.userId);
      const totalFloatCap = session.floatingSeats + activeBookings.filter(b => b.type === "temporaryFloating").length;

      if (seatNumber) {
        // Check if it's a temp floater or a normal floater
        const isTempPlaceholder = tempFloatPlaceholders.find(p => p.seatNumber === seatNumber);
        if (isTempPlaceholder) {
          isTempPlaceholder.userId = user._id;
          isTempPlaceholder.username = user.username;
          await session.save();
          return res.json({ msg: `Seat ${seatNumber} booked (temporary floater)`, seatNumber });
        }

        if (seatNumber < 41 || seatNumber > 50)
          return res.status(400).json({ msg: "Invalid seat. Standard floating seats are 41-50" });

        const isTaken = activeBookings.some(b => b.seatNumber === seatNumber);
        if (isTaken) return res.status(400).json({ msg: `Seat ${seatNumber} is already taken` });
      } else {
        // Auto-assign temp first, then standard
        if (tempFloatPlaceholders.length > 0) {
          const placeholder = tempFloatPlaceholders[0];
          placeholder.userId = user._id;
          placeholder.username = user.username;
          seatNumber = placeholder.seatNumber;
          await session.save();
          return res.json({ msg: `Seat ${seatNumber} booked (temporary floater)`, seatNumber });
        }

        const used = new Set(activeBookings.filter(b => b.type === "floating").map(b => b.seatNumber));
        for (let s = 41; s <= 50; s++) {
          if (!used.has(s)) { seatNumber = s; break; }
        }
        if (!seatNumber) return res.status(400).json({ msg: "All floating seats are full" });
      }
    } else {
      return res.status(400).json({ msg: "Invalid booking type" });
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
      b => b.userId && String(b.userId) === String(req.user) && b.status === "active"
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