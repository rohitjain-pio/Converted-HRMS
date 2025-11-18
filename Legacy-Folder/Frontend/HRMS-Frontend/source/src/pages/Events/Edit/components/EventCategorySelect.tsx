import { useMemo } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import {
  getEventCategoryList,
  GetEventCategoryListResponse,
} from "@/services/Events";
import methods from "@/utils";

type EventCategorySelectProps = {
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

const EventCategorySelect = (props: EventCategorySelectProps) => {
  const { name = "eventCategoryId", required, disabled } = props;

  const { data } = useAsync<GetEventCategoryListResponse>({
    requestFn: async (): Promise<GetEventCategoryListResponse> => {
      return await getEventCategoryList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: {
    id: number;
    category: string;
  }[] = useMemo(() => data?.result || [], [data]);

  return (
    <FormSelectField
      name={name}
      label="Event Category"
      options={options}
      labelKey="category"
      valueKey="id"
      required={required}
      disabled={disabled}
    />
  );
};

export default EventCategorySelect;
