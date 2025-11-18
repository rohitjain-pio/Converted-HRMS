import { useEffect, useState } from "react";
import useAsync from "@/hooks/useAsync";
import {
  DesignationType,
  getDesignationList,
  GetDesignationListResponse,
} from "@/services/User";
import methods from "@/utils";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useFieldError } from "@/hooks/useFieldError";
import { Controller, useFormContext } from "react-hook-form";

type DesignationAutocompleteProps = {
  label?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
};

const DesignationAutocomplete = (props: DesignationAutocompleteProps) => {
  const {
    label = "Designation",
    name = "designationId",
    required,
    placeholder,
  } = props;

  const error = useFieldError(name);
  const { control } = useFormContext();
  const [designationList, setDesignationList] = useState<DesignationType[]>([]);

  const { execute: fetchDesignationList, isLoading } =
    useAsync<GetDesignationListResponse>({
      requestFn: async (): Promise<GetDesignationListResponse> => {
        return await getDesignationList();
      },
      onSuccess: ({ data }) => {
        const { result } = data;
        setDesignationList(result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  useEffect(() => {
    fetchDesignationList();
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
              options={designationList}
              getOptionLabel={(option) => option.name}
              value={
                designationList.find(
                  (designation) =>
                    designation.id.toString() === value.toString()
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

export default DesignationAutocomplete;
