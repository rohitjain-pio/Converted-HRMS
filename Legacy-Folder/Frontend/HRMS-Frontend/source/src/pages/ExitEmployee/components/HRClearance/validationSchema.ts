import * as Yup from 'yup'
export const validationSchema = Yup.object().shape({
  advanceBonusRecoveryAmount: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === undefined ? 0 : value;
    })
    .required("Advance Bonus Recovery is required")
    .min(0, "Advance Bonus Recovery cannot be negative"),

  currentEL: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === undefined ? 0 : value;
    })
    .required("Current EL is required")
    .min(0, "Current EL cannot be negative"),

  numberOfBuyOutDays: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === undefined ? 0 : value;
    })
    .required("Number of Buyout days is required")
    .min(0, "Number of Buyout days cannot be negative"),

  serviceAgreementDetails: Yup.string().default(""),
  exitInterviewStatus: Yup.boolean().required(
    "Exit Interview Status is required"
  ),
  exitInterviewDetails: Yup.string().default(""),

  hrAttachment: Yup.mixed<File | string>()
    .nullable()
    .notRequired()
    .default(null)
    .test("fileSize", "File size should not exceed 5 MB", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    }),
});