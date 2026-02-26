const getWeekNumber = (date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date - firstDay) / 86400000;
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
};

const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const getReservedBatch = (date) => {
  const weekNumber = getWeekNumber(date);
  const isWeek1 = weekNumber % 2 === 1;

  const day = date.getDay();

  if (isWeek1) {
    if (day >= 1 && day <= 3) return "Batch1"; // Mon/Tue/Wed
    else return "Batch2"; // Thu/Fri
  } else {
    if (day >= 1 && day <= 3) return "Batch2";
    else return "Batch1";
  }
};

module.exports = { isWeekday, getReservedBatch };