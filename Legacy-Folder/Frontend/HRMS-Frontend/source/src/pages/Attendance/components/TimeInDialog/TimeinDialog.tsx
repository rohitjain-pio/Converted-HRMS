import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { FormProvider } from "react-hook-form";
import { shouldDisableCustomDate } from "./utils";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import FormTextField from "@/components/FormTextField";
import FormSelectField from "@/components/FormSelectField";
import FormDatePicker from "@/components/FormDatePicker";
import PageHeader from "@/components/PageHeader/PageHeader";
import { TimeInDialogProps } from "../../types";

const TimeInDialog: React.FC<TimeInDialogProps> = ({
  open,
  onClose,
  methods,
  internalSubmit,

  filledDates,
  getDateStatus,
  getTotalHours,
  isLoading,
}) => {
  const { handleSubmit, watch, setValue } = methods;
  const watchDate = watch("date");
  const watchStartTime = watch("startTime");
  const watchEndTime = watch("endTime");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { minWidth: 500 } },
      }}
    >
      <PageHeader variant="h4" title="Time In" />
      <Box sx={{ position: "absolute", right: 20, top: 8 }}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          style={{ position: "absolute", right: 20, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <FormProvider {...methods}>
        <DialogContent>
          <Box
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit(internalSubmit)}
            paddingY="30px"
            gap="30px"
            display="flex"
            flexDirection="column"
          >
            <FormDatePicker
              label="Date"
              name="date"
              value={watchDate || null}
              onChange={(date: unknown) => {
                setValue("date", date as moment.Moment, {
                  shouldDirty: true,
                });
              }}
              minDate={moment("2025-06-03", "YYYY-MM-DD")}
              maxDate={moment()}
              shouldDisableDate={(date: moment.Moment) =>
                shouldDisableCustomDate(date, filledDates)
              }
              required
            />
            {watchDate &&
              moment(watchDate).isValid() &&
              getDateStatus(moment(watchDate).format("YYYY-MM-DD")) ===
                "past" && (
                <Box display="flex" gap={2}>
                  <FormTextField
                    name="startTime"
                    label="Start Time"
                    type="time"
                    fullWidth
                    margin="dense"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormTextField
                    name="endTime"
                    label="End Time"
                    type="time"
                    fullWidth
                    margin="dense"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  {watchStartTime && watchEndTime && (
                    <FormTextField
                      name="totalHours"
                      label="Total Hours"
                      value={getTotalHours(watchStartTime, watchEndTime)}
                      fullWidth
                      margin="dense"
                      InputProps={{ readOnly: true }}
                    />
                  )}
                </Box>
              )}
            <FormSelectField
              name="location"
              label="Location"
              options={[
                { label: "Jaipur Office", value: "Jaipur Office" },
                { label: "Hyderabad Office", value: "Hyderabad Office" },
                { label: "Pune Office", value: "Pune Office" },
                { label: "Remote", value: "Remote" },
                { label: "On Premises", value: "On Premises" },
                { label: "US", value: "US" },
                { label: "Other", value: "Other" },
              ]}
              required
            />
            {watchDate &&
              moment(watchDate).isValid() &&
              getDateStatus(moment(watchDate).format("YYYY-MM-DD")) ===
                "today" && (
                <FormTextField
                  name="note"
                  label="Note (optional)"
                  fullWidth
                  margin="dense"
                />
              )}
            {watchDate &&
              moment(watchDate).isValid() &&
              getDateStatus(moment(watchDate).format("YYYY-MM-DD")) ===
                "past" && (
                <FormTextField
                  name="reason"
                  label="Reason for past entry"
                  fullWidth
                  required
                  margin="dense"
                />
              )}
            <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
              <Button onClick={onClose}>Cancel</Button>
              <SubmitButton
                type="submit"
                variant="contained"
                loading={isLoading}
              >
                Time In
              </SubmitButton>
            </DialogActions>
          </Box>
        </DialogContent>
      </FormProvider>
    </Dialog>
  );
};
export default TimeInDialog
