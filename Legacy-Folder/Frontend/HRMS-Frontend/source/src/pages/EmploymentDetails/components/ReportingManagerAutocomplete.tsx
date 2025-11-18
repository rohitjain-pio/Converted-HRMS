import {
  Autocomplete,
  CircularProgress,
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
import { getFullName } from "@/utils/getFullName";
import { Controller, useFormContext } from "react-hook-form";

type ReportingManagerType = {
  id: number;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

type ReportingManagerAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
};

const ReportingManagerAutocomplete = (
  props: ReportingManagerAutocompleteProps
) => {
  const { label, name = "reportingManagerId", required, placeholder } = props;
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [reportingManagerList, setReportingManagerList] = useState<
    ReportingManagerType[]
  >([]);

  const { execute: fetchReportingManagers, isLoading } = useAsync<
    GetReportingManagerListResponse,
    string | undefined
  >({
    requestFn: async (
      name?: string
    ): Promise<GetReportingManagerListResponse> => {
      return await getReportingManagers({ name });
    },
    onSuccess: ({ data }) => {
      setReportingManagerList(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchReportingManagers();
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
              options={reportingManagerList}
              getOptionLabel={(option) => getFullName(option)}
              value={
                reportingManagerList.find(
                  (designation) => designation.id.toString() === String(value)
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

export default ReportingManagerAutocomplete;
