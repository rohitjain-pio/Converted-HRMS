export const calculateAge = (dob: Date) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
export interface AddNomineePopupProps {
  open: boolean;
  onClose: () => void;
  nomineeId: number;
  totalPercentage: number;
  nomineePercentage: number;
}
