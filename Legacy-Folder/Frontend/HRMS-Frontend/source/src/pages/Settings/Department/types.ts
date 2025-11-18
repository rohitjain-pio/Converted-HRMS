import { DepartmentSearchFilter } from "@/services/Department";

export interface FilterFormProps {
  onSearch: (values: DepartmentSearchFilter) => void;
  addIcon?: React.ReactNode;
}
