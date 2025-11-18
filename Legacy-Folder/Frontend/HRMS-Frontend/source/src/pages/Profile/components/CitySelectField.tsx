import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import FormSelectField from "@/components/FormSelectField";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import {
  CityType,
  GetCityListResponse,
  getCityList,
} from "@/services/User";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";

interface CitySelectFieldProps {
  addressType: string;
  isEditable?: boolean;
}

const CitySelectField = ({ addressType, isEditable }: CitySelectFieldProps) => {
  const { watch, setValue } = useFormContext();
  const [cityList, setCityList] = useState<CityType[]>([]);
  const stateIdField = watch(`${addressType}.stateId`);
  const cityIdField = watch(`${addressType}.cityId`);
  const { execute: fetchCityList } = useAsync<GetCityListResponse, string>({
    requestFn: async (stateId: string): Promise<GetCityListResponse> => {
      return await getCityList(stateId);
    },
    onSuccess: ({ data }) => {
      setCityList(data.result);
      if (isEditable && cityIdField && data.result && !data.result.some((city) => city.id === cityIdField)) {
        setValue(`${addressType}.cityId`, "");
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
      setCityList([]);
      setValue(`${addressType}.cityId`, "");
    },
    autoExecute: false,
  });

  useEffect(() => {
    if (stateIdField) {
      fetchCityList(stateIdField);
    } else {
      setCityList([]);
      setValue(`${addressType}.cityId`, "");
    }
  }, [stateIdField]);

  useEffect(() => {
    if(isEditable && cityIdField && cityList && !cityList.some(city => city.id === cityIdField)) {
      setValue(`${addressType}.cityId`, cityIdField);
    }
  }, [cityList, cityIdField]);

  return (
    <FormInputContainer>
      <FormSelectField
        name={`${addressType}.cityId`}
        label="City"
        textFormat={!isEditable}
        options={cityList}
        labelKey="cityName"
        valueKey="id"
        disabled={!stateIdField}
        required
      />
    </FormInputContainer>
  );
};

export default CitySelectField;
