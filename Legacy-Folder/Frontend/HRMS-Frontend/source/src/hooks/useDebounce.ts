import { useState, useEffect, useRef } from "react";

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const refMounted = useRef(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (refMounted.current) {
        setDebouncedValue(value);
      }
    }, delay);

    refMounted.current = true;

    return () => {
      refMounted.current = false;
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
