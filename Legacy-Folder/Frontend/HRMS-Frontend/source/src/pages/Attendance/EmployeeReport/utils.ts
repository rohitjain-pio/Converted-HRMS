import moment from "moment";

 export const generateDateRange = (
    startDate: string | null,
    endDate: string | null
  ): string[] => {
    const dates: string[] = [];
    let current = moment(startDate);
    const last = moment(endDate);
    while (current.isSameOrBefore(last, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current = current.clone().add(1, "day");
    }
    return dates.reverse();
  };