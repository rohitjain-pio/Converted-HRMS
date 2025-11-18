import { OTHER_RELATIONSHIP_ID } from '@/utils/constants';
import { fileValidation } from '@/utils/fileSchema';
import { regex } from '@/utils/regexPattern';
import moment from 'moment';
import { Moment } from 'moment';
import * as Yup from 'yup'
const { name, notOnlyNumbers, nameMaxLength_35, minCharactersExist } = regex;

export const getValidationSchema = (isFileRequired: boolean) =>
  Yup.object().shape({
    nomineeName: Yup.string()
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
      .required("Nominee name is required."),
    dob: Yup.mixed<Moment>()
      .required("Date of birth is required")
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (dob) => moment.isMoment(dob),
      })
      .test({
        name: "is-past",
        message: "Date of birth must be in the past",
        test: (dob) =>
          moment.isMoment(dob) ? dob.isSameOrBefore(moment(), "day") : false,
      })
      .test({
        name: "is-one-year-before",
        message: "Date should be at least one year before current date.",
        test: (dob) => {
          if (!dob) {
            return false;
          }
          return moment(dob).isBefore(moment().subtract(1, "year"));
        },
      }),
    age: Yup.number().required("Age is required"),
    careOf: Yup.string()
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
      .when("age", {
        is: (value: number) => value < 18,
        then: (schema) => schema.required("Care of field is required"),
        otherwise: (schema) => schema,
      }),
    relationshipId: Yup.string().required("Relationship is required"),
    others: Yup.string()
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
      .when("relationshipId", {
        is: (value: string) => value === OTHER_RELATIONSHIP_ID.toString(),
        then: (schema) => schema.required("Relationship is required"),
        otherwise: (schema) => schema,
      }),
    percentage: Yup.number()
      .typeError("Percentage must be a number")
      .min(1, "Percentage must be at least 1%")
      .required("Percentage is required")
      .max(
        Yup.ref("$.remaining"),
        ({ max }) => `Percentage can not exceed the remaining ${max}%`
      ),
    idProofDocType: Yup.string().required("Document Type is required"),
    file: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().nullable().test("fileValidation", fileValidation),
  });
