const isFloatingAllowed = (sessionDate) => {
  const now = new Date();

  const cutoff = new Date(sessionDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(15, 0, 0, 0); // 3 PM previous day

  return now >= cutoff;
};

const canBookReservedSeat = (user, session) => {
  return user.batch === session.reservedForBatch;
};

module.exports = {
  isFloatingAllowed,
  canBookReservedSeat
};