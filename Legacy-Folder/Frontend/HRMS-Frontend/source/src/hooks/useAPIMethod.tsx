/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';
import { AxiosResponse } from 'axios';
type TApiMethod<T> = () => Promise<AxiosResponse<T, any>>;

const useAPIMethod = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async <T,>(api: TApiMethod<T>) => {
    try {
      setIsLoading(true);
      const res = await api();
      setError(null);
      return res.data;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { callApi, isLoading, error };
};
export default useAPIMethod;
