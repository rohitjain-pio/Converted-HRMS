import { CronLogsFilter } from "@/services/Developer/types";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import * as Yup from "yup";

export const CRON_TYPE_OPTIONS = [
  { id: "1", label: "Timedoctor timesheet stats" },
  { id: "2", label: "Monthly leave credit" },
];

export const validationSchema = Yup.object().shape({
  dateFrom: Yup.mixed<moment.Moment>().defined().nullable(),
  dateTo: Yup.mixed<moment.Moment>().defined().nullable(),
  typeId: Yup.number().defined().nullable(),
});

export type FormValues = Yup.InferType<typeof validationSchema>;

export type FilterFormProps = {
  onSearch: (values: CronLogsFilter) => void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

export type DateRangeType =
  | "Last15Min"
  | "Last1Hour"
  | "Today"
  | "Yesterday"
  | "Last7Days"
  | "custom";

export const dateRangeOptions = [
  { id: "Last15Min", label: "Last 15 Minutes" },
  { id: "Last1Hour", label: "Last 1 Hour" },
  { id: "Today", label: "Today" },
  { id: "Yesterday", label: "Yesterday" },
  { id: "Last7Days", label: "Last 7 Days" },
  { id: "custom", label: "Custom" },
];

export const getDateRange = (range: DateRangeType) => {
  const today = moment();

  switch (range) {
    case "Last15Min":
      return {
        from: today.clone().subtract(15, "minutes"),
        to: today.clone(),
      };
    case "Last1Hour":
      return {
        from: today.clone().subtract(1, "hour"),
        to: today.clone(),
      };
    case "Today":
      return {
        from: today.clone().startOf("day"),
        to: today.clone().endOf("day"),
      };
    case "Yesterday":
      return {
        from: today.clone().subtract(1, "day").startOf("day"),
        to: today.clone().subtract(1, "day").endOf("day"),
      };
    case "Last7Days":
      return {
        from: today.clone().subtract(7, "day").startOf("day"),
        to: today.clone().endOf("day"),
      };
    default:
      return null;
  }
};
