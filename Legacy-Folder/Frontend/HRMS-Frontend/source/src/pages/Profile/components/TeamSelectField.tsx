import { useMemo } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { getTeamList, GetTeamListResponse } from "@/services/Employees";

interface TeamSelectFieldProps {
  isEditable?: boolean;
}

const TeamSelectField = ({ isEditable }: TeamSelectFieldProps) => {
  const { data } = useAsync<GetTeamListResponse>({
    requestFn: async (): Promise<GetTeamListResponse> => {
      return await getTeamList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options = useMemo(() => data?.result || [], [data]);

  return (
    <FormSelectField
      name="teamId"
      label="Team"
      textFormat={!isEditable}
      options={options}
      labelKey="name"
      valueKey="id"
      required
    />
  );
};

export default TeamSelectField;
