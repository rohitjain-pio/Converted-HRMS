import { useState } from "react";
import FormSelectField from "@/components/FormSelectField";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { EmployeeLeaveType, GetEmployeeLeaveTypesResponse, getEmployeeLeaveTypes } from "@/services/LeaveManagment";



const LeaveTypeSelectField = () => {
  const [leaveTypes, setLeaveTypes] = useState<EmployeeLeaveType[]>([]);
 

  useAsync<GetEmployeeLeaveTypesResponse>({
    requestFn: async () => {
      return await getEmployeeLeaveTypes();
    },
    onSuccess: ({data}) => {
      const result = data.result ;
      setLeaveTypes(result || []);
    
    },
    onError: (err) => {
      methods.throwApiError(err);
      setLeaveTypes([]);
    },
    autoExecute: true,
  });

const uniqueLeaveTypes = leaveTypes.filter(
  (item, index, self) =>
    index === self.findIndex(t => t.id === item.id)
);

  return (
    <FormSelectField
      label="Leave Type"
      name="leaveTypeId"
      options={uniqueLeaveTypes}
      valueKey="id"
      labelKey="title"
    />
  );
};

export default LeaveTypeSelectField;
