import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

export interface DayOption {
  value: number;
  label: string;
}

interface DayDropdownProps {
  selectedValue: number;
  onChange: (event: SelectChangeEvent<number>) => void;
  options: DayOption[];
  customLabel?: string;
}

const DayDropdown: React.FC<DayDropdownProps> = ({
  selectedValue,
  onChange,
  options,
  customLabel = "",
}) => {
  return (
    <FormControl sx={{ width: 200 }} variant="outlined">
      <Select
        labelId="dropdown-label"
        id="dropdown"
        value={selectedValue}
        onChange={onChange}
        renderValue={(value) =>
          !customLabel
            ? options.find((option) => option.value === value)?.label
            : customLabel
        }
        sx={{
          border: (theme) => theme.palette.primary.main,
          ".MuiSelect-icon": {
            color: (theme) => theme.palette.primary.main,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DayDropdown;
