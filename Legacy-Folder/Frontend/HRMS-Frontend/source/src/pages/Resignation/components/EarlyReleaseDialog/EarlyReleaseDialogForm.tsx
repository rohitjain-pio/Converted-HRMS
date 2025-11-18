import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
  Box,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormProvider, Controller, UseFormReturn } from "react-hook-form";
import moment from "moment";

import * as Yup from "yup";
import { earlyReleaseSchema } from "./validationSchema";
import FormDatePicker from "@/components/FormDatePicker";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
type FormDateType = Yup.InferType<typeof earlyReleaseSchema>;

interface BuyoutPolicyDialogProps {
  open: boolean;
  onClose: () => void;
  method:  UseFormReturn<{
    agreed: boolean;
    releaseDate: moment.Moment;
},  undefined>;
  onSubmit: (values: FormDateType) => void;
  step: number;
  setStep:  React.Dispatch<React.SetStateAction<0 | 1>>
  agreed: boolean;
  onNext: () => void;
  lastWorkingDay: string;
  isLoading: boolean;
}

const EarlyReleaseDialogForm: React.FC<BuyoutPolicyDialogProps> = ({
  open,
  onClose,
  method,
  onSubmit,
  step,
  setStep,
  agreed,
  onNext,
  lastWorkingDay,
  isLoading,
}) => {
  const {handleSubmit,control} = method;
  return (
    <>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              maxHeight: "80%",
            },
          },
        }}
      >
        <FormProvider<FormDateType> {...method}>
          <Box
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
          >
            <DialogTitle sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <Typography
                sx={{ alignSelf: "center", color: "#273A50", flex: 1 }}
                variant="h4"
              >
                {step === 0
                  ? "Buyout Policy Terms"
                  : "Select Early Release Date"}
              </Typography>
              <Stack direction="row" gap={1.5} mr={-1}>
                <IconButton
                  color="inherit"
                  onClick={onClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              {step === 0 ? (
                <Stack>
                  <ul
                    style={{
                      listStylePosition: "inside",
                      paddingLeft: 0,
                    }}
                  >
                    <li>
                      Your remaining notice period requires a financial buyout
                      settlement.
                    </li>
                    <li>The buyout amount will be calculated as:</li>
                    <ul
                      style={{
                        listStylePosition: "inside",
                      }}
                    >
                      <li>
                        [X] Days of Notice Period &times; Daily Salary OR [XX]%
                        of Monthly Salary, whichever is higher.
                      </li>
                    </ul>
                    <li>
                      The agreed buyout sum will be deducted from your Full &
                      Final (FnF) settlement.
                    </li>
                    <li>Approval is subject to HR & Finance review.</li>
                    <li>
                      Once agreed, the exit date will be adjusted, and further
                      changes may not be possible.
                    </li>
                  </ul>
                  <Controller
                    name="agreed"
                    control={control}
                    render={({ field }) => {
                      return (
                        <FormControlLabel
                          label="Do you agree to proceed with the early release request under the Buyout Policy?"
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                              }}
                            />
                          }
                        />
                      );
                    }}
                  />
                </Stack>
              ) : (
                <FormDatePicker
                  label="Release Date"
                  name="releaseDate"
                  format="MMM Do, YYYY"
                  minDate={moment()}
                  maxDate={moment(lastWorkingDay, "YYYY-MM-DD")}
                  required
                />
              )}
            </DialogContent>
            <DialogActions>
              {step === 1 && (
                <Button
                  onClick={() => {
                    setStep(0);
                  }}
                >
                  Back
                </Button>
              )}
              <Button onClick={onClose}>Cancel</Button>
              {step === 0 ? (
                <Button variant="contained" disabled={!agreed} onClick={onNext}>
                  Agree & Continue
                </Button>
              ) : (
                <SubmitButton>Submit Request</SubmitButton>
              )}
            </DialogActions>
          </Box>
        </FormProvider>
      </Dialog>
      <GlobalLoader loading={isLoading} />
    </>
  );
};

export default EarlyReleaseDialogForm;
