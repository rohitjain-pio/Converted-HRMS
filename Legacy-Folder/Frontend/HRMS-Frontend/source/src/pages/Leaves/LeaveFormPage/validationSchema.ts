import { DaySlot } from '@/utils/constants';
import { regex } from '@/utils/regexPattern';
import moment from 'moment';
import * as Yup from 'yup'
const { nameMaxLength_500 } = regex;

export const schema = Yup.object().shape({
  startDate: Yup.mixed<moment.Moment>()
    .defined()
    .nullable()
    .test("required", "Start date is required", (startDate) => {
      if (!startDate) {
        return false;
      }
      return true;
    })
    .test("is-valid", "Invalid Date", (startDate) => {
      if (!startDate) {
        return true;
      }
      return moment.isMoment(startDate) && moment(startDate).isValid();
    }),
  startDateSlot: Yup.string()
    .defined()
    .required("Required")
    .oneOf(
      [...Object.values(DaySlot).map((value) => String(value))],
      "Please select a valid slot"
    ),
  endDate: Yup.mixed<moment.Moment>()
    .defined()
    .nullable()
    .test("required", "End date is required", (endDate) => {
      if (!endDate) {
        return false;
      }
      return true;
    })
    .test("is-valid", "Invalid Date", (endDate) => {
      if (!endDate) {
        return true;
      }
      return moment.isMoment(endDate) && moment(endDate).isValid();
    })
    .test(
      "end-same-or-after-start",
      "End date cannot be before start date",
      (endDate, context) => {
        const startDate = context.parent.startDate as moment.Moment | null;
        const isValidStartDate =
          moment.isMoment(startDate) && moment(startDate).isValid();
        const isValidEndDate =
          moment.isMoment(endDate) && moment(endDate).isValid();

        if (isValidStartDate && isValidEndDate) {
          return endDate.isSameOrAfter(startDate, "day");
        }
        return false;
      }
    ),
  endDateSlot: Yup.string()
    .defined()
    .required("Required")
    .oneOf(
      [...Object.values(DaySlot).map((value) => String(value))],
      "Please select a valid slot"
    ),
  reason: Yup.string()
    .trim()
    .required("Reason is required")
    .max(nameMaxLength_500.number, nameMaxLength_500.message),
  attachment: Yup.string().defined().nullable(),
});
