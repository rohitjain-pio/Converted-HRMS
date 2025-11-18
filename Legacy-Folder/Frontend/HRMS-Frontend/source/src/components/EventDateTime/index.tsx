import { FormControl, FormHelperText } from "@mui/material";
import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import moment, { Moment } from "moment";
import LabelValue from "@/components/LabelValue";

interface EventDateTimePickerProps extends DateTimePickerProps<Moment> {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  textFormat?: boolean;
  handleChange?: (date:  moment.Moment | null)=>void; 
}

const EventDateTimePicker = (props: EventDateTimePickerProps) => {
  const {
    label,
    name,
    required,
    placeholder,
    textFormat,
    handleChange = function () {},
    ...restProps
  } = props;
  const { control, getValues } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);
  const formattedValue = fieldValue
    ? moment(fieldValue).format("MMM Do YYYY, hh:mm A")
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
                <DateTimePicker
                  {...field}
                  label={required ? `${label}*` : label}
                  onChange={(date)=>handleChange(date)}
                  slotProps={{
                    textField: {
                      error: error.isError,
                      placeholder: placeholder,
                      onKeyDown: (event) => event.preventDefault(),
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

export default EventDateTimePicker;
