import moment from "moment";

export const getTotalHours = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "00:00";
  const [inH, inM] = startTime.split(":").map(Number);
  const [outH, outM] = endTime.split(":").map(Number);
  let totalMinutes = outH * 60 + outM - (inH * 60 + inM);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
export const shouldDisableCustomDate = (
  date: moment.Moment,
  filledDates: string[]
): boolean => {
  const isFilled = filledDates.some((filled) =>
    date.isSame(moment(filled, "MM/DD/YYYY HH:mm:ss"), "day")
  );
  const isToday = date.isSame(moment(), "day");
  return !(!isFilled || isToday);
};
