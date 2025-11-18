import { httpInstance } from "@/api/httpInstance";
import {
  CronLogsFilterPayload,
  CronLogsResponse,
  CronTypesResponse,
  DeveloperLogsFilterPayload,
  DeveloperLogsResponse,
} from "@/services/Developer/types";

const baseRoute = "/DevTool";

export const getDeveloperLogs = async (params: DeveloperLogsFilterPayload) => {
  return httpInstance.post(
    `${baseRoute}/GetLogs`,
    params
  ) as Promise<DeveloperLogsResponse>;
};
export const getCrons = async () => {
  return httpInstance.get(
    `${baseRoute}/GetCrons`
  ) as Promise<CronTypesResponse>;
};
export const getCronLogs = async (params: CronLogsFilterPayload) => {
  return httpInstance.post(
    `${baseRoute}/GetCronLogs`,
    params
  ) as Promise<CronLogsResponse>;
};
export const runCron = async (payload: unknown) => {
  return httpInstance.post(`${baseRoute}/RunCron`, payload) as Promise<string>;
};
