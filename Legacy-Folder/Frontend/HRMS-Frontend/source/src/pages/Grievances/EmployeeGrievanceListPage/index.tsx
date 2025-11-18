import { Box, Paper } from "@mui/material";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useEffect, useRef, useState } from "react";
import {
  EmployeeGrievance,
  getEmployeeGrievance,
  GetEmployeeGrievanceFilter,
  GetEmployeeGrievanceResponse,
} from "@/services/Grievances";
import { DEFAULT_EMPLOYEE_GRIEVANCE_FILTERS } from "@/pages/Grievances/constants";
import useAsync from "@/hooks/useAsync";
import { useUserStore } from "@/store";
import methods from "@/utils";
import { initialPagination } from "@/utils/constants";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import MaterialDataTable from "@/components/MaterialDataTable";
import { useTableColumns } from "@/pages/Grievances/EmployeeGrievanceListPage/useTableColumn";
import TableTopToolbar from "@/pages/Grievances/EmployeeGrievanceListPage/TableTopToolbar";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { EmployeeGrievanceFilterHandle } from "@/pages/Grievances/components/EmployeeGrievanceFilter";
import { VisibilityState } from "node_modules/@tanstack/table-core/build/lib/features/ColumnVisibility";

const EmployeeGrievanceListPage = () => {
  const { userData } = useUserStore();
  const [employeeGrievanceList, setEmployeeGrievanceList] = useState<
    EmployeeGrievance[]
  >([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_EMPLOYEE_GRIEVANCE_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const filterFormRef = useRef<EmployeeGrievanceFilterHandle>(null);

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const columns = useTableColumns({ pagination });

  const handleSearch = (filters: GetEmployeeGrievanceFilter) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setFilters(filters);
  };

  const { execute: fetchEmployeeGrievance } =
    useAsync<GetEmployeeGrievanceResponse>({
      requestFn: async (): Promise<GetEmployeeGrievanceResponse> => {
        return await getEmployeeGrievance(Number(userData.userId), {
          ...mapSortingToApiParams(sorting),
          ...mapPaginationToApiParams(pagination),
          filters: { ...filters },
        });
      },
      onSuccess: ({ data }) => {
        setEmployeeGrievanceList(data?.result?.employeeGrievanceList || []);
        setTotalRecords(data?.result?.totalRecords || 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  useEffect(() => {
    fetchEmployeeGrievance();
  }, [pagination, sorting, filters]);

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="My Grievance" />
        <Box padding="20px">
          <MaterialDataTable<EmployeeGrievance>
            columns={columns}
            data={employeeGrievanceList}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            topToolbar={() => (
              <TableTopToolbar
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                handleFilterFormReset={handleFilterFormReset}
                handleSearch={handleSearch}
                setHasActiveFilters={setHasActiveFilters}
                filterFormRef={filterFormRef}
              />
            )}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </Box>
      </Paper>
    </>
  );
};
export default EmployeeGrievanceListPage;
