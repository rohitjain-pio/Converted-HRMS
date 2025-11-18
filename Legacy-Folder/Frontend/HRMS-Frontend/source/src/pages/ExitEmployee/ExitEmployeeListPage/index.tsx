import { Box, Paper } from "@mui/material";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useEffect, useRef, useState } from "react";
import {
  ExitEmployeeList,
  ExitEmployeeListItem,
  ExitEmployeeSearchFilter,
  getExitEmployeeList,
  GetExitEmployeeListResponse,
} from "@/services/EmployeeExitAdmin";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
    FilterFormHandle,
  initialPagination,
} from "@/utils/constants";
import { DEFAULT_EXIT_EMPLOYEE_FILTERS } from "@/pages/ExitEmployee/constants";
import {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import {
  mapSortingToApiParams,
  mapPaginationToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "@/pages/ExitEmployee/ExitEmployeeListPage/useTableColumns";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolbar from "@/pages/ExitEmployee/ExitEmployeeListPage/TableTopToolbar";
import { VisibilityState } from "@tanstack/table-core";

 const ExitEmployeeListPage = () => {
  const [exitEmployeeList, setExitEmployeeList] = useState<ExitEmployeeList>(
    []
  );
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [filters, setFilters] = useState(DEFAULT_EXIT_EMPLOYEE_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [columnVisibility,setColumnVisibility]=useState<VisibilityState>(({exitInterviewStatus:false,ktStatus:false}))
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const columns = useTableColumns({ pagination });
  const { execute: fetchExitEmployeeList } =
    useAsync<GetExitEmployeeListResponse>({
      requestFn: async (): Promise<GetExitEmployeeListResponse> => {
        const employeeCodes = selectedEmployees
          .map((emp) => emp.split(" - ")[0])
          .join(",");
        return await getExitEmployeeList({
          ...mapSortingToApiParams(sorting),
          ...mapPaginationToApiParams(pagination),
          filters: { ...filters, employeeCode: employeeCodes },
        });
      },
      onSuccess: ({ data }) => {
        setExitEmployeeList(data.result?.exitEmployeeList || []);
        setTotalRecords(data.result?.totalRecords || 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  useEffect(() => {
    fetchExitEmployeeList();
  }, [pagination, sorting, filters, selectedEmployees.length]);
  const handleSearch = (filters: ExitEmployeeSearchFilter) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setFilters(filters);
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="Employee Exit" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<ExitEmployeeListItem>
            columns={columns}
            data={exitEmployeeList}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            topToolbar={() => (
              <TableTopToolbar
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
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
export default ExitEmployeeListPage