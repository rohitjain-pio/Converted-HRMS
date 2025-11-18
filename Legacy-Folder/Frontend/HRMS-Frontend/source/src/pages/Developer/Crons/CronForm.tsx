import { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import FetchTimeDoctorStatsFormForm from "@/pages/Developer/Crons/CronTypeForms/FetchTimeDoctorStatsForm";
import MonthlyLeavesCreditForm from "@/pages/Developer/Crons/CronTypeForms/MonthlyLeaveCreditForm";
import { runCron } from "@/services/Developer/DeveloperService";
import { CRON_TYPE_OPTIONS } from "@/utils/constants";

export type FilterFormHandle = {
  handleReset: () => void;
};

interface Props {
  refreshList: () => void;
}

const CronForm = ({ refreshList }: Props) => {
  const [selectedType, setSelectedType] = useState<number>(0);
  const [isCronRunning, setIsCronRunning] = useState<boolean>(false);
  const handleCronRunTrigger = (data: unknown) => {
    const payload = {
      type: selectedType,
      data,
    };
    setIsCronRunning(true);
    runCron(payload).then(() => {
      refreshList();
      setIsCronRunning(false);
    });
  };

  const handleDateRangeChange = (e: SelectChangeEvent<number>) => {
    const value: number = parseInt(e.target.value.toString());
    setSelectedType(value);
  };

  return (
    <Grid container spacing={2} size={12}>
      <Grid size={{ xs: 12, md: 4, lg: 4 }}>
        <FormControl fullWidth sx={{ minWidth: 150, width: "100%" }}>
          <InputLabel>Type</InputLabel>
          <Select
            name="typeId"
            value={selectedType}
            onChange={handleDateRangeChange}
            label="Select Type"
          >
            {CRON_TYPE_OPTIONS.map(({ id, label }) => (
              <MenuItem key={id} value={id}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={12}>
        {selectedType === 1 ? (
          <FetchTimeDoctorStatsFormForm
            loading={isCronRunning}
            onTrigger={handleCronRunTrigger}
          />
        ) : selectedType === 2 ? (
          <MonthlyLeavesCreditForm
            loading={isCronRunning}
            onTrigger={handleCronRunTrigger}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default CronForm;
