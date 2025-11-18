import {
  Box,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  StandardTextFieldProps,
  TextField,
  styled,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import LabelValue from "@/components/LabelValue";
import { ChangeEvent, useEffect } from "react";

interface FormPhoneFieldProps extends StandardTextFieldProps {
  name: string;
  label: string;
  readOnly?: boolean;
  textFormat?: boolean;
}

const CustomTextFeild = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-adornedStart": {
    color: theme.palette.common.black,
    paddingLeft: "0px",
  },
}));

const FormPhoneField = ({
  name,
  textFormat,
  label,
  required,
  ...rest
}: FormPhoneFieldProps) => {
  const { control, getValues, watch, setValue } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);

  const countryCodes = [
    { code: "", label: "" },
    { code: "+1", label: "USA" },
    { code: "+91", label: "India" },
  ];

  const watchedValue = watch(name, fieldValue);

  useEffect(() => {
    setValue(name, watchedValue);
  }, [watchedValue, setValue, name]);

  const handlePhoneNumberChange =
    (onChange: (value: string) => void) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const phoneNumber = e.target.value;
      const countryCode = fieldValue.split(" ")[0];
      onChange(`${countryCode} ${phoneNumber}`);
    };

  const handleCountryCodeChange =
    (onChange: (value: string) => void) =>
    (e: { target: { value: string } }) => {
      const countryCode = e.target.value;
      const phoneNumber = fieldValue.split(" ")[1] || "";
      onChange(`${countryCode} ${phoneNumber}`);
    };

  return (
    <Box sx={{ minWidth: 150, width: "100%" }}>
      {textFormat ? (
        <LabelValue label={label} value={fieldValue} />
      ) : (
        <Controller
          control={control}
          name={name}
          render={({ field: { value, onChange } }) => (
            <>
              <Box sx={{ display: "flex" }}>
                <CustomTextFeild
                  value={value.split(" ")[1] || ""}
                  variant="outlined"
                  error={error.isError}
                  placeholder="Phone number"
                  label={required ? `${label}*` : label}
                  onChange={handlePhoneNumberChange(onChange)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ marginLeft: "0px" }}
                      >
                        <Select
                          value={value.split(" ")[0]}
                          onChange={handleCountryCodeChange(onChange)}
                        >
                          {countryCodes.map((option) => (
                            <MenuItem key={option.code} value={option.code}>
                              {option.code || "\u200b"}
                            </MenuItem>
                          ))}
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: "100%" }}
                  {...rest}
                />
              </Box>
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

export default FormPhoneField;
