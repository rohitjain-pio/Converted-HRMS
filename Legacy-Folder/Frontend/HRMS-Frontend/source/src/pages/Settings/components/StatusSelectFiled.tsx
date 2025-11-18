import FormSelectField from "@/components/FormSelectField";

type StatusSelectFieldProps = {
  name?: string;
  required?: boolean;
};

const StatusSelectField = (props: StatusSelectFieldProps) => {
  const { name = "status", required } = props;

  const options: { id: boolean; label: string }[] = [
    { id: true, label: "Inactive" },
    { id: false, label: "Active" },
  ];

  return (
    <FormSelectField
      name={name}
      label="Status"
      options={options}
      labelKey="label"
      valueKey="id"
      required={required}
    />
  );
};

export default StatusSelectField;
