import { useEffect, useState } from "react";
import FormSelectField from "@/components/FormSelectField";
import {
  GetStateListResponse,
  getStateList,
  StateType,
} from "@/services/User";
import useAsync from "@/hooks/useAsync";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import methods from "@/utils";
import { useFormContext } from "react-hook-form";

interface StateSelectFieldProps {
  addressType: string;
  isEditable?: boolean;
}

const StateSelectField = ({
  addressType,
  isEditable,
}: StateSelectFieldProps) => {
  const { setValue, watch } = useFormContext();
  const [stateList, setStateList] = useState<StateType[]>([]);
  const countryIdField = watch(`${addressType}.countryId`);
  const stateIdField = watch(`${addressType}.stateId`);
  const { execute: fetchStateList } = useAsync<GetStateListResponse, string>({
    requestFn: async (countryId: string): Promise<GetStateListResponse> => {
      return await getStateList(countryId);
    },
    onSuccess: ({ data }) => {
      setStateList(data.result);
      if (isEditable && data.result && stateIdField && !data.result.some((state) => state.id === stateIdField)) {
        setValue(`${addressType}.stateId`, "");
        setValue(`${addressType}.cityId`, "");
        setValue(`${addressType}.pincode`, "");
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
      setStateList([]);
      setValue(`${addressType}.stateId`, "");
      setValue(`${addressType}.cityId`, "");
      setValue(`${addressType}.pincode`, "");
    },
    autoExecute: false,
  });

  useEffect(() => {
    if (countryIdField) {
      fetchStateList(countryIdField);
    } else {
      setStateList([]);
      setValue(`${addressType}.stateId`, "");
      setValue(`${addressType}.cityId`, "");
      setValue(`${addressType}.pincode`, "");
    }
  }, [countryIdField]);

  useEffect(() => {
    if(isEditable && stateIdField && stateList && !stateList.some(state => state.id === stateIdField)) {
      setValue(`${addressType}.stateId`, stateIdField);
    }
  }, [stateList, stateIdField]);

  return (
    <FormInputContainer>
      <FormSelectField
        name={`${addressType}.stateId`}
        label="State"
        textFormat={!isEditable}
        options={stateList}
        labelKey="stateName"
        valueKey="id"
        disabled={!countryIdField}
        required
      />
    </FormInputContainer>
  );
};

export default StateSelectField;
