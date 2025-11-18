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

import LeaveHistoryTableFilter from "@/pages/Leaves/components/LeaveHistoryTableFilter";
import { FilterFormHandle } from "@/pages/Leaves/components/LeaveMangerTableFilter";
import { LeaveHistoryFilter } from "@/services/EmployeeLeave";

interface LeaveHistoryToolbarProps {
  hasActiveFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch:  (filter: LeaveHistoryFilter) => void
  setHasActiveFilters: (active: boolean) => void;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolBar: React.FC<LeaveHistoryToolbarProps> = ({
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
          <LeaveHistoryTableFilter
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

