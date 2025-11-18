import * as Yup from 'yup'
export const validationSchema = Yup.object().shape({
    ktStatus: Yup.string().required(),
    notes: Yup.string().default(""),
    ktUser: Yup.array().of(Yup.string().required()).default([]),

    departmentAttachment: Yup.mixed<File | string>()
      .nullable()
      .test("fileSize", "File size should not exceed 5 MB", (value) => {
        if (!value || typeof value === "string") return true;
        return value.size <= 5 * 1024 * 1024;
      }),
  });
