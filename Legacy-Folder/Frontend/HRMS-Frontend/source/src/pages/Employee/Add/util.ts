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
