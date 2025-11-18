import * as Yup from "yup";
export const schema = Yup.object({
  fnFStatus: Yup.boolean().required("FnF status is required"),
  fnFAmount: Yup.string()
    .trim()
    .required("FnF amount is required")
    .test(
      "valid-amount",
      "Enter a positive number (up to 2 decimals)",
      (val) => {
        if (!val) return false;
        return /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0;
      }
    ),
  issueNoDueCertificate: Yup.boolean().required("Required"),
  note: Yup.string().defined(),

  accountAttachment: Yup.mixed<File | string>()
    .nullable()
    .test("fileSize", "File size should not exceed 5 MB", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    }),
});
