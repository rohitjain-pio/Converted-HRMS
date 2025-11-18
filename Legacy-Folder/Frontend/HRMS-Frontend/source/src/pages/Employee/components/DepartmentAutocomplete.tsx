import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import { useEffect, useState } from "react";
import {
  DepartmentType,
  getDepartmentList,
  GetDepartmentListResponse,
} from "@/services/Employees";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";

type DepartmentAutocompleteProps = {
  label?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
};

const DepartmentAutocomplete = (props: DepartmentAutocompleteProps) => {
  const {
    label = "Department",
    name = "departmentId",
    required,
    placeholder,
  } = props;

  const error = useFieldError(name);
  const { control } = useFormContext();
  const [departmentList, setDepartmentList] = useState<DepartmentType[]>([]);

  const { execute: fetchDepartmentList, isLoading } =
    useAsync<GetDepartmentListResponse>({
      requestFn: async (): Promise<GetDepartmentListResponse> => {
        return await getDepartmentList();
      },
      onSuccess: ({ data }) => {
        const { result } = data;
        setDepartmentList(result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  useEffect(() => {
    fetchDepartmentList();
  }, []);

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
              options={departmentList}
              getOptionLabel={(option) => option.name}
              value={
                departmentList.find(
                  (department) => department.id.toString() === value.toString()
                ) ?? null
              }
              onChange={(_event, value) => {
                onChange(value ? value.id.toString() : "");
              }}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    sx={{ width: "100%" }}
                    error={error.isError}
                    placeholder={placeholder}
                    label={required ? `${label}*` : label}
                    slotProps={{
                      input: {
                        style: { height: 41.13 },
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }
                    }}
                  />
                );
              }}
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

export default DepartmentAutocomplete;
