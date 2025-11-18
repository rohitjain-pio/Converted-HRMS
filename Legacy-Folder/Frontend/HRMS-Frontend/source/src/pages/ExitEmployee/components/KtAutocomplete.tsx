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

type KTUserType = {
  id: number;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

type KTUserAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const KTUserAutocomplete = ({
  label,
  name = "ktUserIds", 
  required,
  placeholder,
  disabled,
}: KTUserAutocompleteProps) => {
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [ktUserList, setKTUserList] = useState<KTUserType[]>([]);

  const { execute: fetchKTUsers, isLoading } = useAsync<
    GetReportingManagerListResponse,
    string | undefined
  >({
    requestFn: async (name?: string) => {
      return await getReportingManagers({ name }); // Reusing existing API
    },
    onSuccess: ({ data }) => {
      setKTUserList(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const filterOptions = createFilterOptions<KTUserType>({
    stringify: (opt) => `${opt.firstName} ${opt.lastName} ${opt.email}`,
  });

  useEffect(() => {
    fetchKTUsers();
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
              options={ktUserList}
              filterOptions={filterOptions}
              limitTags={2}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} (${option.email})`
              }
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              value={ktUserList.filter((user) =>
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
                    }
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

export default KTUserAutocomplete;
