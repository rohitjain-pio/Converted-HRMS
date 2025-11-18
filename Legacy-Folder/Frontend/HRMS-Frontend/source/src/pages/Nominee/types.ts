import { NomineeSearchFilter, NomineeType } from "@/services/Nominee";

export interface DocumentDetailsProps {
  data: NomineeType;
}

export interface FilterFormProps {
  onSearch: (values: NomineeSearchFilter) => void;
  addIcon?: React.ReactNode
}