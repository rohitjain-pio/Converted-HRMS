import React, { Dispatch, SetStateAction } from 'react'


import {
  Box,
  Stack,
  Tooltip,
  IconButton,
  Badge,
  Collapse,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { EmployeeSearch } from '@/components/EmployeeSearch/EmployeeSearch';
import FilterForm, { FilterFormHandle } from '@/pages/ExitEmployee/components/FilterForm';
import { ExitEmployeeSearchFilter } from '@/services/EmployeeExitAdmin';

interface Props {
  selectedEmployees: string[];
  setSelectedEmployees: (item: string[]) => void;
  hasActiveFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch:(filters: ExitEmployeeSearchFilter) => void
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolBar: React.FC<Props> = ({
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
      <Stack direction="row" flex={1} alignItems="center" justifySelf="flex-end">
        <Stack direction="row" gap={0.5}>
          <EmployeeSearch
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            enableExitEmployee={true}
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
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
export default TableTopToolBar

