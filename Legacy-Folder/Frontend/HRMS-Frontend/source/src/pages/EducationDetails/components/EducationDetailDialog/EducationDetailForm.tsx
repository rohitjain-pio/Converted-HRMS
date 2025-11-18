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
import { FormProvider, SubmitHandler, UseFormReturn } from "react-hook-form";
import moment from "moment";
import { EducationDetailType } from "@/services/EducationDetails";
import PageHeader from "@/components/PageHeader/PageHeader";
import { FormData } from "./validationSchema";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import UniversityAutocomplete from "../UniversityAutocomplete";
import QualificationSelect from "../QualificationSelect";
import FormTextField from "@/components/FormTextField";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import FormDatePicker from "@/components/FormDatePicker";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { permissionValue } from "@/utils/constants";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";
import { hasPermission } from "@/utils/hasPermission";

interface EducationDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onCloseHandler:  (reason: "backdropClick" | "escapeKeyDown", onClose: () => void) => void
  mode: "add" | "edit";
  method: UseFormReturn<FormData>;
  onSubmit: SubmitHandler<FormData>;
  handleResetForm: () => void;
  isLoading: boolean;
  isSaving: boolean;
  isUpdating: boolean;
  educationDetailId?: number|undefined;
  educationDetail?:EducationDetailType | null
}

const EducationDetailsForm: React.FC<EducationDetailsDialogProps> = ({
  open,
  onClose,
  onCloseHandler,
  mode,
  method,
  onSubmit,
  handleResetForm,
  isLoading,
  isSaving,
  isUpdating,
  educationDetailId,
  educationDetail,
}) => {
  const { handleSubmit } = method;
  const { VIEW } = permissionValue.EDUCATIONAL_DETAILS;

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
          title={`${mode === "edit" ? "Edit" : "Add"} Education Details`}
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
          <FormProvider<FormData> {...method}>
            <DialogContent>
              <Box
                component="form"
                autoComplete="off"
                paddingY="30px"
                gap="30px"
                display="flex"
                flexDirection="column"
                onSubmit={handleSubmit(onSubmit)}
              >
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <QualificationSelect required />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField name="degreeName" label="Degree" required />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <UniversityAutocomplete
                      label="College/University/Board"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField
                      name="aggregatePercentage"
                      label="Aggregate Percentage"
                      type="number"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Start Year"
                      name="startYear"
                      format="MMM YYYY"
                      views={["year", "month"]}
                      openTo="year"
                      yearsOrder="desc"
                      maxDate={moment()}
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="End Year"
                      name="endYear"
                      format="MMM YYYY"
                      views={["year", "month"]}
                      openTo="year"
                      yearsOrder="desc"
                      maxDate={moment()}
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer>
                    <Grid display="flex" flexDirection="row" gap="5px">
                      <Box maxWidth="500px">
                        <FileUpload name="file" />
                      </Box>
                       {educationDetailId && educationDetail?.fileName ? (
                        <Box maxWidth="500px" sx={{ ml: 1 }}>
                          <ViewDocument
                            filename={educationDetail.fileName}
                            containerType={1}
                            hasPreviewPermission={hasPermission(VIEW)}
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
                          : educationDetailId
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
export default EducationDetailsForm