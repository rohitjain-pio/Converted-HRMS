import { FormControl, FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import TextEditor from "@/pages/Email/components/FormTextEditor/TextEditor";

type FormTextEditor = {
  name: string;
  isReadOnly?: boolean;
};

const FormTextEditor = (props: FormTextEditor) => {
  const { name, isReadOnly } = props;
  const { control } = useFormContext();
  const error = useFieldError(name);

  return (
    <FormControl
      fullWidth
      sx={{ minWidth: 150, width: "100%" }}
      error={error.isError}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <TextEditor {...field} isReadOnly={isReadOnly} />
            {error.isError && (
              <FormHelperText error sx={{ marginLeft: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
    </FormControl>
  );
};

export default FormTextEditor;
