import { DeveloperLogsFilterPayload } from "@/services/Developer/types";

export const DEFAULT_DEVELOPER_LOGS_FILTER: DeveloperLogsFilterPayload = {
  sortColumnName: "TimeStamp",
  sortDirection: "desc",
  startIndex: 0,
  pageSize: 10,
  filters: {
    message: "",
    requestId: "",
    level: "",
    dateFrom: null,
    dateTo: null,
    id: null,
  },
};
