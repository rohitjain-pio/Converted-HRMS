import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

export const useFieldError = (name: string) => {
  const { formState } = useFormContext();

  const error = useMemo(() => {
    if (name.includes(".")) {
      const fieldNames: string[] = name.split(".");
      const errors = formState.errors;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parentError: any = errors?.[fieldNames[0]];
      const errorMessage = parentError?.[fieldNames[1]];

      return errorMessage;
    }

    return formState.errors?.[name];
  }, [formState, name]);

  return { isError: !!error, message: error?.message as string };
};
