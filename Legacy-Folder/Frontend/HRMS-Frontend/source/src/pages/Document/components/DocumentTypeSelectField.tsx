import { useEffect, useMemo } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import {
  GetGovtDocumentApiResponse,
  getGovtDocumentTypes,
  GovtDocumentType,
} from "@/services/Documents";
import methods from "@/utils";

interface DocumentTypeSelectFieldProps {
  name?: string;
  required?: boolean;
  id: number;
  onApiResponse: (response: GovtDocumentType[]) => void;
}

const DocumentTypeSelectField = ({
  name = "documentTypeId",
  required,
  id,
  onApiResponse,
}: DocumentTypeSelectFieldProps) => {
  const { data } = useAsync<GetGovtDocumentApiResponse>({
    requestFn: async (): Promise<GetGovtDocumentApiResponse> => {
      return await getGovtDocumentTypes(id);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options: GovtDocumentType[] = useMemo(() => data?.result || [], [data]);

  useEffect(() => {
    onApiResponse(data?.result || [])
  }, [data]);
  
  return (
    <FormSelectField
      name={name}
      label="Document Type"
      options={options}
      labelKey="name"
      valueKey="id"
      required={required}
    />
  );
};

export default DocumentTypeSelectField;