import { FormProvider, SubmitHandler, UseFormReturn } from "react-hook-form";
import { FormValues } from "./validationSchema";
import Stack from "@mui/material/Stack";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import Box from "@mui/material/Box";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import FormTextField from "@/components/FormTextField";
import UserGuideMenuFormSelect from "../components/UserGuideMenuSelect";
import UserGuideStatusSelect from "../components/UserGuideStatusSelect";
import LabelValue from "@/components/LabelValue";
import FormRichTextEditor from "@/components/RichTextEditor/FormRichTextEditor";
import { editorConfig } from "./editorConfig";
import { FormMode } from "@/utils/constants";

type Props = {
  method: UseFormReturn<FormValues>;
  onSubmit: SubmitHandler<FormValues>;
  mode: FormMode;
  isSubmitting: boolean;
};

const UserGuideForm = (props: Props) => {
  const { onSubmit, method, mode, isSubmitting } = props;

  const { handleSubmit } = method;

  return (
    <FormProvider<FormValues> {...method}>
      <Stack
        component="form"
        autoComplete="off"
        padding="30px"
        gap="30px"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInputGroup>
          <FormInputContainer>
            <FormTextField name="title" label="Title" required />
          </FormInputContainer>
          <FormInputContainer>
            <UserGuideMenuFormSelect
              name="menuId"
              label="Menu"
              disabled={mode === FormMode.Edit}
              required
            />
          </FormInputContainer>
          <FormInputContainer>
            <UserGuideStatusSelect name="status" label="Status" required />
          </FormInputContainer>
        </FormInputGroup>

        <FormInputGroup>
          <FormInputContainer md={12}>
            <Box mb={1}>
              <LabelValue label="Content" value={undefined} />
            </Box>
            <FormRichTextEditor name="content" editorConfig={editorConfig} />
          </FormInputContainer>
        </FormInputGroup>

        <Stack direction="row" gap="15px" justifyContent="center">
          <SubmitButton loading={isSubmitting} />
          <ResetButton />
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default UserGuideForm;
