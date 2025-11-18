/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpInstance } from "@/api/httpInstance";
import { TRequest, TResponse } from "@/services/RefreshToken/types";

const baseRoute = "/Auth";

export const getRefreshToken = async (args: TRequest) => {
  return httpInstance.post<TResponse<any>>(`${baseRoute}/RefreshToken`, args);
};
