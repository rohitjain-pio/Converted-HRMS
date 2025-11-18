import BreadCrumbs from "@/components/@extended/Router";
import MaterialDataTable from "@/components/MaterialDataTable";
import PageHeader from "@/components/PageHeader/PageHeader";
import useAsync from "@/hooks/useAsync/useAsync";
import { DEFAULT_EMPLOYEE_ATTENDANCE_REPORT_FILTER } from "@/pages/Attendance/components/constanst";
import { EmployeeReportFilterFormHandle } from "@/pages/Attendance/EmployeeReport/EmployyeReportFilterForm";
import {
  EmployeeReportApiResponse,
  EmployeeReportSearchFilter,
  EmployeeReportTableRow,
} from "@/pages/Attendance/types";
import {
  ExportEmployeeReport,
  getAllEmployeeReport,
} from "@/services/Attendence/AttendenceService";
import { EmployeeReportFilter } from "@/services/Attendence/typs";
import methods from "@/utils";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { Box, Paper } from "@mui/material";
import { VisibilityState } from "@tanstack/table-core";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TableTopToolbar } from "@/pages/Attendance/EmployeeReport//TableTopToolbar";
import { useTableColumns } from "@/pages/Attendance/EmployeeReport/useTableColumn";
import { generateDateRange } from "@/pages/Attendance/EmployeeReport/utils";
const enableExport = true;

const EmployeeReportTable = () => {
  const [rows, setRows] = useState<EmployeeReportTableRow[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [filters, setFilters] = useState(
    DEFAULT_EMPLOYEE_ATTENDANCE_REPORT_FILTER
  );
  const [columnActive, setColumnActive] = useState<VisibilityState>({
    employeeCode: true,
    employeeName: true,
    sNo: true,
    totalHour: true,
    department: false,
    branchId: false,
  });
  const initPagination: MRT_PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<EmployeeReportFilterFormHandle>(null);
  const startDate =
    filters?.dateFrom?.format("YYYY-MM-DD") ||
    moment().subtract(7, "days").format("YYYY-MM-DD");
  const endDate =
    filters?.dateTo?.format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");

  const dateRange = useMemo(
    () => generateDateRange(startDate, endDate),
    [startDate, endDate]
  );

  const { execute: exportEmployeeReport } = useAsync<
    Blob,
    EmployeeReportFilter
  >({
    requestFn: async (args: EmployeeReportFilter): Promise<Blob> => {
      return await ExportEmployeeReport(args);
    },
    onSuccess: (response) => {
      const fileName = "EmployeeMasterFile.xlsx";
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      try {
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      } finally {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
      toast.success("Success");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: fetchEmployeeReport } = useAsync({
    requestFn: async () => {
      const employeeCode =
        selectedEmployees.length > 0
          ? selectedEmployees
              .map((selected) => selected.split(" - ")[0])
              .join(",")
          : null;
      const payload = {
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: {
          ...filters,
          employeeCode: employeeCode,

          dateFrom: startDate,
          dateTo: endDate,
        },
      };
      return await getAllEmployeeReport(payload);
    },
    onSuccess: (response: EmployeeReportApiResponse) => {
      const data = response.data.result;
      setTotalRecords(data?.totalRecords || 0);
      const currentDatesInHeader = new Set(dateRange);
      const mappedRows = (data?.employeeReports || []).map((emp) => {
        const timeEntriesForEmployee: { [key: string]: number } = {};
        currentDatesInHeader.forEach((date) => {
          timeEntriesForEmployee[date] = 0;
        });
        Object.entries(emp.workedHoursByDate || {}).forEach(([date, hhmm]) => {
          if (hhmm && hhmm.trim() !== "") {
            const [h, m] = hhmm.split(":").map(Number);
            timeEntriesForEmployee[date] = h + (m ? m / 60 : 0);
          }
        });
        return {
          employeeCode: emp.employeeCode,
          employeeName: emp.employeeName,
          totalHour: emp.totalHour,
          branch: emp.branch,
          department: emp.department,
          timeEntries: timeEntriesForEmployee,
        };
      });
      setRows(mappedRows);
    },
    onError: () => {
      setRows([]);
      setTotalRecords(0);
    },
  });

  useEffect(() => {
    fetchEmployeeReport();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    filters,
    selectedEmployees.length,
  ]);

  const { baseEmployeeColumns, dailyColumns } = useTableColumns({
    dateRange,
    pagination,
  });
  const columns = useMemo(
    () => [...baseEmployeeColumns, ...dailyColumns],
    [dailyColumns, baseEmployeeColumns]
  );
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  useEffect(() => {
    if (columns.length > 0) {
      const newColumnOrder = [
        ...baseEmployeeColumns.map((c) => c.id),
        ...dailyColumns.map((c) => c.id),
      ].filter(Boolean) as string[];
      setColumnOrder(newColumnOrder);
    }
  }, [columns, baseEmployeeColumns, dailyColumns]);

  const handleSearch = async (filters: EmployeeReportSearchFilter) => {
    setFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="Employee Report" hideBorder={true} />
        <Box sx={{ m: 2 }}>
          <MaterialDataTable<EmployeeReportTableRow>
            columns={columns}
            data={rows}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            columnVisibility={columnActive}
            setColumnVisibility={setColumnActive}
            columnOrder={columnOrder}
            setColumnOrder={setColumnOrder}
            initialState={{
              columnPinning: {
                left: [
                  "mrt-row-numbers",
                  "employeeCode",
                  "employeeName",
                  "totalHour",
                  "department",
                  "branchId",
                ],
              },
            }}
            topToolbar={() => (
              <TableTopToolbar
                enableExport={enableExport}
                exportEmployeeReport={exportEmployeeReport}
                sorting={sorting}
                filters={filters}
                startDate={startDate}
                endDate={endDate}
                selectedEmployees={selectedEmployees}
                setHasActiveFilters={setHasActiveFilters}
                setSelectedEmployees={setSelectedEmployees}
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                filterFormRef={filterFormRef}
              />
            )}
          />
        </Box>
      </Paper>
    </>
  );
};
export default EmployeeReportTable;
