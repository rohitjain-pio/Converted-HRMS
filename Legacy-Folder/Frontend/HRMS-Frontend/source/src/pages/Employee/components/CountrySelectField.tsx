import { useState } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import {
  CountryType,
  getCountryList,
  GetCountryListResponse,
} from "@/services/User";
import methods from "@/utils";

type CountrySelectFieldProps = {
  name: string;
};

const CountrySelectField = (props: CountrySelectFieldProps) => {
  const { name } = props;
  const [countryList, setCountryList] = useState<CountryType[]>([]);

  useAsync<GetCountryListResponse>({
    requestFn: async (): Promise<GetCountryListResponse> => {
      return await getCountryList();
    },
    onSuccess: ({ data }) => {
      setCountryList(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
      setCountryList([]);
    },
    autoExecute: true,
  });

  return (
    <FormSelectField
      name={name}
      label="Country"
      options={countryList}
      labelKey="countryName"
      valueKey="id"
    />
  );
};

export default CountrySelectField;
