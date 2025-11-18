import { DesignationSearchFilter } from "@/services/Designation";

export interface FilterFormProps {
  onSearch: (values: DesignationSearchFilter) => void;
  addIcon?: React.ReactNode;
}
