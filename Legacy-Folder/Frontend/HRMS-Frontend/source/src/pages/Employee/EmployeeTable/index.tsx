import { Box, Paper } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader/PageHeader";
import {
  EmployeeSearchFilter,
  EmployeeType,
  exportEmployeesData,
  ExportEmployeesDataArgs,
  getEmployeeList,
  GetEmployeeListResponse,
} from "@/services/Employees";
import { FilterFormHandle } from "@/pages/Employee/components/FilterForm";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useLocation } from "react-router-dom";
import BreadCrumbs from "@/components/@extended/Router";
import { toast } from "react-toastify";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { DEFAULT_EMPLOYEE_FILTERS } from "@/pages/Employee/constants";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "@/pages/Employee/EmployeeTable/useTableColumns";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolbar from "@/pages/Employee/EmployeeTable/TableTopToolbar";
import { handleRedirect, handleViewEmployee } from "@/pages/Employee/EmployeeTable/utils";
import { VisibilityState } from "@tanstack/table-core";

const EmployeeTable = () => {
  const { state } = useLocation();
  const [data, setData] = useState<EmployeeType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const initPagination: MRT_PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };
  const [pagination, setPagination] =useState<MRT_PaginationState>(initPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ country: false });
  const initialEmployeeFilters = useMemo<EmployeeSearchFilter>(
    () => ({
      ...DEFAULT_EMPLOYEE_FILTERS,
      roleId: state?.roleId ? Number(state?.roleId) : 0,
    }),
    [state]
  );
  const [employeeFilters, setEmployeeFilters] = useState<EmployeeSearchFilter>(
    initialEmployeeFilters
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const { execute: fetchEmployees } = useAsync<GetEmployeeListResponse>({
    requestFn: async (): Promise<GetEmployeeListResponse> => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      return await getEmployeeList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...employeeFilters, employeeCode: employeeCodes },
      });
    },
    onSuccess: ({ data }) => {
      setData(data.result?.employeeList || []);
      setTotalRecords(data.result?.totalRecords || 0);
      setGlobalLoading(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
      setGlobalLoading(false);
    },
  });

  const { execute: exportData, isLoading: isExporting } = useAsync<
    Blob,
    ExportEmployeesDataArgs
  >({
    requestFn: async (args: ExportEmployeesDataArgs): Promise<Blob> => {
      return await exportEmployeesData(args);
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
  const handleSearch = async (filters: EmployeeSearchFilter) => {
    setEmployeeFilters(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const handleImportSuccess = () => {
    const { sortColumnName, sortDirection } = mapSortingToApiParams(sorting);
    const hasActiveSort = sortColumnName !== "" || sortDirection !== "";
    setSorting([]);
    if (!hasActiveSort) {
      fetchEmployees();
    }
  };
  const columns = useTableColumns({
    pagination,
    handleRedirect,
    handleViewEmployee,
  });
  useEffect(() => {
    fetchEmployees();
  }, [pagination, sorting, employeeFilters, selectedEmployees.length]);

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Employees List"
          hideBorder={true}
          goBack={state?.fromRolesPage || false}
        />
        <Box padding="20px">
          <MaterialDataTable<EmployeeType>
            columns={columns}
            data={data}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            setSorting={setSorting}
            topToolbar={() => (
              <TableTopToolbar
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                sorting={sorting}
                exportData={exportData}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                setHasActiveFilters={setHasActiveFilters}
                filterFormRef={filterFormRef}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
                isExporting={isExporting}
                employeeFilters={employeeFilters}
                setGlobalLoading={setGlobalLoading}
                handleImportSuccess={handleImportSuccess}
              />
            )}
          />
        </Box>
      </Paper>
      <GlobalLoader loading={globalLoading} />
    </>
  );
};
export default EmployeeTable;
