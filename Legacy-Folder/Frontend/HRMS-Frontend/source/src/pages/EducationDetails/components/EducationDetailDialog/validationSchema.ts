import { qualificationToId } from "@/utils/constants";
import { fileValidation } from "@/utils/fileSchema";
import { regex } from "@/utils/regexPattern";
import moment from "moment";
import { Moment } from "moment";
import * as Yup from 'yup'
const {
  notOnlyNumbers,
  nameMaxLength_50,
  nameMaxLength_100,
  minCharactersExist,
} = regex;

export const getValidationSchema = (
  isFileRequired: boolean,
  existingQualification: string[],
  currentQualification: string
) =>
  Yup.object().shape({
    qualificationId: Yup.string()
      .required("Qualification is required")
      .test(
        "unique-qualification",
        "This qualification already exists",
        (value) => {
          if (!value) return false;
          if (
            currentQualification &&
            value === currentQualification.toString()
          ) {
            return true;
          }
          return !existingQualification.includes(value);
        }
      ),
    collegeUniversity: Yup.string()
      .trim()
      .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
        if (!value) return true;
        return notOnlyNumbers.pattern.test(value);
      })
      .test(minCharactersExist.key, minCharactersExist.message, (value) => {
        if (!value) return true;
        return (value.match(minCharactersExist.pattern) || []).length >= 2;
      })
      .max(nameMaxLength_100.number, nameMaxLength_100.message)
      .required("College/University is required"),
    aggregatePercentage: Yup.number()
      .typeError("Aggregate percentage must be a number")
      .positive("Aggregate percentage must be positive")
      .max(100, "Aggregate percentage must not exceed 100%")
      .required("Aggregate percentage is required"),
    file: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().nullable().test("fileValidation", fileValidation),
    degreeName: Yup.string()
      .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
        if (!value) return true;
        return notOnlyNumbers.pattern.test(value);
      })
      .test(minCharactersExist.key, minCharactersExist.message, (value) => {
        if (!value) return true;
        return (value.match(minCharactersExist.pattern) || []).length >= 2;
      })
      .max(nameMaxLength_50.number, nameMaxLength_50.message)
      .required("Degree name is required"),
    startYear: Yup.mixed<Moment>()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (startYear) => moment.isMoment(startYear),
      })
      .test({
        name: "no-future-dates",
        message: "Start year cannot be in the future",
        test: (startYear) =>
          moment.isMoment(startYear)
            ? startYear.isSameOrBefore(moment(), "month")
            : false,
      })
      .required("Start year is required"),
    endYear: Yup.mixed<Moment>()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (endYear) => moment.isMoment(endYear),
      })
      .test({
        name: "no-future-dates",
        message: "End year cannot be in the future",
        test: (endYear) =>
          moment.isMoment(endYear)
            ? endYear.isSameOrBefore(moment(), "month")
            : false,
      })
      .test({
        name: "end-after-start",
        message: "End year must be after start year",
        test: (endYear, context) => {
          const startYear = context.parent.startYear as Moment | undefined;

          if (!moment.isMoment(startYear)) {
            return true;
          }

          return moment.isMoment(endYear)
            ? endYear.isAfter(startYear, "month")
            : false;
        },
      })
      .when(["startYear", "qualificationId"], {
        is: (
          startYear: Moment | undefined,
          qualificationId: string | undefined
        ) =>
          moment.isMoment(startYear) &&
          qualificationId !== undefined &&
          qualificationId !== "",
        then: (schema) =>
          schema.test({
            name: "check-year-difference",
            test: (endYear, context) => {
              const startYear = context.parent.startYear as Moment;
              const qualificationId = context.parent.qualificationId as string;

              if (!moment.isMoment(endYear)) {
                return false;
              }

              const diffInYears = endYear.diff(startYear, "year");

              if (
                qualificationId === qualificationToId["HSC"].toString() ||
                qualificationId === qualificationToId["SSC"].toString()
              ) {
                if (diffInYears < 1) {
                  return context.createError({
                    message:
                      "The end year must be at least 1 year after the start year",
                  });
                }
              } else {
                if (diffInYears < 2) {
                  return context.createError({
                    message:
                      "The end year must be at least 2 years after the start year",
                  });
                }
              }

              return true;
            },
          }),
      })
      .required("End year is required"),
  });
export  type FormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;

