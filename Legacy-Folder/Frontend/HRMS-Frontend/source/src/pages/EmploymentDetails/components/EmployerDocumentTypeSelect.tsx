import { useMemo } from "react";
import FormSelectField from "@/components/FormSelectField";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import { getEmployerDocumentTypeList } from "@/services/EmploymentDetails/employmentDetailsService";
import {
  EmployerDocumentType,
  GetEmployerDocumentTypeListApiResponse,
  GetEmployerDocumentTypeListArgs,
} from "@/services/EmploymentDetails";

type Props = {
  name?: string;
  required?: boolean;
  documentFor: GetEmployerDocumentTypeListArgs;
};

const EmployerDocumentTypeSelect = (props: Props) => {
  const { name = "employerDocumentTypeId", required, documentFor } = props;

  const { data } = useAsync<GetEmployerDocumentTypeListApiResponse>({
    requestFn: async (): Promise<GetEmployerDocumentTypeListApiResponse> => {
      return await getEmployerDocumentTypeList(documentFor);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: EmployerDocumentType[] = useMemo(
    () => data?.result || [],
    [data]
  );

  return (
    <FormSelectField
      name={name}
      label="Document Type"
      options={options}
      labelKey="documentName"
      valueKey="id"
      required={required}
    />
  );
};

export default EmployerDocumentTypeSelect;
