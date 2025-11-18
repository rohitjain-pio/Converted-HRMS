import { regex } from "@/utils/regexPattern";
import moment, { Moment } from "moment";
import * as Yup from "yup";
const {
  name,
  email,
  nameMaxLength_35,
  notOnlyNumbers,
  minCharactersExist,
  nameMaxLength_20,
  noWhitespace,
} = regex;

export const validationSchema = Yup.object().shape({
  firstName: Yup.string()
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
    .required("First name is required."),
  middleName: Yup.string()
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
    .max(nameMaxLength_35.number, nameMaxLength_35.message),
  lastName: Yup.string()
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
    .required("Last name is required."),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .matches(email.pattern, email.message)
    .min(8, "Email must be at least 8 characters long.")
    .max(50, "Email cannot exceed 50 characters."),
  designationId: Yup.string().required("Designation is required"),
  departmentId: Yup.string().required("Department is required"),
  teamId: Yup.string().required("Team is required"),
  reportingManagerId: Yup.number().required("Reporting manager is required"),
  employmentStatus: Yup.string().required("Employment Status is required"),
  joiningDate: Yup.mixed<Moment>()
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (joiningDate) => moment.isMoment(joiningDate),
    })
    .required("Joining Date is required"),
  jobType: Yup.string().required("Job Type is required"),
  branchId: Yup.string()
    .required("Branch is required")
    .notOneOf(["0"], "Please select a valid option"),
  employeeCode: Yup.string()
    .required("Employee Code is required")
    .matches(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed")
    .max(nameMaxLength_20.number, nameMaxLength_20.message),
  timeDoctorUserId: Yup.string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .defined()
    .max(nameMaxLength_20.number, nameMaxLength_20.message)
    .matches(noWhitespace.pattern, noWhitespace.message),
  backgroundVerificationstatus: Yup.string().required(
    "Background verification is required"
  ),
  criminalVerification: Yup.string().required(
    "Criminal verification is required"
  ),
  totalExperienceYear: Yup.number()
    .typeError("Total experience years must be a number")
    .integer("Total experience years must be an integer")
    .min(0, "Total experience years must be positive")
    .max(40, ({ max }) => `Total experience years must not exceed ${max}`)
    .required("Total experience years is required"),
  totalExperienceMonth: Yup.number()
    .typeError("Total experience months must be a number")
    .integer("Total experience months must be an integer")
    .min(0, "Total experience months must be positive")
    .max(11, ({ max }) => `Total experience months must not exceed ${max}`)
    .required("Total experience months is required"),
  relevantExperienceYear: Yup.number()
    .typeError("Relevant experience years must be a number")
    .integer("Relevant experience years must be an integer")
    .min(0, "Relevant experience years must be positive")
    .max(40, ({ max }) => `Relevant experience years must not exceed ${max}`)
    .required("Relevant experience years is required"),
  relevantExperienceMonth: Yup.number()
    .typeError("Relevant experience months must be a number")
    .integer("Relevant experience months must be an integer")
    .min(0, "Relevant experience months must be positive")
    .max(11, ({ max }) => `Relevant experience months must not exceed ${max}`)
    .required("Relevant experience months is required"),
  probationMonths: Yup.number()
    .typeError("Probation months must be a number")
    .positive("Probation months must be positive")
    .integer("Probation months must be an integer")
    .required("Probation months is required"),
});
