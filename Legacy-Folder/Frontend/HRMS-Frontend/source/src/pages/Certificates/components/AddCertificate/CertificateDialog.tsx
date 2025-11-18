import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { FormProvider, UseFormReturn } from "react-hook-form";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import ViewCertificateDocument from "../ViewCertificateDocument";
import PageHeader from "@/components/PageHeader/PageHeader";
import FormDatePicker from "@/components/FormDatePicker";
import FormTextField from "@/components/FormTextField";
import { hasPermission } from "@/utils/hasPermission";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { permissionValue } from "@/utils/constants";
import { CertificateFormData } from "./validationSchema";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";

interface CertificateDialogProps {
  open: boolean;
  onClose: () => void;
  onCloseHandler: (reason: "backdropClick" | "escapeKeyDown", onClose: () => void) => void
  method: UseFormReturn<
    {
      file?: File | null | undefined;
      certificateName: string;
      certificateExpiry: moment.Moment | null;
    },
    undefined
  >;

  onSubmit:  (data: CertificateFormData) => void
  handleResetForm: () => void;
  certificateId?: number;
  certificateData?: { fileName?: string };
  isLoading: boolean;
  isSaving: boolean;
  isUpdating: boolean;
}

const CertificateDialog: React.FC<CertificateDialogProps> = ({
  open,
  onClose,
  onCloseHandler,
  method,
  onSubmit,
  handleResetForm,
  certificateId,
  certificateData,
  isLoading,
  isSaving,
  isUpdating,
}) => {
  const { handleSubmit } = method;
  const { VIEW } = permissionValue.CERTIFICATION_DETAILS;

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => onCloseHandler(reason, onClose)}
        maxWidth="sm"
        fullWidth
      >
        <PageHeader
          variant="h4"
          title={`${certificateId ? "Edit" : "Add"} Certificate`}
        />
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          style={{ position: "absolute", right: 20, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        {!isLoading ? (
          <FormProvider<CertificateFormData> {...method}>
            <DialogContent>
              <Box
                component="form"
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
                paddingY="30px"
                gap="30px"
                display="flex"
                flexDirection="column"
              >
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <FormTextField
                      label="Certificate Name"
                      name="certificateName"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Expiry Date"
                      name="certificateExpiry"
                      format="MMM Do, YYYY"
                      minDate={moment()}
                      views={["year", "month", "day"]}
                      openTo="year"
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <Grid display="flex" flexDirection="row" gap={2}>
                      <Box maxWidth="500px">
                        <FileUpload name="file" />
                      </Box>
                      {certificateId ? (
                        <Box maxWidth="500px">
                          <ViewCertificateDocument
                            fileName={certificateData?.fileName as string}
                            hasPermission={hasPermission(VIEW)}
                          />
                        </Box>
                      ) : (
                        ""
                      )}
                    </Grid>
                  </FormInputContainer>
                </FormInputGroup>
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : certificateId
                            ? "Update"
                            : "Save"}
                    </SubmitButton>
                    <ResetButton onClick={handleResetForm} />
                  </DialogActions>
                </Box>
              </Box>
            </DialogContent>
          </FormProvider>
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
      </Dialog>
      <GlobalLoader loading={isSaving || isUpdating} />
    </>
  );
};
export default CertificateDialog