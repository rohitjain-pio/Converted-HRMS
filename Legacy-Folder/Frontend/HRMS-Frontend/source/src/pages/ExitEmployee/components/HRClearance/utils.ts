
export type FormValues = {
  advanceBonusRecoveryAmount: number;
  serviceAgreementDetails: string;
  currentEL: number;
  numberOfBuyOutDays: number;
  exitInterviewStatus: boolean;
  exitInterviewDetails: string;
  hrAttachment: File | string | null;
}

export const defaultValues: FormValues = {
  advanceBonusRecoveryAmount: 0,
  serviceAgreementDetails: "",
  currentEL: 0,
  numberOfBuyOutDays: 0,
  exitInterviewStatus: false,
  exitInterviewDetails: "",
  hrAttachment: null,
};

export const status = [
  { id: false, label: "Pending" },
  { id: true, label: "Completed" },
];

