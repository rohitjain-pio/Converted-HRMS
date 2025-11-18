import FormPhoneField from "@/components/FormPhoneField";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PageHeader from "@/components/PageHeader/PageHeader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import { Close, RemoveCircleOutline, AddCircle } from "@mui/icons-material";
import {
  IconButton,
  DialogContent,
  Box,
  Stack,
  Tooltip,
  Divider,
  Button,
  DialogActions,
  Dialog,
} from "@mui/material";
import {
  FormProvider,
} from "react-hook-form";
import { onCloseHandler } from "@/utils/dialog";
import { FormDataType, props } from "./utils";

export const ReferenceMultiForm = ({
  errors,
  fields,
  onClose,
  open,
  method,
  onSubmit,
  isSaving,
  professionalReferencesLength,
  handleToggleThirdForm,
}: props) => {
  const { handleSubmit, reset } = method;
  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => onCloseHandler(reason, onClose)}
        maxWidth="md"
        fullWidth
      >
        <PageHeader variant="h4" title="Add Professional Reference" />
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => {
            reset();
            onClose();
          }}
          aria-label="close"
          style={{ position: "absolute", right: 20, top: 8 }}
        >
          <Close />
        </IconButton>
        <FormProvider<FormDataType> {...method}>
          <DialogContent>
            <Box
              component="form"
              autoComplete="off"
              paddingBottom="30px"
              gap="30px"
              display="flex"
              flexDirection="column"
              onSubmit={handleSubmit(onSubmit)}
            >
              {fields.map((_, index) => {
                return (
                  <>
                    <Box>
                      <Box sx={{ paddingBottom: "12px" }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            Reference #
                            {index + professionalReferencesLength + 1}
                          </Box>
                          {professionalReferencesLength < 2 &&
                          index + professionalReferencesLength > 1 ? (
                            <Tooltip title="Remove reference">
                              <IconButton
                                color="error"
                                onClick={handleToggleThirdForm}
                              >
                                <RemoveCircleOutline />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </Stack>
                      </Box>
                      <FormInputGroup>
                        <FormInputContainer md={6}>
                          <FormTextField
                            name={`references.${index}.fullName`}
                            label="Full Name"
                            required
                            error={!!errors?.references?.[index]?.fullName}
                            helperText={
                              errors?.references?.[index]?.fullName?.message
                            }
                          />
                        </FormInputContainer>
                        <FormInputContainer md={6}>
                          <FormTextField
                            name={`references.${index}.designation`}
                            label="Designation"
                            required
                            error={!!errors?.references?.[index]?.designation}
                            helperText={
                              errors?.references?.[index]?.designation?.message
                            }
                          />
                        </FormInputContainer>
                        <FormInputContainer md={6}>
                          <FormTextField
                            name={`references.${index}.email`}
                            label="Email"
                            required
                            error={!!errors?.references?.[index]?.email}
                            helperText={
                              errors?.references?.[index]?.email?.message
                            }
                          />
                        </FormInputContainer>
                        <FormInputContainer md={6}>
                          <FormPhoneField
                            name={`references.${index}.contactNumber`}
                            label="Contact Number"
                            required
                            error={!!errors?.references?.[index]?.contactNumber}
                            helperText={
                              errors?.references?.[index]?.contactNumber
                                ?.message
                            }
                          />
                        </FormInputContainer>
                      </FormInputGroup>
                    </Box>
                    {index + professionalReferencesLength <
                    fields.length + professionalReferencesLength - 1 ? (
                      <Divider variant="middle" />
                    ) : null}
                    {index + professionalReferencesLength === 1 &&
                    fields.length + professionalReferencesLength < 3 ? (
                      <Stack direction="row" justifyContent="center">
                        <Button
                          startIcon={<AddCircle />}
                          onClick={handleToggleThirdForm}
                          color="primary"
                          variant="outlined"
                        >
                          Add More
                        </Button>
                      </Stack>
                    ) : null}
                  </>
                );
              })}
              <Box display="flex" gap="15px" justifyContent="center">
                <DialogActions>
                  <SubmitButton loading={isSaving}>
                    {isSaving ? "Saving" : "Save"}
                  </SubmitButton>
                  <ResetButton
                    onClick={() => {
                      reset();
                    }}
                  />
                </DialogActions>
              </Box>
            </Box>
          </DialogContent>
        </FormProvider>
      </Dialog>
      <GlobalLoader loading={isSaving} />
    </>
  );
};
