import { FormControl, FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";
import { EditorConfig } from "ckeditor5";

type FormTextEditor = {
  name: string;
  editorConfig: EditorConfig;
  readOnly?: boolean;
};

const FormRichTextEditor = (props: FormTextEditor) => {
  const { name, editorConfig, readOnly } = props;
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
            <RichTextEditor
              {...field}
              editorConfig={editorConfig}
              readOnly={readOnly}
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
  );
};

export default FormRichTextEditor;
