import {
  Box,
  FormHelperText,
  StandardTextFieldProps,
  TextField,
  Link
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import moment from "moment";
import { useFieldError } from "@/hooks/useFieldError";
import LabelValue from "@/components/LabelValue";
import InsertLinkIcon from "@mui/icons-material/InsertLink";

interface FormTextFieldProps extends StandardTextFieldProps {
  name: string;
  label: string;
  readOnly?: boolean;
  textFormat?: boolean;
}

const FormUrlField = ({
  name,
  placeholder,
  multiline,
  readOnly,
  textFormat,
  label,
  required,
  type,
  ...rest
}: FormTextFieldProps) => {
  const { control, getValues, watch } = useFormContext();
  const error = useFieldError(name);
  const fieldValue = getValues(name);
  const formattedValue =
    type === "date" && fieldValue ? moment(fieldValue).format("MMM Do,YYYY") : fieldValue;

  function isValidUrl(url: string){
    const linkedInProfileRegex = /(https?:\/\/)?(www\.)?linkedin\.([a-z]+)\/in\/([A-Za-z0-9_-]+)\/?/;
    if(linkedInProfileRegex.test(url) ){
      return true;
    }
    return false;
  }

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
                  input: {
                    endAdornment: (
                      <>
                        {watch("linkedInUrl") && isValidUrl(watch("linkedInUrl")) ? (
                          <Link
                            target="_blank"
                            rel="noopener"
                            href={watch("linkedInUrl")}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              marginRight: "-4px",
                            }}
                          >
                            <InsertLinkIcon />
                          </Link>
                        ) : null}
                      </>
                    ),
                  },

                  htmlInput: { readOnly }
                }} />
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

export default FormUrlField;
