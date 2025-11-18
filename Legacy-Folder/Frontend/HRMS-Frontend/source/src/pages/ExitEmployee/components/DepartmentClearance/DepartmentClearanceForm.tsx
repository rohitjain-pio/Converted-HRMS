import { Box, Stack } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { GetDepartmentClearanceByResignationId } from "@/services/EmployeeExitAdmin";
import { defaultValues, Kt_Status_Options, KTFormValues } from "./utils";
import ViewDocument from "../ViewDocument";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import KTUserAutocomplete from "../KtAutocomplete";
import { useEffect } from "react";

type DepartmentClearanceFormProps = {
  editable: boolean | undefined;
  departmentData?: GetDepartmentClearanceByResignationId | undefined;
  isSaving: boolean;
  fetchLoading: boolean;
  onSubmit: (data: KTFormValues) => void;
};

export default function DepartmentClearanceForm({
  editable,
  departmentData,
  isSaving,
  fetchLoading,
  onSubmit,
}: DepartmentClearanceFormProps) {
  const method = useForm<KTFormValues>({
    defaultValues,
  });
  const { handleSubmit, reset } = method;

  useEffect(() => {
    reset({
      ktStatus: departmentData ? String(departmentData.ktStatus) : "1",
      notes: departmentData ? departmentData.ktNotes : "",
      ktUser: departmentData ? departmentData.ktUsers.map(String) : [],
      departmentAttachment: null,
    });
  }, [departmentData]);
  return (
    <>
      <FormProvider {...method}>
        <Box
          component="form"
          padding="30px"
          display="flex"
          flexDirection="column"
          gap={4}
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInputGroup>
            <FormInputContainer md={4}>
              <FormSelectField
                label="KT Status"
                name="ktStatus"
                valueKey="id"
                labelKey="label"
                options={Kt_Status_Options}
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>

          <FormInputGroup>
            <FormInputContainer md={12}>
              <FormTextField
                label="KT Remarks"
                name="notes"
                multiline
                maxLength={600}
                rows={4}
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>

          <FormInputGroup>
            <FormInputContainer md={6}>
              <KTUserAutocomplete
                label="KT Given To"
                name="ktUser"
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <Box display="flex" justifyContent="center" flexDirection="column">
              <FileUpload name="departmentAttachment" />
            </Box>
            {departmentData?.attachment && (
              <Box display="flex" justifyContent="center">
                <ViewDocument
                  filename={departmentData.attachment}
                  containerType={1}
                />
              </Box>
            )}
          </Box>

          <Stack direction="row" gap={2} justifyContent="center">
            <SubmitButton type="submit" variant="contained" loading={isSaving}>
              {isSaving ? "Submitting..." : "Submit"}
            </SubmitButton>
            <ResetButton />
          </Stack>
        </Box>
      </FormProvider>
      <GlobalLoader loading={fetchLoading || isSaving} />
    </>
  );
}
