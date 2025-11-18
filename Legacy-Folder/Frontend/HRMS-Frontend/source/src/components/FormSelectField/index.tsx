import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormHelperText,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import LabelValue from "@/components/LabelValue";

type OptionType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | number]: any;
};

interface FormSelectFieldProps {
  label: string;
  name: string;
  options: OptionType[];
  readOnly?: boolean;
  disabled?: boolean;
  textFormat?: boolean;
  required?: boolean;
  labelKey?: string;
  valueKey?: string;
  defaultValue?: string;
}

const FormSelectField = ({
  label,
  name,
  options,
  readOnly,
  textFormat,
  labelKey = "label",
  valueKey = "value",
  disabled,
  required,
  defaultValue,
}: FormSelectFieldProps) => {
  const { control, getValues } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);
  const formattedValue = options?.find(
    (option) => option[valueKey] == fieldValue
  )?.[labelKey];

  return (
    <FormControl
      fullWidth
      sx={{ minWidth: 150, width: "100%" }}
      error={error.isError}
    >
      {textFormat ? (
        <LabelValue label={label} value={formattedValue || ""} />
      ) : (
        <>
          <InputLabel >
            {required ? `${label}*` : label}
          </InputLabel>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <>
                <Select
                  defaultValue={defaultValue}
                  id={name}
                  {...field}
                  readOnly={readOnly}
                  disabled={disabled}
                >
                  {options?.map((option) => (
                    <MenuItem key={option[valueKey]} value={option[valueKey]}>
                      {option[labelKey]}
                    </MenuItem>
                  ))}
                </Select>
                {error.isError && (
                  <FormHelperText error sx={{ marginLeft: 0 }}>
                    {error.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </>
      )}
    </FormControl>
  );
};

export default FormSelectField;
