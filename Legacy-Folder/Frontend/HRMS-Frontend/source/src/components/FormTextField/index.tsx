import {
  Box,
  FormHelperText,
  StandardTextFieldProps,
  TextField,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import moment from "moment";
import { useFieldError } from "@/hooks/useFieldError";
import LabelValue from "@/components/LabelValue";

interface FormTextFieldProps extends StandardTextFieldProps {
  name: string;
  label: string;
  readOnly?: boolean;
  textFormat?: boolean;
  maxLength?: number;
}

const FormTextField = ({
  name,
  placeholder,
  multiline,
  readOnly,
  textFormat,
  label,
  maxLength,
  required,
  type,
  ...rest
}: FormTextFieldProps) => {
  const MAX_LENGTH_OFFSET = maxLength ? Math.floor(maxLength * 0.1) : 0;
  const { control, getValues, watch } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);
  const value = watch(name) || "";
  const formattedValue =
    type === "date" && fieldValue
      ? moment(fieldValue).format("MMM Do,YYYY")
      : fieldValue;

  return (
    <Box sx={{ minWidth: 150, width: "100%" }}>
      {textFormat ? (
        <LabelValue label={label} value={formattedValue} />
      ) : (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <>
              <TextField
                {...field}
                variant="outlined"
                error={error.isError}
                placeholder={placeholder}
                multiline={multiline}
                rows={5}
                label={required ? `${label}*` : label}
                type={type}
                sx={{ width: "100%" }}
                {...rest}
                slotProps={{
                  htmlInput: {
                    readOnly,
                    ...(maxLength ? { maxLength } : {}),
                  },
                }}
              />
              {maxLength && (
                <Box
                  sx={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: (theme) =>
                      value.length > maxLength - MAX_LENGTH_OFFSET
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                    mt: 0.4,
                  }}
                >
                  {value.length}/{maxLength}
                </Box>
              )}

              {error.isError && (
                <FormHelperText error sx={{ marginLeft: 0 }}>
                  {error.message}
                </FormHelperText>
              )}
            </>
          )}
        />
      )}
    </Box>
  );
};

export default FormTextField;
