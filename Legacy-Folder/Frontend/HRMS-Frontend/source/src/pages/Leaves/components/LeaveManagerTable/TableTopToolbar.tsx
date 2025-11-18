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



import { FilterFormHandle, role } from "@/utils/constants";
import { ImportButton } from "../ImportButton";
import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import LeaveMangerTableFilter, { LeaveManagerFilter } from "../LeaveMangerTableFilter";

interface LeaveManagerToolbarProps {
  userData: { roleName: string };
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  setLoading: (loading: boolean) => void;
  handleImportSuccess: () => void;
  hasActiveFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch:  (filter: LeaveManagerFilter) => void;
  setHasActiveFilters:React.Dispatch<React.SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolbar: React.FC<LeaveManagerToolbarProps> = ({
  userData,
  selectedEmployees,
  setSelectedEmployees,
  setLoading,
  handleImportSuccess,
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
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row" gap={1}>
          {userData.roleName === role.SUPER_ADMIN && (
            <ImportButton
              setGlobalLoading={setLoading}
              onImportSuccess={handleImportSuccess}
            />
          )}
        </Stack>
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
          <LeaveMangerTableFilter
            onSearch={handleSearch}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
export default TableTopToolbar

