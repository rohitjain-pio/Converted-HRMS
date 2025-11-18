import moment from "moment";

export const formatDate = (
  date: Date | string | number | undefined
): string => {
  const formattedDate = moment(date).format("MMM Do, YYYY");

  return formattedDate === "Invalid date" ? "" : formattedDate;
};
