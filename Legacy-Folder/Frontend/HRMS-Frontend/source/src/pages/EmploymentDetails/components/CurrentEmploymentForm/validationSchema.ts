import { regex } from "@/utils/regexPattern";
import moment from "moment";
import { Moment } from "moment";
import * as Yup from 'yup'
const { email, nameMaxLength_250, nameMaxLength_20, noWhitespace } = regex;

const linkedInProfileRegex =
  /(https?:\/\/)?(www\.)?linkedin\.([a-z]+)\/in\/([A-Za-z0-9_-]+)\/?/;

export  const getValidationSchema = (hasRolePermission: boolean) =>
  Yup.object().shape({
    employeeId: Yup.string().required("Employee Id is required"),
    employeeCode: Yup.string().required("Employee Code is required"),
    email: Yup.string()
      .trim()
      .required("Email is required")
      .matches(email.pattern, email.message)
      .min(8, "Email must be at least 8 characters long.")
      .max(50, "Email cannot exceed 50 characters."),
    designationId: Yup.string().required("Designation is required"),
    departmentId: Yup.string().required("Department is required"),
    teamId: Yup.string().required("Team is required"),
    employmentStatus: Yup.string().defined(),
    jobType: Yup.string().defined(),
    branchId: Yup.string().required("Branch is required"),
    roleId: hasRolePermission
      ? Yup.string().required("Role is required")
      : Yup.string().defined(),
    isReportingManager: Yup.boolean().defined(),
    timeDoctorUserId: Yup.string()
      .trim()
      .transform((val) => (val === "" ? null : val))
      .nullable()
      .defined()
      .max(nameMaxLength_20.number, nameMaxLength_20.message)
      .matches(noWhitespace.pattern, noWhitespace.message),
    employeeStatus: Yup.string().defined(),
    reportingManagerId: Yup.string().trim().defined().nullable(),
    backgroundVerificationstatus: Yup.string().defined(),
    criminalVerification: Yup.string().defined(),
    joiningDate: Yup.mixed<Moment>()
      .defined()
      .nullable()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (joiningDate) => {
          if (joiningDate === null || typeof joiningDate === "undefined") {
            return true;
          }
          return moment.isMoment(joiningDate);
        },
      }),
    probationMonths: Yup.number()
      .defined()
      .typeError("Probation months must be a number")
      .min(0, "Total experience years must be positive")
      .integer("Probation months must be an integer"),
    confirmationDate: Yup.mixed<Moment>()
      .defined()
      .nullable()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (confirmationDate) => {
          if (
            confirmationDate === null ||
            typeof confirmationDate === "undefined"
          ) {
            return true;
          }
          return moment.isMoment(confirmationDate);
        },
      }),
    totalExperienceYears: Yup.number()
      .defined()
      .typeError("Total experience years must be a number")
      .integer("Total experience years must be an integer")
      .min(0, "Total experience years must be positive")
      .max(40, ({ max }) => `Total experience years must not exceed ${max}`),
    totalExperienceMonths: Yup.number()
      .defined()
      .typeError("Total experience months must be a number")
      .integer("Total experience months must be an integer")
      .min(0, "Total experience months must be positive")
      .max(11, ({ max }) => `Total experience months must not exceed ${max}`),
    relevantExperienceYears: Yup.number()
      .defined()
      .typeError("Relevant experience years must be a number")
      .integer("Relevant experience years must be an integer")
      .min(0, "Relevant experience years must be positive")
      .max(40, ({ max }) => `Relevant experience years must not exceed ${max}`),
    relevantExperienceMonths: Yup.number()
      .defined()
      .typeError("Relevant experience months must be a number")
      .integer("Relevant experience months must be an integer")
      .min(0, "Relevant experience months must be positive")
      .max(
        11,
        ({ max }) => `Relevant experience months must not exceed ${max}`
      ),
    extendedConfirmationDate: Yup.mixed<Moment>()
      .defined()
      .nullable()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (value) => {
          if (!value) return true;
          return moment.isMoment(value);
        },
      })
      .when("$updated", (updated, schema) => {
        return !updated[0]
          ? schema.notRequired()
          : schema.required("Extended confirmation date is required");
      }),
    probExtendedWeeks: Yup.number()
      .typeError("Extended probation weeks must be a number")
      .integer("Extended probation weeks must be an integer")
      .when("$updated", (updated, schema) => {
        return !updated[0]
          ? schema
          : schema.positive("Extended probation weeks must be positive");
      }),
    linkedInUrl: Yup.string()
      .defined()
      .test({
        name: "is-valid-linkedin-url",
        message: "Enter valid LinkedIn profile URL",
        test: (value) => {
          if (!value) return true;
          return linkedInProfileRegex.test(value);
        },
      })
      .max(nameMaxLength_250.number, nameMaxLength_250.message),
  });
