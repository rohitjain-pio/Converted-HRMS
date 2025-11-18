import { GovtDocumentType } from "@/services/Documents";
import { PersonalDetailDocumentTypeMap } from "@/utils/constants";
import { fileValidation } from "@/utils/fileSchema";
import { regex } from "@/utils/regexPattern";
import moment from "moment";
import { Moment } from "moment";
import * as Yup from 'yup'
const {
  PAN_NUMBER,
  AADHAR_NUMBER,
  PASSPORT_NUMBER,
  VOTER_CARD_NUMBER,
  DRIVING_LICENSE_NUMBER,
} = PersonalDetailDocumentTypeMap;

const {
  allowOnlyAlphaNumerics,
  nameMaxLength_20,
  notOnlyNumbers,
  validAdhaar,
} = regex;

export const getValidationSchema = (
  isFileRequired: boolean,
  documentTypes: GovtDocumentType[],
  existingDocTypes: string[],
  currentDocType: string
) =>
  Yup.object().shape({
    documentTypeId: Yup.string()
      .required("Document Type is required")
      .test(
        "unique-document-type",
        "This document type already exists",
        (value) => {
          if (!value) return false;
          if (currentDocType && value === currentDocType.toString()) {
            return true;
          }
          return !existingDocTypes.includes(value);
        }
      ),
    documentNumber: Yup.string()
      .when("documentTypeId", {
        is: (type: string) => type === PAN_NUMBER.toString(),
        then: (schema) =>
          schema.matches(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            "PAN Card must have 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g., ABCDE1234F)."
          ),
      })
      .when("documentTypeId", {
        is: (type: string) => type === AADHAR_NUMBER.toString(),
        then: (schema) =>
          schema
            .max(nameMaxLength_20.number, nameMaxLength_20.message)
            .test(validAdhaar.key, validAdhaar.message, (value) => {
              if (!value) return true;
              const digitsOnly = value.replace(/[\s-]/g, "");
              return digitsOnly ? validAdhaar.pattern.test(digitsOnly) : false;
            }),
      })
      .when("documentTypeId", {
        is: (type: string) => type === PASSPORT_NUMBER.toString(),
        then: (schema) =>
          schema
            .max(nameMaxLength_20.number, nameMaxLength_20.message)
            .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
              if (!value) return true;
              return notOnlyNumbers.pattern.test(value);
            })
            .test(
              allowOnlyAlphaNumerics.key,
              allowOnlyAlphaNumerics.message,
              (value) => {
                if (!value) return true;
                return allowOnlyAlphaNumerics.pattern.test(value);
              }
            ),
      })
      .when("documentTypeId", {
        is: (type: string) => type === VOTER_CARD_NUMBER.toString(),
        then: (schema) =>
          schema
            .max(nameMaxLength_20.number, nameMaxLength_20.message)
            .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
              if (!value) return true;
              return notOnlyNumbers.pattern.test(value);
            })
            .test(
              allowOnlyAlphaNumerics.key,
              allowOnlyAlphaNumerics.message,
              (value) => {
                if (!value) return true;
                return allowOnlyAlphaNumerics.pattern.test(value);
              }
            ),
      })
      .when("documentTypeId", {
        is: (type: string) => type === DRIVING_LICENSE_NUMBER.toString(),
        then: (schema) =>
          schema
            .max(nameMaxLength_20.number, nameMaxLength_20.message)
            .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
              if (!value) return true;
              return notOnlyNumbers.pattern.test(value);
            })
            .test(
              allowOnlyAlphaNumerics.key,
              allowOnlyAlphaNumerics.message,
              (value) => {
                if (!value) return true;
                return allowOnlyAlphaNumerics.pattern.test(value);
              }
            ),
      })
      .required("Document Number is required"),
    documentExpiry: Yup.mixed<Moment>().when("documentTypeId", {
      is: (value: string) =>
        documentTypes.find((type) => type.id === parseInt(value))
          ?.isExpiryDateRequired,
      then: (schema) =>
        schema
          .required("Document Expiry Date is required")
          .test({
            name: "is-valid",
            message: "Invalid Date",
            test: (expiryDate) => moment.isMoment(expiryDate),
          })
          .test({
            name: "no-past-date",
            message: "Expiry date cannot be in the past",
            test: (expiryDate) =>
              moment.isMoment(expiryDate)
                ? expiryDate.isSameOrAfter(moment(), "day")
                : false,
          }),
      otherwise: (schema) => schema.nullable(),
    }),
    file: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().nullable().test("fileValidation", fileValidation),
  });

export type AddUserDocumentFormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;