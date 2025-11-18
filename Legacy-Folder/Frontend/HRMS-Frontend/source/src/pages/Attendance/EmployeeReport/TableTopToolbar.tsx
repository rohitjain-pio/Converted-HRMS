
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

import React from 'react'
import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import { EmployeeReportFilterForm } from "@/pages/Attendance/EmployeeReport//EmployyeReportFilterForm";
import { mapSortingToApiParams } from "@/utils/helpers";
import { EmployeeReportSearchFilter } from "@/pages/Attendance/types";
import { FilterFormHandle } from "@/utils/constants";
import { EmployeeReportFilter } from "@/services/Attendence/typs";
import { MRT_SortingState } from "material-react-table";

interface EmployeeReportToolbarProps {
  enableExport: boolean;
  exportEmployeeReport:(params?: EmployeeReportFilter | undefined) => Promise<void>
  sorting:  MRT_SortingState;
  filters:  EmployeeReportSearchFilter;
  startDate: string;
  endDate: string;
  selectedEmployees: string[];
  setHasActiveFilters:React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedEmployees: (value: React.SetStateAction<string[]>) => void
  hasActiveFilters: boolean;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  handleFilterFormReset: () => void;
   handleSearch: (filters: EmployeeReportSearchFilter) => Promise<void>
  filterFormRef: React.RefObject<FilterFormHandle>;
}

export const TableTopToolbar :
 React.FC<EmployeeReportToolbarProps> = ({
  enableExport,
  exportEmployeeReport,
  sorting,
  filters,
  startDate,
  endDate,
  selectedEmployees,
  setHasActiveFilters,
  setSelectedEmployees,
  hasActiveFilters,
  showFilters,
  setShowFilters,
  handleFilterFormReset,
  handleSearch,
  filterFormRef,
}) => {
  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          {enableExport && (
            <Tooltip title="Export">
              <IconButton
                onClick={() => {
                  exportEmployeeReport({
                    ...mapSortingToApiParams(sorting),
                    startIndex: 0,
                    pageSize: 0,
                    filters: {
                      ...filters,
                      dateFrom: startDate,
                      dateTo: endDate,
                      employeeCodes: selectedEmployees.map(
                        (selected) => selected.split(" - ")[0]
                      ),
                    },
                  });
                }}
              >
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
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
          <EmployeeReportFilterForm
            setHasActiveFilters={setHasActiveFilters}
            setSelectedEmployees={setSelectedEmployees}
            onSearch={handleSearch}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

