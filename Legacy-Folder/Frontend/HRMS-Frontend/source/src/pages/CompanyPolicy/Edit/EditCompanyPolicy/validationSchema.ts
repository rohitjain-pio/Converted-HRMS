import { fileValidation } from "@/utils/fileSchema";
import { regex } from "@/utils/regexPattern";
import * as Yup from "yup";
const {
  notOnlyNumbers,
  nameMaxLength_50,
  nameMaxLength_250,
  minCharactersExist,
} = regex;

export const getValidationSchema = (isFileRequired: boolean) =>
  Yup.object().shape({
    name: Yup.string()
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
      .required("Name is required"),
    documentCategoryId: Yup.string().required("Category is required"),
    statusId: Yup.string().required("Status is required"),
    description: Yup.string()
      .max(nameMaxLength_250.number, nameMaxLength_250.message)
      .required("Description is required"),
    accessibility: Yup.boolean(),
    emailRequest: Yup.boolean().defined(),
    fileContent: isFileRequired
      ? Yup.mixed<File>()
          .required("File is required")
          .test("fileValidation", fileValidation)
      : Yup.mixed<File>().notRequired().test("fileValidation", fileValidation),
  });

export type CompanyPolicyFormData = Yup.InferType<
  ReturnType<typeof getValidationSchema>
>;
