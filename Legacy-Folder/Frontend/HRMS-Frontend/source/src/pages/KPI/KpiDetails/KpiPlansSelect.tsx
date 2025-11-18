import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
type props = {
  planOptions: {
    value: number;
    label: string;
  }[];
  setSelectedPlanId: React.Dispatch<React.SetStateAction<number | "">>;
  selectedPlanId: number | "";
};
const KpiPlansSelect = ({ planOptions, setSelectedPlanId, selectedPlanId }: props) => {
  const handleChange = (event: SelectChangeEvent<number | "">) => {
    setSelectedPlanId(Number(event.target.value));
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="kpi-plan-select-label">Select KPI Plan</InputLabel>
      <Select
        labelId="kpi-plan-select-label"
        value={selectedPlanId}
        label="Select KPI Plan"
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
              overflowY: "auto",
            },
          },
        }}
      >
        {planOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default KpiPlansSelect;
