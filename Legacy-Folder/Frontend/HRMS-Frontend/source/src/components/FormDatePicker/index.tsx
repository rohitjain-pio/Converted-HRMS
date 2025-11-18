import { FormControl, FormHelperText } from "@mui/material";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import moment, { Moment } from "moment";
import LabelValue from "@/components/LabelValue";

interface FormDatePickerProps extends DatePickerProps<Moment> {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  textFormat?: boolean;
}

const FormDatePicker = (props: FormDatePickerProps) => {
  const {
    label,
    name,
    required,
    placeholder,
    textFormat,
    ...restProps
  } = props;
  const { control, getValues } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);
  const formattedValue = fieldValue
    ? moment(fieldValue).format("MMM Do, YYYY")
    : "";
  return (
    <FormControl
      fullWidth
      sx={{ minWidth: 150, width: "100%" }}
      error={error.isError}
    >
      {textFormat ? (
        <LabelValue label={label} value={formattedValue} />
      ) : (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  {...field}
                  label={required ? `${label}*` : label}
                  slotProps={{
                    textField: {
                      error: error.isError,
                      placeholder: placeholder,
                      onKeyDown: (event)=> event.preventDefault()
                    },
                    field: { clearable: true },
                  }}
                  {...restProps}
                />
              </LocalizationProvider>
              {error.isError && (
                <FormHelperText error sx={{ marginLeft: 0 }}>
                  {error.message}
                </FormHelperText>
              )}
            </>
          )}
        />
      )}
    </FormControl>
  );
};

export default FormDatePicker;
