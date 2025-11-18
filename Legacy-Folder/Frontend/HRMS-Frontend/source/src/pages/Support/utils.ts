import moment from "moment";

export const getDateRange = (range: DateRangeType) => {
  const today = moment();

  switch (range) {
    case "previous15Days":
      return {
        from: today.clone().subtract(15, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    case "previous30Days":
      return {
        from: today.clone().subtract(30, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    case "previous90Days":
      return {
        from: today.clone().subtract(90, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    default:
      return null;
  }
};

export type DateRangeType = "previous15Days" | "previous30Days" | "previous90Days" | "custom";

export const dateRangeOptions = [
  { id: "previous15Days", label: "Previous 15 Days" },
  { id: "previous30Days", label: "Previous 30 Days" },
  { id: "previous90Days", label: "Previous 90 Days" },
  { id: "custom", label: "Custom" },
];