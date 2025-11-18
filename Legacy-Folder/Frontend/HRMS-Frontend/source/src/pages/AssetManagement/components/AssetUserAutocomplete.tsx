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

type AssetUserType = {
  id: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
};

type AssetUserAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const AssetUserAutocomplete = ({
  label,
  name = "assetUserId",
  required,
  placeholder,
  disabled,
}: AssetUserAutocompleteProps) => {
  const error = useFieldError(name);
  const { control } = useFormContext();

  const { execute: fetchAssetUsers, isLoading } = useAsync<
    GetReportingManagerListResponse,
    string | undefined
  >({
    requestFn: async (name?: string) => {
      return await getReportingManagers({ name });
    },
    onSuccess: ({ data }) => {
      setAssetUserList(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const [assetUserList, setAssetUserList] = useState<AssetUserType[]>([]);

  const filterOptions = createFilterOptions<AssetUserType>({
    stringify: (opt) => `${opt.firstName} ${opt.lastName} ${opt.email}`,
  });

  useEffect(() => {
    fetchAssetUsers();
  }, []);

  return (
    <FormControl fullWidth error={error.isError} sx={{ minHeight: 40 }}>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => {
          const selectedUser =
            value != null
              ? assetUserList.find((user) => user.id === Number(value))
              : null;

          return (
            <>
              <Autocomplete
                options={assetUserList}
                filterOptions={filterOptions}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName} (${option.email})`
                }
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={selectedUser || null}
                onChange={(_event, selected) => {
                  onChange(selected ? selected.id.toString() : null);
                }}
                disabled={disabled}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={required ? `${label}*` : label}
                    placeholder={placeholder}
                    error={error.isError}
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
                      },
                    }}
                  />
                )}
              />
              {error.isError && (
                <FormHelperText>{error.message}</FormHelperText>
              )}
            </>
          );
        }}
      />
    </FormControl>
  );
};

export default AssetUserAutocomplete;
