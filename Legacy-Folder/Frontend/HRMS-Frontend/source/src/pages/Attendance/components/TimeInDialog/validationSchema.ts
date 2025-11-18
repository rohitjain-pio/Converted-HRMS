import * as yup from "yup";
import moment from "moment";

export const validationSchema = yup.object().shape({
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
