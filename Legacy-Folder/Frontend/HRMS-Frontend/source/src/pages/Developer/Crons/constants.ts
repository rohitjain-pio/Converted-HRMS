import { CronLogsFilterPayload } from "@/services/Developer/types";

export const DEFAULT_CRON_LOGS_FILTER: CronLogsFilterPayload = {
  sortColumnName: "TimeStamp",
  sortDirection: "desc",
  startIndex: 0,
  pageSize: 10,
  filters: {
    dateFrom: null,
    dateTo: null,
    typeId: null,
  },
};
