import { UserGuideStatus } from "@/utils/constants";
import { regex } from "@/utils/regexPattern";
import * as Yup from "yup";
const { nameMaxLength_100 } = regex;

export const validationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .max(nameMaxLength_100.number, nameMaxLength_100.message)
    .required("Title is required"),
  status: Yup.string()
    .trim()
    .oneOf(
      Object.values(UserGuideStatus).map((value) => String(value)),
      "Select a valid status"
    )
    .required("Status is required"),
  menuId: Yup.string().trim().required("Menu is required"),
  content: Yup.string().trim().required("Content is required"),
});

export type FormValues = Yup.InferType<typeof validationSchema>;
