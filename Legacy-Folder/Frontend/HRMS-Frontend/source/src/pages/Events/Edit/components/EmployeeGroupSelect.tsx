import { useMemo } from "react";
import useAsync from "@/hooks/useAsync";
import {
  EmployeeGroupType,
  GetEmployeeGroupApiResponse,
  getEmployeeGroups,
} from "@/services/EmployeeGroups";
import methods from "@/utils";
import FormSelectField from "@/components/FormSelectField";

type EmployeeGroupSelectProps = {
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

const EmployeeGroupSelect = (props: EmployeeGroupSelectProps) => {
  const { name = "empGroupId", required, disabled } = props;

  const { data } = useAsync<GetEmployeeGroupApiResponse>({
    requestFn: async (): Promise<GetEmployeeGroupApiResponse> => {
      return await getEmployeeGroups();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: EmployeeGroupType[] = useMemo(
    () => data?.result || [],
    [data]
  );

  return (
    <FormSelectField
      name={name}
      label="Employee Group"
      options={options}
      labelKey="groupName"
      valueKey="id"
      required={required}
      disabled={disabled}
    />
  );
};

export default EmployeeGroupSelect;
