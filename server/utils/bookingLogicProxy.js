const { isFloatingAllowed, canBookReservedSeat } = require("../utils/bookingLogic");

/**
 * Returns true only if the current time is ≥ 3PM on the day before sessionDate.
 * Already implemented in bookingLogic.js — re-exported here for clarity.
 */

module.exports = { isFloatingAllowed, canBookReservedSeat };
