import { Box, Paper } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { MRT_SortingState, MRT_PaginationState } from "material-react-table";
import { VisibilityState } from "@tanstack/table-core";
import { useNavigate } from "react-router-dom";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import {
  employeesGoalList,
  employeesGoalListFilter,
  GetEmployeesGoalArgs,
  getEmployeesGoalResponse,
} from "@/services/KPI/types";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { DEFAULT_EMPLOYEE_GOAL_FILTERS } from "@/pages/KPI/constant";
import { ManagerFilterFormHandle } from "@/pages/KPI/Components/ManagerDashboardFilterForm";
import { getEmployeesGoalList } from "@/services/KPI";
import AssignGoalDialog from "@/pages/KPI/Components/AssignGoalDialog";
import { initialPagination, KPI_STATUS } from "@/utils/constants";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolBar from "./TopToolbar";

const ManagerTable = () => {
  const [data, setData] = useState<employeesGoalList[]>([]);
  const [filters, setFilters] = useState(DEFAULT_EMPLOYEE_GOAL_FILTERS);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [assignedSelectedCell, setAssignedSelectedCell] = useState<{
    goalId?: number;
    target?: string;
    isDisabled?: boolean;
    employeeId?: number;
    quarter?: string;
    plainId?: number | null;
    employeeName?: string;
    employeeEmail?: string;
  } | null>(null);
  const [openAssignGoalDialog, setOpenAssignGoalDialog] = useState(false);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<ManagerFilterFormHandle>(null);
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const getKpiStatus = (row: employeesGoalList) => {
    if (!row.planId) {
      return KPI_STATUS.NotCreated;
    }
    if (row.isReviewed === null || row.isReviewed === undefined) {
      return KPI_STATUS.Assigned;
    }
    if (row.isReviewed === false) {
      return KPI_STATUS.Submitted;
    }
    if (row.isReviewed === true) {
      return KPI_STATUS.Reviewed;
    }
    return KPI_STATUS.NotCreated;
  };

  const { execute: fetchGoalList } = useAsync<
    getEmployeesGoalResponse,
    GetEmployeesGoalArgs
  >({
    requestFn: async (): Promise<getEmployeesGoalResponse> => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      return await getEmployeesGoalList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters, employeeCode: employeeCodes },
      });
    },
    onSuccess: ({ data }) => {
      setData(data.result.goalList);
      setTotalRecords(data.result.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const handleActionClick = (row: employeesGoalList,flag?:boolean) => {
    if (row.planId&&!flag) {
      navigate(`/KPI/KPI-Details/${row.employeeId}`);
    } else {
      setOpenAssignGoalDialog(true);
      setAssignedSelectedCell({
        employeeId: row.employeeId,
        isDisabled: false,

        quarter: "",
        employeeName: row.employeeName,
        employeeEmail: row.email,
      });
    }
  };
  useEffect(() => {
    fetchGoalList();
  }, [pagination, sorting, filters, selectedEmployees.length]);
  const columns = useTableColumns({
    pagination,
    getKpiStatus,
    handleActionClick,
  });

  const handleSearch = (filters: employeesGoalListFilter) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setFilters(filters);
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="KPI Management" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<employeesGoalList>
            columns={columns}
            data={data}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            setColumnVisibility={setColumnVisibility}
            topToolbar={() => (
              <TableTopToolBar
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={setSelectedEmployees}
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
        <AssignGoalDialog
          open={openAssignGoalDialog}
          data={assignedSelectedCell}
          onClose={() => setOpenAssignGoalDialog(false)}
          fetchData={() => fetchGoalList()}
        />
      </Paper>
    </>
  );
};

export default ManagerTable;
