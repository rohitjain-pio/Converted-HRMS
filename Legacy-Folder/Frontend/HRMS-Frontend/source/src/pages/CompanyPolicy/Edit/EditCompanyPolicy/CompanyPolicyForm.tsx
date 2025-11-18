import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
} from "@mui/material";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import CategorySelect from "../../components/CategorySelect";
import StatusSelect from "../../components/StatusSelect";
import FormTextField from "@/components/FormTextField";
import ViewDocument from "../../components/ViewDocument";
import FileUpload from "../../components/FileUpload";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { CompanyPolicyFormData } from "./validationSchema";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import { permissionValue } from "@/utils/constants";
import * as Yup from "yup";
import { hasPermission } from "@/utils/hasPermission";
import { CompanyPolicyType } from "@/services/CompanyPolicies";
interface PolicyDocumentFormProps {
  id?: string | undefined;
  method: UseFormReturn<
    {
      accessibility?: boolean | undefined;
      fileContent?: Yup.Maybe<File | undefined>;
      name: string;
      description: string;
      statusId: string;
      documentCategoryId: string;
      emailRequest: boolean;
    },
    undefined
  >;
  isLoading: boolean;
  isSaving: boolean;
  isUpdating: boolean;
  disableSendEmailRequest: boolean;
  companyPolicyData?: CompanyPolicyType | undefined;
  onSubmitIntercept: SubmitHandler<CompanyPolicyFormData>;
  handleResetForm: () => void;
  openConfirmEmailDialog: boolean;
  handleCancelSendEmail: () => void;
  handleConfirmSendEmail: () => void;
}

const PolicyDocumentForm: React.FC<PolicyDocumentFormProps> = ({
  id,
  method,
  isLoading,
  isSaving,
  isUpdating,
  disableSendEmailRequest,
  companyPolicyData,
  onSubmitIntercept,
  handleResetForm,
  openConfirmEmailDialog,
  handleCancelSendEmail,
  handleConfirmSendEmail,
}) => {
  const { handleSubmit, control } = method;
  const { VIEW } = permissionValue.COMPANY_POLICY;

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title={`${id ? "Edit" : "Add"} Policy Documents`}
          goBack={true}
        />
        {!isLoading ? (
          <Box paddingX="20px">
            <FormProvider<CompanyPolicyFormData> {...method}>
              <form
                autoComplete="off"
                onSubmit={handleSubmit(onSubmitIntercept)}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    paddingY: "20px",
                    gap: "20px",
                  }}
                >
                  <Grid container spacing={"20px"}>
                    <Grid item sm={6} xs={12}>
                      <FormTextField name="name" label="Name" required />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <CategorySelect required={true} />
                    </Grid>
                  </Grid>
                  <Box>
                    <StatusSelect required={true} />
                  </Box>
                  <Box>
                    <FormTextField
                      name="description"
                      label="Description"
                      multiline
                      maxLength={600}
                      rows={5}
                      required
                    />
                  </Box>
                  <Box maxWidth="500px">
                    <Controller
                      name="accessibility"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                              }}
                            />
                          }
                          label="Accessibility"
                        />
                      )}
                    />
                  </Box>
                  <Box maxWidth="500px">
                    <Controller
                      name="emailRequest"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                              }}
                              disabled={disableSendEmailRequest}
                            />
                          }
                          label="Notify via Email"
                        />
                      )}
                    />
                  </Box>
                  <Grid display="flex" flexDirection="row" gap="5px">
                    <Box maxWidth="500px">
                      <FileUpload />
                    </Box>
                    {id && (
                      <Box maxWidth="500px" sx={{ ml: 1 }}>
                        <ViewDocument
                          companyPolicyId={id}
                          fileName={companyPolicyData?.fileName as string}
                          fileOriginalName={
                            companyPolicyData?.fileOriginalName as string
                          }
                          hasPermission={hasPermission(VIEW)}
                        />
                      </Box>
                    )}
                  </Grid>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    paddingBottom: "20px",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <SubmitButton loading={isSaving || isUpdating}>
                    {isSaving
                      ? "Saving"
                      : isUpdating
                        ? "Updating"
                        : id
                          ? "Update"
                          : "Save"}
                  </SubmitButton>
                  <ResetButton onClick={handleResetForm} />
                </Box>
              </form>
            </FormProvider>
          </Box>
        ) : (
          <Box
            height={"calc(100vh - 80px)"}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
      <ConfirmationDialog
        open={openConfirmEmailDialog}
        onClose={handleCancelSendEmail}
        onConfirm={handleConfirmSendEmail}
        title="Send Email Notification?"
        content="You are about to send an email notification to affected users when you save these changes. This may notify a large audience. Are you sure you want to proceed?"
        confirmBtnColor="primary"
      />
      <GlobalLoader loading={isSaving || isUpdating} />
    </>
  );
};
export default PolicyDocumentForm