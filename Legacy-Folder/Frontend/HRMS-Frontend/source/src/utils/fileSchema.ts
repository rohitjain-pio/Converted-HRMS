import * as Yup from "yup";

export const fileValidation = (
  file: File | undefined | null,
  { createError }: Yup.TestContext
) => {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

  if (!file) {
    return true;
  }

  if (!allowedTypes.includes(file.type)) {
    return createError({
      message:
        "Unsupported file format. Only .pdf, .jpg, .jpeg, .png formats are supported",
    });
  }

  if (file.size >= maxSize) {
    return createError({
      message: "File size must be less than 5MB",
    });
  }

  return true;
};
