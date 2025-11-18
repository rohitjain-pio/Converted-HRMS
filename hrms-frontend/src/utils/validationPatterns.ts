/**
 * Validation Patterns and Utilities
 * Ported from Legacy React implementation
 * Source: Legacy-Folder/Frontend/HRMS-Frontend/source/src/utils/regexPattern.ts
 */

export const validationPatterns = {
  name: {
    pattern: /^[a-zA-Z\s'-]+$/,
    message: "Only letters, spaces, hyphens and apostrophes are allowed",
    key: "name-pattern"
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
    minLength: 8,
    maxLength: 50,
    key: "email-pattern"
  },
  notOnlyNumbers: {
    pattern: /[a-zA-Z]/,
    message: "Cannot contain only numbers",
    key: "not-only-numbers"
  },
  alphanumeric: {
    pattern: /^[a-zA-Z0-9]+$/,
    message: "Only alphanumeric characters are allowed",
    key: "alphanumeric"
  },
  noWhitespace: {
    pattern: /^\S*$/,
    message: "No whitespace allowed",
    key: "no-whitespace"
  },
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    message: "Invalid PAN format (e.g., ABCDE1234F)",
    key: "pan-pattern"
  },
  aadhaar: {
    pattern: /^\d{12}$/,
    message: "Aadhaar must be exactly 12 digits",
    key: "aadhaar-pattern"
  }
};

/**
 * Validate name fields (first name, last name, middle name, father name)
 */
export function validateName(value: string | null | undefined, fieldName: string, required: boolean = true, allowSingleLetter: boolean = false): string | null {
  const trimmed = value?.trim();
  
  if (!trimmed) {
    return required ? `${fieldName} is required` : null;
  }
  
  // Check if contains only numbers
  if (!validationPatterns.notOnlyNumbers.pattern.test(trimmed)) {
    return validationPatterns.notOnlyNumbers.message;
  }
  
  // Check if matches name pattern
  if (!validationPatterns.name.pattern.test(trimmed)) {
    return validationPatterns.name.message;
  }
  
  // Check minimum letter count (at least 2 alphabetic characters, or 1 if allowSingleLetter is true)
  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  const minLetters = allowSingleLetter ? 1 : 2;
  if (letterCount < minLetters) {
    return `${fieldName} must contain at least ${minLetters} letter${minLetters > 1 ? 's' : ''}`;
  }
  
  // Check maximum length
  if (trimmed.length > 35) {
    return `${fieldName} cannot exceed 35 characters`;
  }
  
  return null;
}

/**
 * Validate email field
 */
export function validateEmail(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  
  if (!trimmed) {
    return 'Email is required';
  }
  
  // Check email pattern
  if (!validationPatterns.email.pattern.test(trimmed)) {
    return validationPatterns.email.message;
  }
  
  // Check minimum length
  if (trimmed.length < validationPatterns.email.minLength) {
    return `Email must be at least ${validationPatterns.email.minLength} characters`;
  }
  
  // Check maximum length
  if (trimmed.length > validationPatterns.email.maxLength) {
    return `Email cannot exceed ${validationPatterns.email.maxLength} characters`;
  }
  
  return null;
}

/**
 * Validate employee code
 */
export function validateEmployeeCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  
  if (!trimmed) {
    return 'Employee code is required';
  }
  
  // Check alphanumeric pattern
  if (!validationPatterns.alphanumeric.pattern.test(trimmed)) {
    return validationPatterns.alphanumeric.message;
  }
  
  // Check maximum length
  if (trimmed.length > 20) {
    return 'Employee code cannot exceed 20 characters';
  }
  
  return null;
}

/**
 * Validate Time Doctor User ID
 */
export function validateTimeDoctorUserId(value: string | null | undefined): string | null {
  if (!value) {
    return null; // Optional field
  }
  
  const trimmed = value.trim();
  
  // Check for whitespace
  if (!validationPatterns.noWhitespace.pattern.test(trimmed)) {
    return validationPatterns.noWhitespace.message;
  }
  
  // Check maximum length
  if (trimmed.length > 20) {
    return 'Time Doctor User ID cannot exceed 20 characters';
  }
  
  return null;
}

/**
 * Validate PAN number
 */
export function validatePAN(value: string | null | undefined): string | null {
  if (!value) {
    return null; // Optional field
  }
  
  const trimmed = value.trim().toUpperCase();
  
  // Check PAN pattern
  if (!validationPatterns.pan.pattern.test(trimmed)) {
    return validationPatterns.pan.message;
  }
  
  return null;
}

/**
 * Validate Aadhaar number
 */
export function validateAadhaar(value: string | null | undefined): string | null {
  if (!value) {
    return null; // Optional field
  }
  
  const trimmed = value.trim();
  
  // Check Aadhaar pattern (12 digits)
  if (!validationPatterns.aadhaar.pattern.test(trimmed)) {
    return validationPatterns.aadhaar.message;
  }
  
  return null;
}

/**
 * Validate experience years (0-40 range)
 */
export function validateExperienceYear(value: number | null | undefined, fieldName: string = 'Experience years'): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  
  const numValue = Number(value);
  
  if (!Number.isInteger(numValue)) {
    return `${fieldName} must be a whole number`;
  }
  
  if (numValue < 0) {
    return `${fieldName} cannot be negative`;
  }
  
  if (numValue > 40) {
    return `${fieldName} cannot exceed 40 years`;
  }
  
  return null;
}

/**
 * Validate experience months (0-11 range)
 */
export function validateExperienceMonth(value: number | null | undefined, fieldName: string = 'Experience months'): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  
  const numValue = Number(value);
  
  if (!Number.isInteger(numValue)) {
    return `${fieldName} must be a whole number`;
  }
  
  if (numValue < 0) {
    return `${fieldName} cannot be negative`;
  }
  
  if (numValue > 11) {
    return `${fieldName} cannot exceed 11 months`;
  }
  
  return null;
}

/**
 * Validate probation months (positive integer)
 */
export function validateProbationMonths(value: number | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return 'Probation months is required';
  }
  
  const numValue = Number(value);
  
  if (!Number.isInteger(numValue)) {
    return 'Probation months must be a whole number';
  }
  
  if (numValue <= 0) {
    return 'Probation months must be greater than 0';
  }
  
  if (numValue > 24) {
    return 'Probation months cannot exceed 24';
  }
  
  return null;
}

/**
 * Validate mobile number (10 digits)
 */
export function validateMobileNumber(value: string | null | undefined): string | null {
  if (!value) {
    return null; // Optional field
  }
  
  const trimmed = value.trim();
  
  if (!/^\d{10}$/.test(trimmed)) {
    return 'Mobile number must be exactly 10 digits';
  }
  
  return null;
}
