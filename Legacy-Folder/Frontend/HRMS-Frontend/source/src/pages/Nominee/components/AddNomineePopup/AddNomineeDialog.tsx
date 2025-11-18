import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Grid,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormProvider, UseFormReturn } from "react-hook-form";
import moment from "moment";
import FormDatePicker from "@/components/FormDatePicker";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PageHeader from "@/components/PageHeader/PageHeader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import DocumentTypeSelectField from "@/pages/Document/components/DocumentTypeSelectField";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import {
  NOMINEE_DETAILS_DOCUMENT_ID,
  permissionValue,
} from "@/utils/constants";
import RelationshipSelectField from "../RelationshipSelectField";
import { hasPermission } from "@/utils/hasPermission";
import { NomineeType } from "@/services/Nominee";
import { getValidationSchema } from "./validationSchema";
import * as Yup from "yup";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import ViewNomineeDocument from "../ViewNomineeDocument";

interface NomineeDialogProps {
  open: boolean;
  onClose: () => void;
  onCloseHandler: (
    reason: "backdropClick" | "escapeKeyDown",
    onClose: () => void
  ) => void;
  nomineeId: number;
  nomineeData: NomineeType | undefined;
  method: UseFormReturn<
    {
      file?: File | null | undefined;
      others?: string | undefined;
      careOf?: string | undefined;
      nomineeName: string;
      relationshipId: string;
      dob: moment.Moment;
      age: number;
      percentage: number;
      idProofDocType: string;
    },
    undefined
  >;
  onSubmit: (data: FormData) => void;
  handleResetForm: () => void;
  isSaving: boolean;
  isUpdating: boolean;
  isLoading: boolean;
  showOtherRelationship: boolean;
  isRequiredCareOf: boolean;
}
type FormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;

const NomineeDialog: React.FC<NomineeDialogProps> = ({
  open,
  onClose,
  onCloseHandler,
  nomineeId,
  nomineeData,
  method,
  onSubmit,
  handleResetForm,
  isSaving,
  isUpdating,
  isLoading,
  showOtherRelationship,
  isRequiredCareOf,
}) => {
  const { handleSubmit } = method;
  const { VIEW } = permissionValue.NOMINEE_DETAILS;

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
          title={`${nomineeId ? "Edit" : "Add"} Nominee Details`}
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
                onSubmit={handleSubmit(onSubmit)}
                paddingY="30px"
                gap="30px"
                display="flex"
                flexDirection="column"
              >
                <FormTextField
                  label="Nominee Name"
                  name="nomineeName"
                  required
                />
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <RelationshipSelectField required />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    {showOtherRelationship && (
                      <FormTextField
                        name="others"
                        label="Specify Relationship"
                        required
                      />
                    )}
                  </FormInputContainer>
                </FormInputGroup>
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Date of Birth"
                      name="dob"
                      format="MMM Do, YYYY"
                      views={["year", "month", "day"]}
                      openTo="year"
                      yearsOrder="desc"
                      maxDate={moment()}
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField
                      label="Age"
                      name="age"
                      type="number"
                      readOnly
                      required
                    />
                  </FormInputContainer>
                </FormInputGroup>

                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <FormTextField
                      name="careOf"
                      label="Care Of (Incase Minor)"
                      required={isRequiredCareOf}
                      disabled={!isRequiredCareOf}
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField
                      label="Percentage"
                      name="percentage"
                      type="number"
                      required
                    />
                  </FormInputContainer>
                </FormInputGroup>
                <FormInputGroup>
                  <FormInputContainer md={6}>
                    <DocumentTypeSelectField
                      name="idProofDocType"
                      required
                      id={NOMINEE_DETAILS_DOCUMENT_ID}
                      onApiResponse={() => {}}
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <Grid display="flex" flexDirection="row" gap="5px">
                      <Box maxWidth="500px">
                        <FileUpload name="file" />
                      </Box>
                      {nomineeId ? (
                        <Box maxWidth="500px" sx={{ ml: 1 }}>
                          <ViewNomineeDocument
                            fileName={nomineeData?.fileName as string}
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
                          : nomineeId
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
export default NomineeDialog;
