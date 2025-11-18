export type TResponse<T> = {
  statusCode: number;
  message: string;
  result: T;
};
export type TRequest = {
  accessToken: string;
  refreshToken: string;
};
