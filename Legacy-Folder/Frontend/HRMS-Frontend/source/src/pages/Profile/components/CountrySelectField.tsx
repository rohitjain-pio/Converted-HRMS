import { useEffect, useState } from "react";
import FormSelectField from "@/components/FormSelectField";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import {
  CountryType,
  GetCountryListResponse,
  getCountryList,
} from "@/services/User";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useFormContext } from "react-hook-form";

interface CountrySelectFieldProps {
  addressType: string;
  isEditable?: boolean;
}

const CountrySelectField = ({
  addressType,
  isEditable,
}: CountrySelectFieldProps) => {
  const [countryList, setCountryList] = useState<CountryType[]>([]);
  const { watch, setValue } = useFormContext();
  const countryIdField = watch(`${addressType}.countryId`);

  useAsync<GetCountryListResponse>({
    requestFn: async (): Promise<GetCountryListResponse> => {
      return await getCountryList();
    },
    onSuccess: ({ data }) => {
      setCountryList(data.result);
      if (isEditable && countryIdField && data.result && !data.result.some((country) => country.id === countryIdField)) {
        setValue(`${addressType}.countryId`, "");
        setValue(`${addressType}.stateId`, "");
        setValue(`${addressType}.cityId`, "");
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
      setCountryList([]);
      setValue(`${addressType}.countryId`, "");
      setValue(`${addressType}.stateId`, "");
      setValue(`${addressType}.cityId`, "");
    },
    autoExecute: true,
  });

  useEffect(() => {
    if (isEditable && countryIdField && countryList && !countryList.some((country) => country.id === countryIdField)) {
      setValue(`${addressType}.countryId`, "");
      setValue(`${addressType}.stateId`, "");
      setValue(`${addressType}.cityId`, "");
    }
  }, [countryList, countryIdField]);

  return (
    <FormInputContainer>
      <FormSelectField
        name={`${addressType}.countryId`}
        label="Country"
        textFormat={!isEditable}
        options={countryList}
        labelKey="countryName"
        valueKey="id"
        required
      />
    </FormInputContainer>
  );
};

export default CountrySelectField;
