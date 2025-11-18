import { useMemo } from "react";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  GetAllGrievanceTypeList,
  getGrievanceTypeList,
 
} from "@/services/Grievances";
import {
  FormControl,
  Autocomplete,
  TextField,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";

type GrievanceTypeSelectProps = {
  name: string;
  label: string;
  isEditable?: boolean;
  required?: boolean;
};

const GrievanceTypeSelect = (props: GrievanceTypeSelectProps) => {
  const { name, label, required } = props;

  const { data, isLoading } = useAsync<GetAllGrievanceTypeList>({
    requestFn: async (): Promise<GetAllGrievanceTypeList> => {
      return await getGrievanceTypeList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const error = useFieldError(name);
  const { control } = useFormContext();
  const options = useMemo(() => data?.result?.grievanceList || [], [data]);

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
              options={options}
              getOptionLabel={(option) => option.grievanceName}
              value={
                options.find((grievance) => grievance.id.toString() === String(value)) ??
                null
              }
              onChange={(_event, value) => {
                onChange(value ? value.id.toString() : "");
              }}
              slotProps={{
                listbox: {
                  style: {
                    maxHeight: 4 * 48,
                    overflowY: "auto",
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  error={error.isError}
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
                    },
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

export default GrievanceTypeSelect;
