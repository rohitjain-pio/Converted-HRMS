import { Box } from "@mui/material";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { FNF_STATUS_OPTIONS, FormValues, status } from "./utils";
import FormSelectField from "@/components/FormSelectField";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import ViewDocument from "../ViewDocument";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import { AccountClearanceDetails } from "@/services/EmployeeExitAdmin";
import { useEffect } from "react";

type AccountClearanceFormProps = {
  editable: boolean | undefined;
  accountClearanceDetails?: AccountClearanceDetails | null;
  isUpsertingDetails: boolean;
  isFetchingDetails: boolean;
  onSubmit: SubmitHandler<FormValues>;
};

export default function AccountClearanceForm({
  editable,
  accountClearanceDetails,
  isUpsertingDetails,
  isFetchingDetails,
  onSubmit,
}: AccountClearanceFormProps) {
  const method = useForm({
    defaultValues: {
      fnFStatus: false,
      fnFAmount: "",
      issueNoDueCertificate: false,
      note: "",
      accountAttachment: null,
    },
  });
  const { handleSubmit, reset } = method;

  useEffect(() => {
    reset({
      fnFStatus: accountClearanceDetails?.fnFStatus ?? false,
      fnFAmount:
        typeof accountClearanceDetails?.fnFAmount === "number"
          ? String(accountClearanceDetails.fnFAmount)
          : "",
      issueNoDueCertificate:
        accountClearanceDetails?.issueNoDueCertificate ?? false,
      note: accountClearanceDetails?.note ?? "",
      accountAttachment: null,
    });
  }, [accountClearanceDetails, reset]);

  return (
    <>
      <FormProvider {...method}>
        <Box
          component="form"
          autoComplete="off"
          display="flex"
          flexDirection="column"
          gap="30px"
          paddingY="30px"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInputGroup>
            <FormInputContainer>
              <FormSelectField
                label="FnF Statement Status"
                name="fnFStatus"
                options={FNF_STATUS_OPTIONS}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormTextField
                label="FnF Amount"
                name="fnFAmount"
                type="number"
                inputProps={{ inputMode: "decimal" }}
                required
                disabled={!editable}
              />
            </FormInputContainer>
            <FormInputContainer>
              <FormSelectField
                label="Issue No Due Certificate"
                name="issueNoDueCertificate"
                options={status}
                valueKey="id"
                labelKey="label"
                required
                disabled={!editable}
              />
            </FormInputContainer>
          </FormInputGroup>

          <FormInputGroup>
            <FormInputContainer md={12}>
              <FormTextField
                multiline
                maxLength={600}
                name="note"
                label="Comment"
                placeholder="Add your comments"
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
              <FileUpload name="accountAttachment" />
            </Box>
            {accountClearanceDetails &&
              accountClearanceDetails.accountAttachment && (
                <Box display="flex" justifyContent="center">
                  <ViewDocument
                    filename={accountClearanceDetails.accountAttachment}
                    containerType={1}
                  />
                </Box>
              )}
          </Box>

          <Box display="flex" gap="15px" justifyContent="center">
            <SubmitButton loading={isUpsertingDetails}>
              {isUpsertingDetails ? "Submitting" : "Submit"}
            </SubmitButton>
            <ResetButton />
          </Box>
        </Box>
      </FormProvider>
      <GlobalLoader loading={isFetchingDetails || isUpsertingDetails} />
    </>
  );
}
