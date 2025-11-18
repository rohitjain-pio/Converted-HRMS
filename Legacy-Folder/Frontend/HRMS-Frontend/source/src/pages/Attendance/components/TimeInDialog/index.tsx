import React, { useEffect } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";

import {
  TimeInDialogFormValues,
  TimeInFormData,
  TimeInProps,
} from "@/pages/Attendance/types";
import { validationSchema } from "./validationSchema";
import { getTotalHours } from "./utils";
import TimeInDialog from "@/pages/Attendance/components/TimeInDialog/TimeinDialog";

const TimeIn: React.FC<TimeInProps> = (props) => {
  const {
    open,
    onClose,
    getDateStatus,
    onSubmit,
    isLoading,
    editDetails,
    filledDates,
  } = props;

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

  const {  watch, setValue, reset } = methods;

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
    <TimeInDialog
      open={open}
      onClose={onClose}
      methods={methods}
      internalSubmit={internalSubmit}
      filledDates={filledDates}
      getDateStatus={getDateStatus}
      getTotalHours={getTotalHours}
      isLoading={isLoading} onSubmit={onSubmit} editDetails={editDetails}    />
  );
};

export default TimeIn;
