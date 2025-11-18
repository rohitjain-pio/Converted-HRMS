import { useMemo } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import {
  getEventStatusList,
  GetEventStatusListResponse,
} from "@/services/Events";
import methods from "@/utils";
import { useUserStore } from "@/store";
import { eventStatusToId, role } from "@/utils/constants";

type StatusSelectFieldProps = {
  name?: string;
  required?: boolean;
};

const StatusSelectField = (props: StatusSelectFieldProps) => {
  const { name = "statusId", required } = props;

  const { userData } = useUserStore();

  const isEmployeeRole = userData.roleName === role.EMPLOYEE;

  const { data } = useAsync<GetEventStatusListResponse>({
    requestFn: async (): Promise<GetEventStatusListResponse> => {
      return await getEventStatusList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: { id: number; statusValue: string }[] = useMemo(() => {
    let filteredOptions = data?.result || [];

    if (isEmployeeRole) {
      filteredOptions = filteredOptions.filter(
        (option) => option.id !== eventStatusToId["WIP / Pending Approval"]
      );
    }

    return filteredOptions;
  }, [data, isEmployeeRole]);

  return (
    <FormSelectField
      name={name}
      label="Status"
      options={options}
      labelKey="statusValue"
      valueKey="id"
      required={required}
    />
  );
};

export default StatusSelectField;
