import moment from "moment";

export function formatEventDuration(
  startDateTime: string,
  endDateTime: string
) {
  const start = moment(startDateTime, "YYYY-MM-DD[T]HH:mm:ss");
  const end = moment(endDateTime, "YYYY-MM-DD[T]HH:mm:ss");

  if (!start.isValid() || !end.isValid()) {
    throw new Error("Invalid date format");
  }

  const fullDateFormat = "MMM Do, YYYY";
  const dayMonthFormat = "MMM Do";
  const dayFormat = "Do";
  const monthFormat = "MMM";
  const yearFormat = "YYYY";
  const timeFormat = "hh:mm A";

  let formattedDate;

  if (start.isSame(end, "day")) {
    formattedDate = start.format(fullDateFormat);
  } else if (start.isSame(end, "month") && start.isSame(end, "year")) {
    formattedDate = `${start.format(monthFormat)} ${start.format(dayFormat)} - ${end.format(dayFormat)} ${start.format(yearFormat)}`;
  } else if (start.isSame(end, "year")) {
    formattedDate = `${start.format(dayMonthFormat)} - ${end.format(dayMonthFormat)} ${start.format(yearFormat)}`;
  } else {
    formattedDate = `${start.format(fullDateFormat)} - ${end.format(fullDateFormat)}`;
  }

  const formattedTime = `${start.format(timeFormat)} - ${end.format(timeFormat)}`;

  return { formattedDate, formattedTime };
}
