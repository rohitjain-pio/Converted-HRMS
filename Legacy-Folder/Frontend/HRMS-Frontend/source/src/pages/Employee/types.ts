import { Dispatch, SetStateAction } from "react";
import { EmployeeSearchFilter } from "@/services/Employees";

export interface FilterFormProps {
  onSearch: (values: EmployeeSearchFilter) => void;
  roleId: number;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
}
