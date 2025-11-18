import Grid from "@mui/material/Grid2";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ResetButton from "@/components/ResetButton/ResetButton";

import FormTextField from "@/components/FormTextField";
import FormSelectField from "@/components/FormSelectField";
import { forwardRef, useImperativeHandle } from "react";
import { FilterFormProps } from "@/pages/Email/type";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { Stack } from "@mui/material";
import EmailTemplateAutocomplete from "./EmailTemplateAutoComplete";
import { EMAIL_TEMPLATE_OPTIONS } from "@/utils/constants";

const validationSchema = Yup.object().shape({
  templateName: Yup.string(),
  templateType: Yup.mixed<string>().nullable(),
  senderName: Yup.string(),
  senderEmail: Yup.string(),
  status: Yup.mixed<string>().nullable(),
});

type FormData = Yup.InferType<typeof validationSchema>;

const statusOptions = [
  { id: 1, name: "Active" },
  { id: 0, name: "Inactive" },
  { id: 2, name: "Default" },
];

export type FilterFormHandle = {
  handleReset: () => void;
};

const FilterForm = forwardRef<FilterFormHandle, FilterFormProps>(
  ({ onSearch }, ref) => {
    const method = useForm<FormData>({
      resolver: yupResolver(validationSchema),
      defaultValues: {
        templateName: "",
        templateType: "",
        senderName: "",
        senderEmail: "",
        status: "",
      },
    });

    const { handleSubmit, reset } = method;

    const onSubmit: SubmitHandler<FormData> = (data) => {
      onSearch({
        templateName: data.templateName ?? "",
        templateType:Number( data.templateType) ?? null,
        senderName: data.senderName ?? "",
        senderEmail: data.senderEmail ?? "",
        status: Number(data.status),
      });
      
    };

    const handleReset = () => {
      reset();
      onSearch({
        templateName: "",
        templateType: null,
        senderName: "",
        senderEmail: "",
        status: null
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        handleReset,
      }),
      [handleReset]
    );

    return (
      <FormProvider {...method}>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormTextField name="templateName" label="Template Name" />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <EmailTemplateAutocomplete
                name="templateType"
                label="Template Type"
                templateType={EMAIL_TEMPLATE_OPTIONS}
               
              />
            </Grid>
           <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormTextField name="senderName" label="Sender Name" />
            </Grid>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormTextField name="senderEmail" label="Sender Email" />
            </Grid>
           <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <FormSelectField
                name="status"
                label="Status"
                options={statusOptions}
                valueKey="id"
                labelKey="name"
              />
            </Grid>
           <Grid size={12} sx={{ pt: 2 }}>
              <Stack direction="row" sx={{ gap: 2, justifyContent: "center" }}>
                <SubmitButton />
                <ResetButton onClick={handleReset} />
              </Stack>
            </Grid>
            
          </Grid>
        </form>
      </FormProvider>
    );
  }
);

export default FilterForm;