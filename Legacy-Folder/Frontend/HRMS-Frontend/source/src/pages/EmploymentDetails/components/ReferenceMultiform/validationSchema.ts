import { regex } from '@/utils/regexPattern';
import * as Yup from 'yup'
const {
  phone,
  allZeros,
  email,
  name,
  notOnlyNumbers,
  nameMaxLength_35,
  nameMaxLength_50,
  minCharactersExist,
} = regex;
const referenceSchema = Yup
.object({
  fullName: Yup.string()
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
    .required("Full Name is required."),
  designation: Yup.string()
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
    .required("Designation is required"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .matches(email.pattern, email.message)
    .min(8, "Email must be at least 8 characters long.")
    .max(50, "Email cannot exceed 50 characters."),
  contactNumber: Yup.string()
    .trim()
    .required("Contact number is required")
    .test("country-code", "Please select country code", (value) => {
      if (!value) return true;
      const countryCode = value.includes("+1") || value.includes("+91");
      return !countryCode ? false : true;
    })
    .test(phone.key, phone.message, (value) => {
      if (!value) return true;
      return phone.pattern.test(value);
    })
    .test(allZeros.key, allZeros.message, (value) => {
      if (!value) return true;
      const phoneNumber = value.split(" ")[1] || "";
      if (phoneNumber) {
        const digitsOnly = phoneNumber.replace(/\D/g, "");
        return digitsOnly ? !allZeros.pattern.test(digitsOnly) : false;
      }
    }),
});

export const getValidationSchema = (referenceLength: number) =>
  Yup.object({
    references: Yup.array()
      .of(referenceSchema)
      .min(
        referenceLength > 0 ? 1 : 2,
        `You need to provide at least ${
          referenceLength > 0 ? "one reference" : "two references"
        }`
      )
      .max(3, "You can add a maximum of three references"),
  });
