import { useState, useEffect, useCallback } from "react";
import { AxiosError, AxiosResponse } from "axios";

type UseAxiosFunction<T, P = void> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestFn: (params: P) => Promise<AxiosResponse<T> | any>;
  onSuccess?: (response: AxiosResponse<T>, params?: P) => void;
  onError?: (error: AxiosError) => void;
  autoExecute?: boolean;
  defaultParams?: P; // Optional default params for auto execution
};

type UseAxiosResult<T, P = void> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (params?: P) => Promise<void>;
};

const useAsync = <T, P = void>({
  requestFn,
  onSuccess,
  onError,
  autoExecute = false,
  defaultParams,
}: UseAxiosFunction<T, P>): UseAxiosResult<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (params?: P) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await requestFn(params!);
        setData(response.data);

        if (onSuccess) {
          onSuccess(response, params);
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError.message);

        if (onError) {
          onError(axiosError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [requestFn, onSuccess, onError]
  );

  useEffect(() => {
    if (autoExecute) {
      execute(defaultParams);
    }
  }, [autoExecute]);

  return { data, error, isLoading, execute };
};

export default useAsync;
