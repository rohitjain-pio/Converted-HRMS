import {
  Box,
  Stack,
  Tooltip,
  IconButton,
  Badge,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { Link } from "react-router-dom";
import { FilterFormHandle, permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { ImportButton } from "@/pages/Employee/components/ImportButton";
import { EmployeeSearch } from "@/components/EmployeeSearch/EmployeeSearch";
import FilterForm from "@/pages/Employee/components/FilterForm";
import { Dispatch, SetStateAction } from "react";
import { EmployeeSearchFilter, ExportEmployeesDataArgs } from "@/services/Employees";
import { mapSortingToApiParams } from "@/utils/helpers";
import { MRT_SortingState } from "material-react-table";

  


interface Props {
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  isExporting: boolean;
  exportData:  (params?: ExportEmployeesDataArgs | undefined) => Promise<void>
  sorting:   MRT_SortingState;
  employeeFilters:  EmployeeSearchFilter;
  setGlobalLoading: (loading: boolean) => void;
  handleImportSuccess: () => void;
  hasActiveFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  showFilters: boolean;
  handleFilterFormReset: () => void;
  handleSearch: (filters: EmployeeSearchFilter)=>void;
  setHasActiveFilters: Dispatch<SetStateAction<boolean>>;
  filterFormRef: React.RefObject<FilterFormHandle>;
}

const TableTopToolbar: React.FC<Props> = ({
  selectedEmployees,
  setSelectedEmployees,
  isExporting,
  exportData,
  sorting,
  employeeFilters,
  setGlobalLoading,
  handleImportSuccess,
  hasActiveFilters,
  setShowFilters,
  showFilters,
  handleFilterFormReset,
  handleSearch,
  setHasActiveFilters,
  filterFormRef,
}) => {
  const { EMPLOYEES } = permissionValue;

  return (
    <Box flex={1}>
      <Stack direction="row" flex={1} alignItems="center">
        <Stack flex={1} direction="row">
          {hasPermission(EMPLOYEES.CREATE) && (
            <Tooltip title="Add Employee">
              <IconButton component={Link} to="/employees/employee-list/add">
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
          {hasPermission(EMPLOYEES.VIEW) && (
            <Tooltip title="Export">
              <IconButton
                disabled={isExporting}
                onClick={() => {
                    const employeeCodes = selectedEmployees
                      .map((emp) => emp.split(" - ")[0])
                      .join(",");
                    exportData({
                      ...mapSortingToApiParams(sorting),
                      startIndex: 0,
                      pageSize: 0,
                      filters: {
                        ...employeeFilters,
                        employeeCode: employeeCodes,
                      },
                    });
                  }}
              >
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          {hasPermission(EMPLOYEES.CREATE) && (
            <ImportButton
              setGlobalLoading={setGlobalLoading}
              onImportSuccess={handleImportSuccess}
            />
          )}
        </Stack>
        <Stack direction="row" gap={0.5}>
          <EmployeeSearch
            selectedEmployees={selectedEmployees}
            enableExitEmployee={true}
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
            roleId={employeeFilters.roleId}
            setHasActiveFilters={setHasActiveFilters}
            ref={filterFormRef}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TableTopToolbar
