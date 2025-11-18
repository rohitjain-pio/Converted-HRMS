import { Close as CloseIcon} from "@mui/icons-material";

import { FormProvider, SubmitHandler, UseFormReturn } from "react-hook-form";
import DocumentTypeSelectField from "../DocumentTypeSelectField";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
} from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import FormTextField from "@/components/FormTextField";
import FormDatePicker from "@/components/FormDatePicker";
import { hasPermission } from "@/utils/hasPermission";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { AddUserDocumentFormData } from "./validationSchema";
import {
  permissionValue,
  PERSONAL_DETAILS_DOCUMENT_ID,
} from "@/utils/constants";
import moment from "moment";
import ResetButton from "@/components/ResetButton/ResetButton";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { GovtDocumentType } from "@/services/Documents";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";

interface UserDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onCloseHandler:  (reason: "backdropClick" | "escapeKeyDown", onClose: () => void)=>void
  userDocumentId?: number;
  method: UseFormReturn<AddUserDocumentFormData>;
  onSubmit: SubmitHandler<AddUserDocumentFormData>;
  handleResetForm: () => void;
  isLoading: boolean;
  isSaving: boolean;
  isUpdating: boolean;
  selectedDocumentType?: GovtDocumentType | undefined;
  userDocumentData?: { location?: string };
  handleApiResponse: (response: GovtDocumentType[]) => void;
}

const AddUserDocumentForm: React.FC<UserDocumentDialogProps> = ({
  open,
  onClose,
  onCloseHandler,
  userDocumentId,
  method,
  onSubmit,
  handleResetForm,
  isLoading,
  isSaving,
  isUpdating,
  selectedDocumentType,
  userDocumentData,
  handleApiResponse,
}) => {
  const { handleSubmit } = method;
  const { VIEW } = permissionValue.PERSONAL_DETAILS;

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
          title={`${userDocumentId ? "Edit" : "Add"} User Document`}
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
          <FormProvider<AddUserDocumentFormData> {...method}>
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
                <DocumentTypeSelectField
                  required
                  id={PERSONAL_DETAILS_DOCUMENT_ID}
                  onApiResponse={handleApiResponse}
                />
                <FormTextField
                  label="Document Number"
                  name="documentNumber"
                  required
                />
                {selectedDocumentType?.isExpiryDateRequired && (
                  <FormDatePicker
                    label="Expiry Date"
                    name="documentExpiry"
                    format="MMM Do, YYYY"
                    views={["year", "month", "day"]}
                    openTo="year"
                    yearsOrder="asc"
                    minDate={moment()}
                    required={selectedDocumentType?.isExpiryDateRequired}
                  />
                )}
                <Grid display="flex" flexDirection="row" gap="5px">
                  <Box maxWidth="500px">
                    <FileUpload name="file" />
                  </Box>
                  {userDocumentId &&hasPermission(VIEW)? (
                    <Box maxWidth="500px" sx={{ ml: 1 }}>
                      <ViewDocument

                        filename={userDocumentData?.location as string}
                        containerType={1}
                      />
                    </Box>
                  ) : (
                    ""
                  )}
                </Grid>
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : userDocumentId
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
export default AddUserDocumentForm
