import {
  FormControl,
  Autocomplete,
  TextField,
  FormHelperText,
} from "@mui/material";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";

type EmailTemplateTypeProps = {
  name: string;
  label: string;
  isEditable?: boolean;
  templateType: {
    id: string;
    name: string;
  }[];
  required?: boolean;
  disabled?: boolean;
};

const EmailTemplateTypeAutoComplete = ({
  name,
  label,
  required,
  templateType,
  disabled,
}: EmailTemplateTypeProps) => {
  const error = useFieldError(name);
  const { control } = useFormContext();

  // Use templateType directly as options
  const options = useMemo(() => templateType || [], [templateType]);

  return (
    <FormControl fullWidth sx={{ minWidth: 150 }} error={error.isError}>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <>
            <Autocomplete
              options={options}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={options.find((item) => item.id === String(value)) ?? null}
              onChange={(_event, selected) => {
                onChange(selected ? selected.id : null);
              }}
              disabled={disabled}
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
                      endAdornment: <>{params.InputProps.endAdornment}</>,
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

export default EmailTemplateTypeAutoComplete;
