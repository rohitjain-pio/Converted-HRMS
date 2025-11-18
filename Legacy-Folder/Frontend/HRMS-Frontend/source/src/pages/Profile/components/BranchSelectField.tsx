import FormSelectField from "@/components/FormSelectField";
import { BRANCH_LOCATION_OPTIONS } from "@/utils/constants";
interface BranchSelectFieldProps {
  isEditable?: boolean;
  required?: boolean;
  name?: string;
}

const BranchSelectField = ({
  isEditable,
  required,
  name = "branchId",
}: BranchSelectFieldProps) => {
  return (
    <FormSelectField
      name={name}
      label="Branch"
      textFormat={!isEditable}
      options={BRANCH_LOCATION_OPTIONS}
      labelKey="label"
      valueKey="id"
      required={required}
    />
  );
};

export default BranchSelectField;
