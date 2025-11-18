import { CronType } from "@/utils/constants";

export type DeveloperLogsFilter = {
  message?: string | null;
  requestId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  id?: number | null;
  level: string | null;
};
export type DeveloperLogsFilterPayload = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: DeveloperLogsFilter;
};

export type DeveloperLogsResponse = {
  statusCode: number;
  message: string;
  result: {
    logsList: DeveloperLogsResponseData[];
    totalRecords: number;
  } | null;
};

export type DeveloperLogsResponseData = {
  id: number;
  message: string | null;
  level: string | null;
  timestamp: string | null;
  exception: string | null;
  requestId: string | null;
  logEvent: string | null;
}

// cron

export type CronTypesResponse = {
  statusCode: number;
  message: string;
  result: {
    logsList: CronTypesResponseData[];
    totalRecords: number;
  } | null;
};

export type CronTypesResponseData = {
  id: number;
  name: string;
}
// cron logs
export type CronLogsFilterPayload = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: CronLogsFilter;
};
export type CronLogsFilter = {
  dateFrom: string | null;
  dateTo: string | null;
  typeId: CronType | null;
};
export type CronLogsResponse = {
  statusCode: number;
  message: string;
  result: {
    cronLogsList: CronLogsResponseData[];
    totalRecords: number;
  } | null;
};

export type CronLogsResponseData = {
  id: number;
  type: CronType | null;
  logId: number | null;
  payload: string | null;
  startedAt: string | null;
  completedAt: string | null;
}
