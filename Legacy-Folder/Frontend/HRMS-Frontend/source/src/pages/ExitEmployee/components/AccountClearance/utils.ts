
export const status = [
  { id: false, label: "No" },
  { id: true, label: "Yes" },
];

export const FNF_STATUS_OPTIONS = [
  { id: false, label: "Pending" },
  { id: true, label: "Completed" },
];

export type FormValues = {
  fnFStatus: boolean;
  fnFAmount: string;
  issueNoDueCertificate: boolean;
  note: string;
  accountAttachment?: File | null | string;
};
