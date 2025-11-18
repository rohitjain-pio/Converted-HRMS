export const regex = {
  phone: {
    key: "is-valid-phone-number",
    pattern: /^(?:\+1 [\d-]{10,12}|\+91 [\d-]{10,12})$/,
    message: "Phone number length must be between 10 to 12 digits",
  },
  allZeros: {
    key: "all-zeros-check",
    pattern: /^0+$/,
    message: "Phone number cannot consist entirely of zeros",
  },
  notOnlyNumbers: {
    key: "is-not-only-numbers",
    pattern: /^(?!\d+$).+$/,
    message: "This field cannot consist entirely of only numbers",
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    message: "Email must follow the correct pattern (e.g., user@example.com)",
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{8,}$/,
    message:
      "Password must be at least 8 characters, including an uppercase letter, a lowercase letter, and a digit.",
  },
  name: {
    key: "is-valid-pattern",
    pattern: /^[a-zA-Z0-9 _.-]+$/,
    message:
      "This field can only contain alphanumeric characters, underscores, spaces, hyphens, and periods.",
  },
  validBankName: {
    pattern: /^[a-zA-Z .,]+$/,
    message:
      "This field can only contain alphabets, spaces, commas, and periods.",
  },
  minCharactersExist: {
    key: "at-least-two-characters",
    pattern: /[a-zA-Z]/g,
    message: "This field must have at least 2 characters.",
  },
  allowOnlyAlphabets: {
    key: "allow-only-alphabets",
    pattern: /^[a-zA-Z ]+$/,
    message: "This field can only contain alphabets.",
  },
  allowOnlyAlphaNumerics: {
    key: "allow-only-alphanumerics",
    pattern: /^[a-zA-Z0-9 ]+$/,
    message: "This field can only contain alphanumeric characters.",
  },
  validAdhaar: {
    key: "is-valid-adhaar",
    pattern: /^\d{12}$/,
    message: "This field must contain exactly 12 digits",
  },
  validPFNumber: {
    key: "is-valid-PF-Number",
    pattern: /^[A-Z]{5}\d{17}$/,
    message: "Invalid PF Number",
  },
  validIFSCCode: {
    key: "is-valid-IFSC-code",
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    message: "IFSC number must follow the correct pattern (e.g., SBIN0005943)",
  },
  validBankAccountNumber: {
    key: "is-valid-bank-account-number",
    pattern: /^\d{9,18}$/,
    message: "Invalid bank account number",
  },
  validUANNumber: {
    key: "is-valid-UAN-number",
    pattern: /^\d{12}$/,
    message: "Invalid UAN number",
  },
  nameMaxLength_20: {
    number: 20,
    message: "This field cannot exceed 20 characters.",
  },
  nameMaxLength_35: {
    number: 35,
    message: "This field cannot exceed 35 characters.",
  },
  nameMaxLength_50: {
    number: 50,
    message: "This field cannot exceed 50 characters.",
  },
  nameMaxLength_100: {
    number: 100,
    message: "This field cannot exceed 100 characters.",
  },
  nameMaxLength_250: {
    number: 250,
    message: "This field cannot exceed 250 characters.",
  },
  nameMaxLength_500: {
    number: 500,
    message: "This field cannot exceed 500 characters.",
  },
  noWhitespace: {
    pattern: /^\S*$/,
    message: "No spaces allowed",
  },
};
