import React from "react";
import {
  Box,
  Stack,
  IconButton,
  Badge,
  Collapse,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";


import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import LeaveCompOffTableFilter from "../LeaveCompOffTableFilte";
import { FilterFormHandle } from "@/utils/constants";
import { Leave_CompOffArgs } from "@/services/LeaveManagment";

interface LeaveCompOffToolbarProps {
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  hasActiveFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch: (filters: Leave_CompOffArgs) => void
  setHasActiveFilters: React.Dispatch<React.SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolBar: React.FC<LeaveCompOffToolbarProps> = ({
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
        justifySelf="flex-end"
      >
        <Stack direction="row" gap={0.5}>
          <EmployeeSearch
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
          />
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
          {hasActiveFilters && (
            <IconButton color="error" onClick={handleFilterFormReset}>
              <FilterListOffIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>
      <Collapse in={showFilters} sx={{ mr: "-2.75rem" }}>
        <Box sx={{ p: 2 }}>
          <LeaveCompOffTableFilter
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
