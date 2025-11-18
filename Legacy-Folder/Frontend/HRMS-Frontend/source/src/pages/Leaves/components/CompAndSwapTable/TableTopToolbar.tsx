import React from "react";
import {
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import LeaveTypeSelect from "../LeaveTypeSelect";


interface LeaveTypeYearToolbarProps {
  selectedYear: number;
  years: number[];
  handleSelectedYearChange: (event: SelectChangeEvent) => void;
  setSelectedType:  (selectedType: "compOff" | "leaveSwap" | null) => void
}

const TableTopToolBar: React.FC<LeaveTypeYearToolbarProps> = ({
  selectedYear,
  years,
  handleSelectedYearChange,
  setSelectedType,
}) => {
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row" gap={4}>
          <LeaveTypeSelect setSelectedOption={setSelectedType} />
        </Stack>
        <Stack direction="row" gap={0.5}>
          <FormControl size="small">
            <InputLabel>Year</InputLabel>
            <Select
              label="Year"
              value={String(selectedYear)}
              onChange={handleSelectedYearChange}
              sx={{ minWidth: 120 }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={String(year)}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TableTopToolBar;