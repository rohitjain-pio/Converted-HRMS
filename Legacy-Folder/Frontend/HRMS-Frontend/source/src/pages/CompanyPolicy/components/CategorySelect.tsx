import { useMemo } from "react";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  GetCategoriesApiResponse,
  PolicyCategoryType,
  getDocumentCategories,
} from "@/services/CompanyPolicies";
import FormSelectField from "@/components/FormSelectField";

interface CategorySelectProps {
  name?: string;
  required: boolean;
}

const CategorySelect = ({
  name = "documentCategoryId",
  required,
}: CategorySelectProps) => {
  const { data } = useAsync<GetCategoriesApiResponse>({
    requestFn: async (): Promise<GetCategoriesApiResponse> => {
      return await getDocumentCategories();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options: PolicyCategoryType[] = useMemo(
    () => data?.result || [],
    [data]
  );

  return (
    <FormSelectField
      name={name}
      label="Category"
      options={options}
      labelKey="categoryName"
      valueKey="id"
      required={required}
    />    
  );
};

export default CategorySelect;
