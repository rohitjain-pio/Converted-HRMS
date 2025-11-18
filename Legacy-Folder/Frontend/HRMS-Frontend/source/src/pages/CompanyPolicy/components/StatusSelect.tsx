import { useMemo } from "react";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  GetCompanyPolicyStatusResponse,
  PolicyStatusType,
  getCompanyPolicyStatusList,
} from "@/services/CompanyPolicies";
import FormSelectField from "@/components/FormSelectField";

interface StatusSelectProps {
  name?: string;
  required: boolean;
}

const StatusSelect = ({ name = "statusId", required }: StatusSelectProps) => {
  const { data } = useAsync<GetCompanyPolicyStatusResponse>({
    requestFn: async (): Promise<GetCompanyPolicyStatusResponse> => {
      return await getCompanyPolicyStatusList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: PolicyStatusType[] = useMemo(() => data?.result || [], [data]);

  return (
    <FormSelectField
      name={name}
      label="Status"
      options={options.map(({ id, statusValue }) => ({
        // convert the value key to string
        id: String(id),
        statusValue,
      }))}
      labelKey="statusValue"
      valueKey="id"
      required={required}
    />
  );
};

export default StatusSelect;
