import React, { Dispatch, RefObject, SetStateAction } from "react";
import {
  Box,
  Stack,
  Button,
  IconButton,
  Badge,
  Collapse,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import AttendanceTableFilter, { AttendanceFilter } from "@/pages/Attendance/components/AttendanceFilter";
import { FilterFormHandle } from "@/utils/constants";

interface AttendanceToolbarProps {
  isManualAttendance: boolean;
  showTimeInButton: boolean;
  isLoading: boolean;
  handleTimeInButton: () => void;
  setOpenTimeOut: (open: boolean) => void;
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  handleFilterFormReset: () => void;
  handleSearch: (filters: AttendanceFilter)=>void
  filterFormRef: RefObject<FilterFormHandle>;
}

const TableTopToolbar: React.FC<AttendanceToolbarProps> = ({
  isManualAttendance,
  showTimeInButton,
  isLoading,
  handleTimeInButton,
  setOpenTimeOut,
  hasActiveFilters,
  showFilters,
  setShowFilters,
  handleFilterFormReset,
  handleSearch,
  filterFormRef,
}) => {
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center" justifyContent="flex-end">
        <Stack flex={1} direction="row" gap={1}>
          {isManualAttendance && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {showTimeInButton ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTimeInButton}
                  disabled={isLoading}
                >
                  Time In
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenTimeOut(true)}
                  disabled={isLoading}
                >
                  Time Out
                </Button>
              )}
            </Box>
          )}
        </Stack>
        <Stack direction="row" gap={0.5}>
          <IconButton
            color={hasActiveFilters ? "primary" : "inherit"}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
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
          <AttendanceTableFilter onSearch={handleSearch} ref={filterFormRef} />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TableTopToolbar;