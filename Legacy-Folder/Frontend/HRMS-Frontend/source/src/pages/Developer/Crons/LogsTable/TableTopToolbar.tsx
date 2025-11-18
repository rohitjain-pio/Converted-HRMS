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
import RefreshIcon from "@mui/icons-material/Refresh";

import { FilterFormHandle } from "@/pages/Leaves/components/LeaveMangerTableFilter";
import FilterForm from "../FilterForm";
import { CronLogsFilter } from "@/services/Developer/types";

interface LogToolbarProps {
  hasActiveFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch: (filters: CronLogsFilter) => void
  setHasActiveFilters:React.Dispatch<React.SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
  fetchLogs: () => void;
}

const TableTopToolbar: React.FC<LogToolbarProps> = ({
  hasActiveFilters,
  setShowFilters,
  showFilters,
  handleFilterFormReset,
  handleSearch,
  setHasActiveFilters,
  filterFormRef,
  fetchLogs,
}) => {
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center" justifySelf="flex-end">
        <Stack direction="row" gap={0.5}>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={fetchLogs}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
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

export default TableTopToolbar;