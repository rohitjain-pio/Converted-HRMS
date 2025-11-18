import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { VisibilityState } from "@tanstack/table-core";
import { useEffect, useRef, useState } from "react";
import { Box, Paper } from "@mui/material";
import { toast } from "react-toastify";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import useAsync from "@/hooks/useAsync";
import {
  EmployeeGrievanceResponse,
  GetAdminReportGrievanceResponse,
  GetAdminReportArgs,
  getAdminReport,
  ExportGrievanceReport,
  AdminReportGrievanceFilter,
} from "@/services/Grievances";
import methods from "@/utils";
import { DEFAULT_ADMIN_REPORT_GRIEVANCE_FILTERS } from "@/pages/Grievances/constants";
import { useTableColumns } from "@/pages/Grievances/GrievanceAdminReport/useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolBar from "@/pages/Grievances/GrievanceAdminReport/TableTopToolbar";
import { FilterFormHandle, initialPagination } from "@/utils/constants";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";

const GrievanceAdminReport = () => {
  const [filters, setFilters] = useState(
    DEFAULT_ADMIN_REPORT_GRIEVANCE_FILTERS
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [adminReportData, setAdminReportData] = useState<
    EmployeeGrievanceResponse[]
  >([]);
  const filterFormRef = useRef<FilterFormHandle>(null);

  const { execute: fetchAdminReport } = useAsync<
    GetAdminReportGrievanceResponse,
    GetAdminReportArgs
  >({
    requestFn: async (): Promise<GetAdminReportGrievanceResponse> => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      return await getAdminReport({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters, createdBy: employeeCodes },
      });
    },
    onSuccess: ({ data }) => {
      setAdminReportData(data.result?.employeeListGrievance || []);
      setTotalRecords(data.result?.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: exportReport } = useAsync<Blob, GetAdminReportArgs>({
    requestFn: async (): Promise<Blob> => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      return await ExportGrievanceReport({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters, createdBy: employeeCodes },
      });
    },
    onSuccess: (response) => {
      const fileName = "GrievanceMasterFile.xlsx";
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
  useEffect(() => {
    fetchAdminReport();
  }, [pagination, sorting, filters, selectedEmployees.length]);
  const columns = useTableColumns({ pagination });

  const handleSearch = async (filters: AdminReportGrievanceFilter) => {
    setFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="All Grievance" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<EmployeeGrievanceResponse>
            columns={columns}
            data={adminReportData}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            topToolbar={() => (
              <TableTopToolBar
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
                exportReport={exportReport}
                hasActiveFilters={hasActiveFilters}
                setShowFilters={setShowFilters}
                showFilters={showFilters}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                setHasActiveFilters={setHasActiveFilters}
                filterFormRef={filterFormRef}
              />
            )}
          />
        </Box>
      </Paper>
    </>
  );
};

export default GrievanceAdminReport;
