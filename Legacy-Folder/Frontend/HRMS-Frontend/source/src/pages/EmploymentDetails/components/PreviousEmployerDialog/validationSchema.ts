import { regex } from '@/utils/regexPattern';
import moment from 'moment';
import { Moment } from 'moment';
import * as Yup from 'yup'
const {
  name,
  nameMaxLength_35,
  nameMaxLength_50,
  notOnlyNumbers,
  minCharactersExist,
} = regex;

export const validationSchema = Yup.object({
  employerName: Yup.string()
    .trim()
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(name.key, name.message, (value) => {
      if (!value) return true;
      return name.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_35.number, nameMaxLength_35.message)
    .required("Employer Name required."),
  designation: Yup.string()
    .trim()
    .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
      if (!value) return true;
      return notOnlyNumbers.pattern.test(value);
    })
    .test(minCharactersExist.key, minCharactersExist.message, (value) => {
      if (!value) return true;
      return (value.match(minCharactersExist.pattern) || []).length >= 2;
    })
    .max(nameMaxLength_50.number, nameMaxLength_50.message)
    .required("Designation is required"),
  startDate: Yup.mixed<Moment>()
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (startDate) => moment.isMoment(startDate),
    })
    .test({
      name: "no-future-dates",
      message: "Start date cannot be in the future",
      test: (startDate) =>
        moment.isMoment(startDate)
          ? startDate.isSameOrBefore(moment(), "day")
          : false,
    })
    .required("Start date is required"),
  endDate: Yup.mixed<Moment>()
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (endDate) => moment.isMoment(endDate),
    })
    .test({
      name: "no-future-dates",
      message: "End date cannot be in the future",
      test: (endDate) =>
        moment.isMoment(endDate)
          ? endDate.isSameOrBefore(moment(), "day")
          : false,
    })
    .test({
      name: "end-after-start",
      message: "End date must be after start date",
      test: (endDate, context) => {
        const startDate = context.parent.startDate as Moment | undefined;
        return moment.isMoment(endDate) && moment.isMoment(startDate)
          ? endDate.isAfter(startDate, "day")
          : false;
      },
    })
    .required("End date is required"),
});
