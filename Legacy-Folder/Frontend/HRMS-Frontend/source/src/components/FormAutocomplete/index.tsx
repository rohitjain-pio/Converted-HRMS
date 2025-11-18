import {
  Autocomplete,
  AutocompleteProps,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";

interface FormAutocompleteProps<T>
  extends AutocompleteProps<
    T,
    boolean | undefined,
    boolean | undefined,
    boolean | undefined
  > {
  name: string;
}

const FormAutocomplete = <T = unknown>(props: FormAutocompleteProps<T>) => {
  const { name, ...restProps } = props;
  const { control } = useFormContext();
  const error = useFieldError(name);
  return (
    <FormControl
      fullWidth
      sx={{ minWidth: 150, width: "100%" }}
      error={error.isError}
    >
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <>
            <Autocomplete
              value={value}
              onChange={(_, value) => {
                onChange(value);
              }}
              {...restProps}
            />
            {error.isError && (
              <FormHelperText error sx={{ marginLeft: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
    </FormControl>
  );
};

export default FormAutocomplete;
