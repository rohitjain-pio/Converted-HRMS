import {
  CompanyPolicyListSearchFilter,
  CompanyPolicyType,
} from "@/services/CompanyPolicies";

export interface DocumentDetailsProps {
  data: CompanyPolicyType;
}

export interface FilterFormProps {
  onSearch: (values: CompanyPolicyListSearchFilter) => void;
  addIcon?: React.ReactNode;
}
