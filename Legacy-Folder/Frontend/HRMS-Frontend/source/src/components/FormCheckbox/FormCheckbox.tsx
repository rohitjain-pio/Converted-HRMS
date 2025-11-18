import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  StandardTextFieldProps
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import LabelValue from "@/components/LabelValue";

interface FormCheckboxProps extends StandardTextFieldProps {
  name: string;
  label: string;
  readOnly?: boolean;
  textFormat?: boolean;
}

const FormCheckbox = ({
  name,
  readOnly,
  label,
  required,
  textFormat,
}: FormCheckboxProps) => {
  const { control, getValues } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);
  const formattedValue = fieldValue ? "Yes" : "No";

  return (
    <Box sx={{ minWidth: 150, width: "100%" }}>
      {textFormat ? (
        <LabelValue label={label} value={formattedValue} />
      ) : (
        <FormControl
          fullWidth
          style={{ marginLeft: 8 }}
          error={error.isError}
        >
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      disabled={readOnly}
                    />
                  }
                  labelPlacement="end"
                  label={required ? `${label}*` : label}
                />
                {error.isError && (
                  <FormHelperText error sx={{ marginLeft: 0 }}>
                    {error.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </FormControl>
      )}
    </Box>
  );
};

export default FormCheckbox;
