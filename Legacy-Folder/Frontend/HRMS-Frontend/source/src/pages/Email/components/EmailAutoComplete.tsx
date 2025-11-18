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
import methods from "@/utils";
import { useEffect, useState } from "react";
import { useFieldError } from "@/hooks/useFieldError";
import { Controller, useFormContext } from "react-hook-form";

export interface EmailUser {
  email: string;
}

type EmailAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

const EmailAutocomplete = ({
  label,
  name = "emailList",
  required,
 disabled,
}: EmailAutocompleteProps) => {
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [userList, setUserList] = useState<EmailUser[]>([]);

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

  const filterOptions = createFilterOptions<EmailUser>({
    stringify: (opt) => `${opt.email} `,
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
              limitTags={2}
              getOptionLabel={(option) => option.email}
              isOptionEqualToValue={(option, value) => {
                return (
                  option.email ===
                  (typeof value === "string" ? value : value.email)
                );
              }}
              value={[
                ...userList.filter((user) => value.includes(user.email)),
                ...value
                  .filter(
                    (email: string) =>
                      typeof email === "string" &&
                      !userList.some((user) => user.email === email)
                  )
                  .map((email: string) => ({ email })),
              ]}
              onChange={(_event, selected) =>
                onChange(selected.map((user) => user.email))
              }
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={required ? `${label}*` : label}
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
                    }
                  }}
                />
              )}
              slotProps={{
                listbox: {
                  style: {
                    maxHeight: 160,
                  },
                }
              }}
            />
            {error.isError && <FormHelperText>{error.message}</FormHelperText>}
          </>
        )}
      />
    </FormControl>
  );
};

export default EmailAutocomplete;
