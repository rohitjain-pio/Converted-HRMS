import * as Yup from "yup";

export const supportQuerySchema = Yup.object().shape({
  bugType: Yup.string().required("Bug Type is required"),
  subject: Yup.string()
    .max(200, "Subject must be at most 200 characters")
    .required("Subject is required"),
  description: Yup.string()
    .max(600, "Description must be at most 600 characters")
    .required("Description is required"),
  attachment: Yup.mixed<File>()
    .nullable()
    .notRequired()
    .default(null)
    .test("fileSize", "File size should not exceed 5 MB", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    }),
});
