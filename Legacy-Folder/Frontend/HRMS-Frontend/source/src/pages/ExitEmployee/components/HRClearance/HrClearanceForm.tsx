import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import ViewDocument from "../ViewDocument";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import { Box, Stack } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { defaultValues, FormValues, status } from "./utils";
import { useEffect } from "react";
import { HrClearanceDetails } from "@/services/EmployeeExitAdmin";

type HrClearanceFormProps = {
  editable: boolean | undefined;
  hrClearanceData :HrClearanceDetails|undefined
  isSaving: boolean;
  fetchLoading: boolean;
  onSubmit: (data: FormValues) => void;
};

export default function HrClearanceForm({
  editable,
  hrClearanceData,
  isSaving,
  fetchLoading,
  onSubmit,
}: HrClearanceFormProps) {
  const method = useForm<FormValues>({
    defaultValues,
  });

  const { handleSubmit ,reset} = method;
  useEffect(() => {
   reset({
        advanceBonusRecoveryAmount: hrClearanceData?.advanceBonusRecoveryAmount || 0,
        currentEL: hrClearanceData?.currentEL || 0,
        numberOfBuyOutDays: hrClearanceData?.numberOfBuyOutDays || 0,
        serviceAgreementDetails: hrClearanceData?.serviceAgreementDetails || "",
        exitInterviewStatus: hrClearanceData?.exitInterviewStatus || false,
        exitInterviewDetails: hrClearanceData?.exitInterviewDetails || "",
        hrAttachment: null,
      });
  }, [hrClearanceData])
  
  return (
    <>
      <FormProvider {...method}>
        <Box
          component="form"
          autoComplete="off"
          padding="30px"
          gap="30px"
          display="flex"
          flexDirection="column"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInputGroup>
            <FormInputContainer md={4}>
              <FormTextField
                label="Advance Bonus Recovery"
                type="number"
                name="advanceBonusRecoveryAmount"
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer md={4}>
              <FormTextField
                label="Current EL"
                name="currentEL"
                type="number"
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer md={4}>
              <FormTextField
                label="Number of Buyout days "
                name="numberOfBuyOutDays"
                type="number"
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer md={12}>
              <FormTextField
                label="Service Agreement"
                name="serviceAgreementDetails"
                multiline
                maxLength={600}
                rows={4}
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>
          <FormInputGroup>
            <FormInputContainer>
              <FormSelectField
                label="Exit Interview Status"
                name="exitInterviewStatus"
                options={status}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer md={8}>
              <FormTextField
                label="Exit Interview Details"
                name="exitInterviewDetails"
                multiline
                maxLength={600}
                rows={4}
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
            <Box display="flex" justifyContent="center " flexDirection="column">
              <FileUpload name="hrAttachment" />
            </Box>
            {hrClearanceData && hrClearanceData.attachment && (
              <Box display="flex" justifyContent="center">
                <ViewDocument
                  filename={hrClearanceData.attachment}
                  containerType={1}
                />
              </Box>
            )}
          </Box>
          <Stack direction="row" gap={2} justifyContent="center">
            <SubmitButton type="submit" variant="contained" loading={isSaving}>
              {isSaving ? "Submitting...." : "Submit"}
            </SubmitButton>
            <ResetButton />
          </Stack>
        </Box>
      </FormProvider>
      <GlobalLoader loading={fetchLoading || isSaving} />
    </>
  );
}
