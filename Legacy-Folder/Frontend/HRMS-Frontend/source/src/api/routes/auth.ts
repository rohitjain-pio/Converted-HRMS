/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpInstance } from '@/api/httpInstance';

const baseRoute = '/Auth';
const API_KEY = "X3nvZJ7pQe5tKuL9Bd1aH8yWOm4Cx6Tf";

declare type TResponse<T> = {
  statusCode: number;
  message: string;
  result: T;
};

const login = (payload: any) => {
  return httpInstance.post<TResponse<any>>(`${baseRoute}`, payload);
};

const internalUserLogin = (payload: any) => {
  return httpInstance.post<TResponse<any>>(`${baseRoute}/Login`, payload, {headers: {"X-API_KEY": API_KEY}});
};

export default {
  login,
  internalUserLogin,
};
