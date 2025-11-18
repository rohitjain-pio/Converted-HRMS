import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import FormDatePicker from "@/components/FormDatePicker";
import FormTextField from "@/components/FormTextField";
import FormSelectField from "@/components/FormSelectField";
import PageHeader from "@/components/PageHeader/PageHeader";
import { EditDetails, TimeInDialogFormValues, TimeInFormData } from "@/pages/Attendance/types";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { Close as CloseIcon } from "@mui/icons-material";



interface TimeInDialogProps {
  open: boolean;
  onClose: () => void;
  getDateStatus: (date: string) => string;
  onSubmit: (data: TimeInFormData) => void;
  isLoading: boolean;
  editDetails: EditDetails;
  filledDates: string[];
}

const shouldDisableCustomDate = (
  date: moment.Moment,
  filledDates: string[]
): boolean => {
  const isFilled = filledDates.some((filled) =>
    date.isSame(moment(filled, "MM/DD/YYYY HH:mm:ss"), "day")
  );
  const isToday = date.isSame(moment(), "day");
  return !(!isFilled || isToday);
};


const TimeInDialog: React.FC<TimeInDialogProps> = (props) => {
  const {
    open,
    onClose,
    getDateStatus,
    onSubmit,
    isLoading,
    editDetails,
    filledDates,
  } = props;

  const validationSchema = yup.object().shape({
    date: yup
      .mixed<moment.Moment>()
      .required("Date is required")
      .test(
        "no-edit-today",
        "You cannot edit for the current date.",
        function (value) {
          const { attendanceId } = this.options.context || {};
          return !(
            attendanceId &&
            value &&
            moment(value).isSame(moment(), "day")
          );
        }
      ),
    startTime: yup.string().when("date", {
      is: (date: moment.Moment) =>
        date && date.isValid() && date.isBefore(moment(), "day"),
      then: (schema) => schema.required("Start time is required"),
      otherwise: (schema) => schema,
    }),
    endTime: yup.string().when("date", {
      is: (date: moment.Moment) =>
        date && date.isValid() && date.isBefore(moment(), "day"),
      then: (schema) =>
        schema
          .required("End time is required")
          .test(
            "end-after-start",
            "End time cannot be before start time.",
            function (value) {
              const { startTime } = this.parent;
              return !startTime || !value || value >= startTime;
            }
          ),
      otherwise: (schema) => schema,
    }),
    location: yup.string().required("Location is required"),
    note: yup.string().trim(),
    reason: yup.string().when("date", {
      is: (date: moment.Moment) =>
        date && date.isValid() && date.isBefore(moment(), "day"),
      then: (schema) =>
        schema
          .required("Please tell us why you're adding a past entry.")
          .trim()
          .min(1, "Reason cannot be empty."),
      otherwise: (schema) => schema,
    }),
  });

  const attendanceId = editDetails.id;


  const methods = useForm<TimeInDialogFormValues>({
    resolver: yupResolver(validationSchema),
    context: { attendanceId },
    defaultValues: {
      date: moment(editDetails.date),
      startTime: editDetails.startTime || "",
      endTime: editDetails.endTime || "",
      location: editDetails.location || "",
      note: editDetails.note || "",
      reason: editDetails.reason || "",
      
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
  } = methods;

  

  const watchDate = watch("date");
  const watchStartTime = watch("startTime");
  const watchEndTime = watch("endTime");

  

  useEffect(() => {
    if (open) {
      reset({
        date: moment(editDetails.date),
        startTime: editDetails.startTime || "",
        endTime: editDetails.endTime || "",
        location: editDetails.location || "",
        note: editDetails.note || "",
        reason: editDetails.reason || "",
      });
    }
  }, [open, editDetails]);
useEffect(() => {
    if (watchStartTime && watchEndTime) {
      const total = getTotalHours(watchStartTime, watchEndTime);
      setValue("totalHours", total);
    }
  }, [watchStartTime, watchEndTime]);
 

  const getTotalHours = (
    startTime: string,
    endTime: string
  ): string => {
    if (!startTime || !endTime) return "00:00";
    const [inH, inM] = startTime.split(":").map(Number);
    const [outH, outM] = endTime.split(":").map(Number);
    let totalMinutes = outH * 60 + outM - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const internalSubmit = (data: TimeInDialogFormValues) => {
    const formData: TimeInFormData = {
      ...data,
      date: data.date.format("YYYY-MM-DD"),
      startTime: data.startTime ?? "",
      endTime: data.endTime ?? "",
      location: data.location,
      note: data.note ?? "",
      reason: data.reason ?? "",
    };
    onSubmit(formData);
  };

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
              getDateStatus(moment(watchDate).format("YYYY-MM-DD")) === "past" && (
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
                      value={getTotalHours(watchStartTime,watchEndTime)}
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
              getDateStatus(moment(watchDate).format("YYYY-MM-DD")) === "today" && (
                <FormTextField
                  name="note"
                  label="Note (optional)"
                  fullWidth
                  margin="dense"
                />
              )}
            {watchDate &&
              moment(watchDate).isValid() &&
              getDateStatus(moment(watchDate).format("YYYY-MM-DD")) === "past" && (
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

export default TimeInDialog;