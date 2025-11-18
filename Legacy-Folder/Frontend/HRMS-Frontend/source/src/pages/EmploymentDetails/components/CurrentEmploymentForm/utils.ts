
export function formatDuration(years: number, months: number) {
  if (years < 0 || months < 0) {
    return "Invalid input";
  }

  if (years === 0 && months === 0) {
    return "0 months";
  }

  const yearStr = years === 1 ? `${years} year` : `${years} years`;
  const monthStr = months === 1 ? `${months} month` : `${months} months`;

  if (years === 0) {
    return monthStr;
  } else if (months === 0) {
    return yearStr;
  } else {
    return `${yearStr} ${monthStr}`;
  }
}

export const jobTypes = [
  { id: 1, label: "Probation" },
  { id: 2, label: "Confirmed" },
  { id: 3, label: "Training" },
];

export const backgroundVerificationStatuses = [
  { id: 1, label: "Pending" },
  { id: 2, label: "Successful" },
  { id: 3, label: "Unsuccessful" },
];

export const CRIMINAL_VERIFICATION_STATUS = {
  PENDING: "1",
  COMPLETED: "2",
} as const;

export const criminalVerificationStatuses = [
  { id: CRIMINAL_VERIFICATION_STATUS.PENDING, label: "Pending" },
  { id: CRIMINAL_VERIFICATION_STATUS.COMPLETED, label: "Completed" },
];

export function convertApiValueToStr(apiValue: number | null) {
  return apiValue === 0 || apiValue === null ? "" : String(apiValue);
}

export function convertFormStrToApiValue(formValue: string) {
  return formValue === "" ? null : Number(formValue);
}



