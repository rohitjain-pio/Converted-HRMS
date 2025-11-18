import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import FormSelectField from "@/components/FormSelectField";
import { EMPLOYEE_STATUS_OPTIONS } from "@/utils/constants";

interface EmployeeStatusSelectFieldProps {
  name?: string;
  isEditable?: boolean;
  required?: boolean;
}

const EmployeeStatusSelectField = ({
  name = "status",
  isEditable,
  required,
}: EmployeeStatusSelectFieldProps) => {
  const { setValue, watch } = useFormContext();

  const employeeStatusField = watch(name);

  useEffect(() => {
    if (!isEditable) {
      if (employeeStatusField) {
        const label = EMPLOYEE_STATUS_OPTIONS.find(
          ({ id }) => id == employeeStatusField
        )?.label;

        setValue("employeeStatus", label);
      } else {
        setValue("employeeStatus", "");
      }
    }
  }, [isEditable, watch]);

  return (
    <FormSelectField
      name={name}
      label="Employee Status"
      textFormat={!isEditable}
      options={EMPLOYEE_STATUS_OPTIONS}
      labelKey="label"
      valueKey="id"
      required={required}
    />
  );
};

export default EmployeeStatusSelectField;
