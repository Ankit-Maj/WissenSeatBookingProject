// =============================================
// Session Logic Utilities
// =============================================

/**
 * Returns ISO week number (1-indexed) for a given date.
 * Starts from the first Monday of the year.
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Returns true if date is a weekday (Mon-Fri).
 */
const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

/**
 * Biweekly batch assignment:
 *   Week1 (odd ISO week):  Mon/Tue/Wed → BatchA, Thu/Fri → BatchB
 *   Week2 (even ISO week): Mon/Tue/Wed → BatchB, Thu/Fri → BatchA
 */
const getReservedBatch = (date) => {
  const weekNumber = getWeekNumber(date);
  const isWeek1 = weekNumber % 2 === 1;
  const day = date.getDay(); // 1=Mon … 5=Fri

  if (isWeek1) {
    return (day >= 1 && day <= 3) ? "BatchA" : "BatchB";
  } else {
    return (day >= 1 && day <= 3) ? "BatchB" : "BatchA";
  }
};

/**
 * Hardcoded Indian public holidays (MM-DD format, year-agnostic)
 * and specific dated ones (YYYY-MM-DD). Extend as needed.
 */
const RECURRING_HOLIDAYS = new Set([
  "01-01", // New Year's Day
  "01-26", // Republic Day
  "08-15", // Independence Day
  "10-02", // Gandhi Jayanti
  "12-25", // Christmas
]);

const SPECIFIC_HOLIDAYS = new Set([
  // Add dated holidays like "2026-03-25" for Holi, etc.
  "2026-03-25", // Holi
  "2026-04-14", // Dr. Ambedkar Jayanti / Baisakhi
  "2026-04-10", // Good Friday
  "2026-05-01", // Labour Day
  "2026-06-07", // Eid ul-Adha (approx)
  "2026-10-02", // Gandhi Jayanti
  "2026-10-20", // Dussehra (approx)
  "2026-11-14", // Diwali (approx)
]);

const isHoliday = (date) => {
  const mmDD = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const yyyyMMDD = `${date.getFullYear()}-${mmDD}`;
  return RECURRING_HOLIDAYS.has(mmDD) || SPECIFIC_HOLIDAYS.has(yyyyMMDD);
};

/**
 * A date is bookable if it is a weekday and not a holiday.
 */
const isValidSessionDate = (date) => isWeekday(date) && !isHoliday(date);

module.exports = { isWeekday, getReservedBatch, isHoliday, isValidSessionDate, getWeekNumber };