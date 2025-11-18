
export const status = [
  { id: false, label: "No" },
  { id: true, label: "Yes" },
];

export const ASSET_CONDITION_OPTIONS = [
  { id: "1", label: "OK" },
  { id: "2", label: "Damaged" },
  { id: "3", label: "Missing" },
];
export type FormValues = {
  accessRevoked: boolean;
  assetReturned: boolean;
  assetCondition: string;
  note: string;
  itClearanceCertification: boolean;
  itAttachment?: File | null|string;
};

export  const defaultValues: FormValues = {
  accessRevoked: false,
  assetReturned: false,
  assetCondition: "1",
  note: "",
  itClearanceCertification: false,
  itAttachment: null,
};
