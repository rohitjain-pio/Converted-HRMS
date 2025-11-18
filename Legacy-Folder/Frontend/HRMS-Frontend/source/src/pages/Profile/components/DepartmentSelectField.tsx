import { useMemo } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { getDepartmentList, GetDepartmentListResponse } from "@/services/Employees";

interface DepartmentSelectFieldProps {
  isEditable?: boolean;
  required?: boolean;
}

const DepartmentSelectField = ({ isEditable, required }: DepartmentSelectFieldProps) => {
  const { data } = useAsync<GetDepartmentListResponse>({
    requestFn: async (): Promise<GetDepartmentListResponse> => {
      return await getDepartmentList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options = useMemo(() => data?.result || [], [data]);

  return (
    <FormSelectField
      name="departmentId"
      label="Department"
      textFormat={!isEditable}
      options={options}
      labelKey="name"
      valueKey="id"
      required={required}
    />
  );
};

export default DepartmentSelectField;
