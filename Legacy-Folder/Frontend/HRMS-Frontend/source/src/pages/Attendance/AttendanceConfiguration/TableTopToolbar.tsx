import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import FilterForm from "@/pages/Attendance/AttendanceConfiguration/FilterForm";
import React, { Dispatch, SetStateAction } from "react";
import { FilterFormHandle } from "@/utils/constants";
import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import { AttendanceConfigFilter } from "@/services/Attendence/typs";

interface EmployeeFilterToolbarProps {
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  handleFilterFormReset: () => void;
  setHasActiveFilter: Dispatch<SetStateAction<boolean>>;
  handleSearch: (filters: AttendanceConfigFilter) => Promise<void>
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolbar: React.FC<EmployeeFilterToolbarProps> = ({
  selectedEmployees,
  setSelectedEmployees,
  hasActiveFilters,
  showFilters,
  setHasActiveFilter,
  setShowFilters,
  handleFilterFormReset,
  handleSearch,
  filterFormRef,
}) => {
  return (
    <Box flex={1}>
      <Stack
        direction="row"
        flex={1}
        alignItems="center"
        justifySelf="flex-end"
      >
        <Stack direction="row" gap={0.5}>
          <EmployeeSearch
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
          />
          <Tooltip title="Filters">
            <IconButton
              color={hasActiveFilters ? "primary" : "inherit"}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Badge
                color="primary"
                variant="dot"
                invisible={!hasActiveFilters}
              >
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          {hasActiveFilters && (
            <Tooltip title="Remove Filters">
              <IconButton color="error" onClick={handleFilterFormReset}>
                <FilterListOffIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      <Collapse in={showFilters} sx={{ mr: "-2.75rem" }}>
        <Box sx={{ p: 2 }}>
          <FilterForm
            onSearch={handleSearch}
            setHasActiveFilters={setHasActiveFilter}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
export default TableTopToolbar;
