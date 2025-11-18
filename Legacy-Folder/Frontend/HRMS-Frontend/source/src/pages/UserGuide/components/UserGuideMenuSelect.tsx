import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import { getMenus } from "@/services/UserGuide";
import { GetMenusResponse } from "@/services/UserGuide/types";
import methods from "@/utils";

type Props = {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
};

const UserGuideMenuFormSelect = (props: Props) => {
  const { name, label, required, disabled } = props;

  const { data } = useAsync<GetMenusResponse>({
    requestFn: async (): Promise<GetMenusResponse> => {
      return await getMenus();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: { id: number; name: string }[] = data?.result || [];

  return (
    <FormSelectField
      name={name}
      label={label}
      labelKey="name"
      valueKey="id"
      options={options}
      required={required}
      disabled={disabled}
    />
  );
};

export default UserGuideMenuFormSelect;
