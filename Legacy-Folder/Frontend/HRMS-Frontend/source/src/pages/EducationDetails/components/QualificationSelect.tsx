import { useMemo } from "react";
import { getQualificationList, GetQualificationListApiResponse, QualificationType } from "@/services/EducationDetails";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import FormSelectField from "@/components/FormSelectField";

interface QualificationSelectProps {
  name?: string;
  required?: boolean;
}

const QualificationSelect = ({
  name = "qualificationId",
  required,
}: QualificationSelectProps) => {
  const { data } = useAsync<GetQualificationListApiResponse>({
    requestFn: async (): Promise<GetQualificationListApiResponse> => {
      return await getQualificationList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options: QualificationType[] = useMemo(() => data?.result || [], [
    data,
  ]);
  return (
    <FormSelectField
      name={name}
      label="Qualification"
      options={options}
      labelKey="shortName"
      valueKey="id"
      required={required}
    />
  );
};

export default QualificationSelect;