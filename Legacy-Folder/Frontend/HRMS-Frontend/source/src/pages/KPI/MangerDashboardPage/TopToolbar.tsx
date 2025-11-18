import React from "react";
import {
  Box,
  Stack,
  IconButton,
  Badge,
  Collapse,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

import { FilterFormHandle } from "@/pages/Leaves/components/LeaveMangerTableFilter";
import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import ManagerDashboardFilterForm from "../Components/ManagerDashboardFilterForm";
import { employeesGoalListFilter } from "@/services/KPI";

interface ManagerDashboardToolbarProps {
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  hasActiveFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch: (filters: employeesGoalListFilter) => void
  setHasActiveFilters: React.Dispatch<React.SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolBar: React.FC<ManagerDashboardToolbarProps> = ({
  selectedEmployees,
  setSelectedEmployees,
  hasActiveFilters,
  setShowFilters,
  showFilters,
  handleFilterFormReset,
  handleSearch,
  setHasActiveFilters,
  filterFormRef,
}) => {
  return (
    <Box flex={1}>
      <Stack
        direction="row"
        flex={1}
        alignItems="center"
        justifyContent="flex-end"
      >
        <Stack direction="row" gap={0.5}>
          <EmployeeSearch
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
          />
        </Stack>
        <Stack direction="row" gap={0.5}>
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
          <ManagerDashboardFilterForm
            onSearch={handleSearch}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TableTopToolBar;