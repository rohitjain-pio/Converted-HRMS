import FormSelectField from "@/components/FormSelectField";
import { USER_GUIDE_STATUS_OPTIONS } from "@/utils/constants";

type Props = {
  name: string;
  label: string;
  required?: boolean;
};

const UserGuideStatusSelect = (props: Props) => {
  const { name, label, required } = props;

  return (
    <FormSelectField
      name={name}
      label={label}
      options={USER_GUIDE_STATUS_OPTIONS}
      labelKey="label"
      valueKey="value"
      required={required}
    />
  );
};

export default UserGuideStatusSelect;
