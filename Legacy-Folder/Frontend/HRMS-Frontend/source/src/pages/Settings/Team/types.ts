import { TeamSearchFilter } from "@/services/Team";

export interface FilterFormProps {
  onSearch: (values: TeamSearchFilter) => void;
  addIcon?: React.ReactNode;
}
