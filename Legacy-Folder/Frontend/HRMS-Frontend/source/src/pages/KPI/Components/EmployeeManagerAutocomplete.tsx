import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import { useEffect, useState } from "react";

import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import {
  getEmployeesByManager,
  GetEmployeesByManagerResponse,
} from "@/services/KPI";
import { getFullName } from "@/utils/getFullName";

type EmployeeManagerAutocompleteProps = {
  label?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
};
type EmployeeManagerType = {
  id: number;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
};
const EmployeeManagerAutocomplete = (
  props: EmployeeManagerAutocompleteProps
) => {
  const {
    label = "Employee Manager",
    name = "employeeId",
    required,
    placeholder,
  } = props;

  const error = useFieldError(name);
  const { control } = useFormContext();
  const [employeeList, setEmployeeList] = useState<EmployeeManagerType[]>([]);

  const { execute: fetchEmployees, isLoading } = useAsync<
    GetEmployeesByManagerResponse,
    string
  >({
    requestFn: async (
      name?: string
    ): Promise<GetEmployeesByManagerResponse> => {
      return await getEmployeesByManager({ name });
    },
    onSuccess: ({ data }) => {
      const { result } = data;
      setEmployeeList(result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getOptionLabel = (option: EmployeeManagerType) =>
    `${getFullName({
      firstName: option.firstName,
      middleName: option.middleName,
      lastName: option.lastName,
    })} (${option.email})`;

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
              options={employeeList}
              getOptionLabel={getOptionLabel}
              value={
                employeeList.find(
                  (employee) =>
                    employee.id.toString() === (value ? value.toString() : "")
                ) ?? null
              }
              onChange={(_event, value) => {
                onChange(value ? value.id.toString() : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  error={error.isError}
                  placeholder={placeholder}
                  label={required ? `${label}*` : label}
                  InputProps={{
                    ...params.InputProps,
                    style: { height: 41.13 },
                    endAdornment: (
                      <>
                        {isLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {error.isError && (
              <FormHelperText error sx={{ ml: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
    </FormControl>
  );
};

export default EmployeeManagerAutocomplete;
