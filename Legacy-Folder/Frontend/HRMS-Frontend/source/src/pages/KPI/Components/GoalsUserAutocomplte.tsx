import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import useAsync from "@/hooks/useAsync";
import { GetReportingManagerListResponse } from "@/services/EmploymentDetails";
import methods from "@/utils";
import { useEffect, useState } from "react";
import { useFieldError } from "@/hooks/useFieldError";
import { Controller, useFormContext } from "react-hook-form";
import { getEmployeesByManager } from "@/services/KPI";

type GoalsUserType = {
  id: number;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

type GoalsUserAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const GoalsUserAutocomplete = ({
  label,
  name = "goalsUserIds",
  required,
  placeholder,
  disabled,
}: GoalsUserAutocompleteProps) => {
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [goalsUserList, setGoalsUserList] = useState<GoalsUserType[]>([]);

  const { execute: fetchGoalsUsers, isLoading } = useAsync<
    GetReportingManagerListResponse,
    string | undefined
  >({
    requestFn: async (name?: string) => {
      return await getEmployeesByManager({ name });
    },
    onSuccess: ({ data }) => {
      setGoalsUserList(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const filterOptions = createFilterOptions<GoalsUserType>({
    stringify: (opt) => `${opt.firstName} ${opt.lastName} ${opt.email}`,
  });

  useEffect(() => {
    fetchGoalsUsers();
  }, []);

  return (
    <FormControl fullWidth error={error.isError}>
      <Controller
        control={control}
        name={name}
        render={({ field: { value = [], onChange } }) => (
          <>
            <Autocomplete
              multiple
              options={goalsUserList}
              filterOptions={filterOptions}
              limitTags={2}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} (${option.email})`
              }
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              value={goalsUserList.filter((user) =>
                value.includes(user.id.toString())
              )}
              onChange={(_event, selected) =>
                onChange(selected.map((user) => user.id.toString()))
              }
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={required ? `${label}*` : label}
                  placeholder={placeholder}
                  error={error.isError}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            {error.isError && <FormHelperText>{error.message}</FormHelperText>}
          </>
        )}
      />
    </FormControl>
  );
};

export default GoalsUserAutocomplete;
