import {  useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
 
} from "@mui/material";
import methods from "@/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import {
  getAllAttendanceConfig,
  updateAttendanceConfig,
} from "@/services/Attendence/AttendenceService";
import useAsync from "@/hooks/useAsync/useAsync";
import {
  AttendanceConfig,
  AttendanceConfigResponse,
} from "@/pages/Attendance/types";
import {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import {
  FilterFormHandle,
} from "@/pages/Attendance/AttendanceConfiguration/FilterForm";
import { AttendanceConfigFilter } from "@/services/Attendence/typs";
import { DEFAULT_ATTENDANCE_CONFIG_FILTERS } from "@/pages/Attendance/AttendanceConfiguration/constants";
import { VisibilityState } from "@tanstack/table-core";

import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import MaterialDataTable from "@/components/MaterialDataTable";
import { useTableColumns } from "./useTableColumns";
import TableTopToolBar from "@/pages/Attendance/AttendanceConfiguration/TableTopToolbar";

const AttendanceConfigurationPage = () => {
  const [employees, setEmployees] = useState<AttendanceConfigResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const initPagination: MRT_PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);

  const [filters, setFilters] = useState<AttendanceConfigFilter>(
    DEFAULT_ATTENDANCE_CONFIG_FILTERS
  );

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };

  const { execute: fetchConfig } = useAsync<{
    result: AttendanceConfig;
  }>({
    requestFn: async () => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      return await getAllAttendanceConfig({
        ...mapPaginationToApiParams(pagination),
        ...mapSortingToApiParams(sorting),
        filters: { ...filters, employeeCode: employeeCodes },
      });
    },
    onSuccess: (res) => {
      if (res.data) {
        setEmployees(
          res.data.result.attendanceConfigList.map((item) => ({ ...item }))
        );
        setTotalRecords(res.data.result.totalRecords || 0);
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
      setEmployees([]);
    },
  });

  const { execute: updateConfig } = useAsync({
    requestFn: (employeeId: number) => updateAttendanceConfig(employeeId),
    onSuccess: (_res, employeeId) => {
      setEmployees((prev) =>
        prev.map((row) =>
          row.employeeId === employeeId
            ? { ...row, isManualAttendance: !row.isManualAttendance }
            : row
        )
      );
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const handleManualToggle = (employeeId: number) => {
    updateConfig(employeeId);
  };

  useEffect(() => {
    fetchConfig();
  }, [pagination, sorting, filters, selectedEmployees.length]);

  const handleSearch = async (filters: AttendanceConfigFilter) => {
    setFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const columns = useTableColumns({ pagination, handleManualToggle });
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          hideBorder={true}
          title="Attendance Configuration"
        />
        <Box padding="20px">
          <MaterialDataTable<AttendanceConfigResponse>
            columns={columns}
            data={employees}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            topToolbar={() => (
              <TableTopToolBar
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
                hasActiveFilters={hasActiveFilters}
                setShowFilters={setShowFilters}
                showFilters={showFilters}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                setHasActiveFilter={setHasActiveFilters}
                filterFormRef={filterFormRef}
              />
            )}
          />
        </Box>
      </Paper>
    </>
  );
};

export default AttendanceConfigurationPage;
