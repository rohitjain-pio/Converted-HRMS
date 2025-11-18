import FormDatePicker from "@/components/FormDatePicker";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PageHeader from "@/components/PageHeader/PageHeader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import { Close as CloseIcon } from "@mui/icons-material";

import {
  IconButton,
  DialogContent,
  Box,
  DialogActions,
  CircularProgress,
  Dialog,
} from "@mui/material";
import moment from "moment";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { FormDataType } from "../PreviousEmployerDialog";
interface props {
  open: boolean;
  mode: "edit" | "add";
  onCloseHandler(
    reason: "backdropClick" | "escapeKeyDown",
    onClose: () => void
  ): void;
  isLoading: boolean;
  method: UseFormReturn<
    {
      employerName: string;
      designation: string;
      startDate: moment.Moment;
      endDate: moment.Moment;
    },
    undefined
  >;
  isSaving: boolean;
  previousEmployerId: number | undefined;
  handleResetForm: () => void;
  isUpdating: boolean;
  onSubmit: (formData: FormDataType) => void;
  onClose:()=>void
}
export const PreviousEmployeeDialogForm = ({
  handleResetForm,
  isSaving,
  isLoading,
  isUpdating,
  method,
  mode,
  onCloseHandler,
  onSubmit,
  open,
  onClose,
  previousEmployerId,
}: props) => {
    const {handleSubmit}=method
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
          title={`${mode === "edit" ? "Edit" : "Add"} Previous Employer`}
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
          <FormProvider<FormDataType> {...method}>
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
                    <FormTextField
                      name="employerName"
                      label="Employer Name"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormTextField
                      name="designation"
                      label="Designation"
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="Start Date"
                      name="startDate"
                      format="MMM Do, YYYY"
                      views={["year", "month", "day"]}
                      openTo="year"
                      yearsOrder="desc"
                      maxDate={moment()}
                      required
                    />
                  </FormInputContainer>
                  <FormInputContainer md={6}>
                    <FormDatePicker
                      label="End Date"
                      name="endDate"
                      format="MMM Do, YYYY"
                      views={["year", "month", "day"]}
                      openTo="year"
                      yearsOrder="desc"
                      maxDate={moment()}
                      required
                    />
                  </FormInputContainer>
                </FormInputGroup>
                <Box display="flex" gap="15px" justifyContent="center">
                  <DialogActions>
                    <SubmitButton loading={isSaving || isUpdating}>
                      {isSaving
                        ? "Saving"
                        : isUpdating
                          ? "Updating"
                          : previousEmployerId
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
