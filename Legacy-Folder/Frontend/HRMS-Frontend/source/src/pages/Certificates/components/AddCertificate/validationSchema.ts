import { fileValidation } from '@/utils/fileSchema';
import { regex } from '@/utils/regexPattern';
import moment from 'moment';
import { Moment } from 'moment';
import * as Yup from 'yup'
const { notOnlyNumbers, nameMaxLength_50, minCharactersExist } = regex;

export const getValidationSchema = (
  isFileRequired: boolean,
  existingCertificates: string[],
  currentCertificate: string
) =>
  Yup.object().shape({
    certificateName: Yup.string()
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
      .test(
        "unique-certificate-name",
        "This certificate already exists",
        (value) => {
          if (!value) return true;
          if (value && currentCertificate && value === currentCertificate) {
            return true;
          }
          return !existingCertificates.includes(value);
        }
      )
      .required("Certificate name is required."),
    certificateExpiry: Yup.mixed<Moment>()
      .nullable()
      .defined()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (certificateExpiry) => {
          if (!certificateExpiry) {
            return true;
          }

          return moment.isMoment(certificateExpiry);
        },
      })
      .test({
        name: "no-past-dates",
        message: "Expiry date cannot be in the past",
        test: (certificateExpiry) => {
          if (!certificateExpiry) {
            return true;
          }

          return certificateExpiry.isSameOrAfter(moment(), "day");
        },
      }),
    file: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().nullable().test("fileValidation", fileValidation),
  });
export type CertificateFormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;
