import { useMemo } from "react";
import useAsync from "@/hooks/useAsync";
import {
  getNomineeRelationship,
  GetNomineeRelationshipApiResponse,
  NomineeRelationshipType,
} from "@/services/Nominee";
import methods from "@/utils";
import FormSelectField from "@/components/FormSelectField";

interface RelationshipSelectFieldProps {
  name?: string;
  required?: boolean;
}

const RelationshipSelectField = ({
  name = "relationshipId",
  required,
}: RelationshipSelectFieldProps) => {
  const { data } = useAsync<GetNomineeRelationshipApiResponse>({
    requestFn: async (): Promise<GetNomineeRelationshipApiResponse> => {
      return await getNomineeRelationship();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  const options: NomineeRelationshipType[] = useMemo(() => data?.result || [], [
    data,
  ]);
  return (
    <FormSelectField
      name={name}
      label="Relationship"
      options={options}
      labelKey="name"
      valueKey="id"
      required={required}
    />
  );
};

export default RelationshipSelectField;