import { Box, Paper } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { MRT_SortingState, MRT_PaginationState } from "material-react-table";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { DEFAULT_KPI_GOAL_FILTERS } from "@/pages/KPI/constant";
import {
  DeleteGoalResponse,
  GetGoalListArgs,
  GetGoalListResponse,
  goalList,
  KPIGoalRequestFilter,
} from "@/services/KPI/types";
import { FilterFormHandle } from "@/pages/KPI/Components/KpiGoalFilterForm";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { deleteGoal, getGoalList } from "@/services/KPI/kpiService";
import { initialPagination } from "@/utils/constants";
import { mapPaginationToApiParams, mapSortingToApiParams } from "@/utils/helpers";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolbar from "./TableTopToolbar";
import { useTableColumns } from "./useTableColumn";
import { VisibilityState } from "@tanstack/table-core";

const GoalTable = () => {
  const [data, setData] = useState<goalList[]>([]);
  const [filters, setFilters] = useState(DEFAULT_KPI_GOAL_FILTERS);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<number | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const[columnVisibility,setColumnVisibility]=useState<VisibilityState>({})
  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const handleConfirmDelete = (goalId: number) => {
    if (!goalId) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    removeGoal(goalId);
  };
  const openConfirmationDialog = (goalId: number) => {
    setIsConfirmationDialogOpen(true);
    setGoalToDeleteId(goalId);
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setGoalToDeleteId(null);
  };

  const { execute: fetchGoalList } = useAsync<
    GetGoalListResponse,
    GetGoalListArgs
  >({
    requestFn: async (): Promise<GetGoalListResponse> => {
      return await getGoalList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters },
      });
    },
    onSuccess: ({ data }) => {
      setData(data.result.goalList);
      setTotalRecords(data.result.totalRecords);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: removeGoal } = useAsync<DeleteGoalResponse, number>({
    requestFn: async (id: number): Promise<DeleteGoalResponse> => {
      return await deleteGoal(id);
    },
    onSuccess: () => {
      toast.success("Goal Deleted Successfully");
      fetchGoalList();
      setIsConfirmationDialogOpen(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  useEffect(() => {
    fetchGoalList();
  }, [pagination, sorting, filters]);

  const handleSearch = (filters: KPIGoalRequestFilter) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setFilters(filters);
  };
  const columns = useTableColumns({ openConfirmationDialog, pagination });
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="Goals" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<goalList>
            columns={columns}
            data={data}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            topToolbar={() => (
              <TableTopToolbar
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                setHasActiveFilters={setHasActiveFilters}
                handleSearch={handleSearch}
                handleFilterFormReset={handleFilterFormReset}
                filterFormRef={filterFormRef}
              />
            )}
          />
        </Box>
      </Paper>
      {goalToDeleteId && isConfirmationDialogOpen ? (
        <ConfirmationDialog
          title="Delete Goal"
          content="Are you sure you want to proceed? The selected item will be permanently deleted."
          open={isConfirmationDialogOpen}
          onClose={closeConfirmationDialog}
          onConfirm={() => handleConfirmDelete(goalToDeleteId)}
        />
      ) : null}
    </>
  );
};
export default GoalTable;

