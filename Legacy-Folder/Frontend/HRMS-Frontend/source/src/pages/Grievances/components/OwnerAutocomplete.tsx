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
import { getReportingManagers } from "@/services/EmploymentDetails/employmentDetailsService";
import { useEffect, useState } from "react";
import { useFieldError } from "@/hooks/useFieldError";
import { Controller, useFormContext } from "react-hook-form";
import methods from "@/utils";

type UserType = {
  id: number;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

type OwnerAutocompleteProps = {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const OwnerAutocomplete = ({
  label,
  name,
  required,
  placeholder,
  disabled,
}: OwnerAutocompleteProps) => {
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [userList, setUserList] = useState<UserType[]>([]);

  const { execute: fetchUsers, isLoading } = useAsync<
    GetReportingManagerListResponse,
    string | undefined
  >({
    requestFn: async (name?: string) => {
      return await getReportingManagers({ name });
    },
    onSuccess: ({ data }) => {
      setUserList(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const filterOptions = createFilterOptions<UserType>({
    stringify: (opt) => `${opt.firstName} ${opt.lastName} ${opt.email}`,
  });

  useEffect(() => {
    fetchUsers();
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
              options={userList}
              filterOptions={filterOptions}
              limitTags={1}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} (${option.email})`
              }
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              value={userList.filter((user) =>
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
                  InputProps={{
                   
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
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

export default OwnerAutocomplete;
