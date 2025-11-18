import { DocumentSearchFilter } from "@/services/Documents";

export interface FilterFormProps {
  onSearch: (values: DocumentSearchFilter) => void;
}