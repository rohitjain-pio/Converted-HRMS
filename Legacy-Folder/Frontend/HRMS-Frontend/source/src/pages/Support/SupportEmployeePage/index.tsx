import {
  EmployeeFeedbackType,
  FeedbackTypeFilter,
  GetEmployeeFeedBackList,
  GetEmployeeFeedbackListArgs,
} from "@/services/Support/types";
import { FilterFormHandle, initialPagination } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import { VisibilityState } from "@tanstack/table-core";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import BreadCrumbs from "@/components/@extended/Router";
import { Box, Paper } from "@mui/material";
import MaterialDataTable from "@/components/MaterialDataTable";
import { useTableColumns } from "./useTableColumns";
import PageHeader from "@/components/PageHeader/PageHeader";
import TableTopToolBar from "./TableTopToolBar";
import { DEFAULT_EMPLOYEE_FEEDBACK_TYPE_FILTERS } from "./constant";
import useAsync from "@/hooks/useAsync";
import { getEmployeeFeedBackList } from "@/services/Support";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";

const FeedBackAdminPage = () => {
  const [feedBackData, setFeedBackData] = useState<EmployeeFeedbackType[]>([]);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const [filters, setFilters] = useState(
    DEFAULT_EMPLOYEE_FEEDBACK_TYPE_FILTERS
  );

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
  });
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const columns = useTableColumns({ pagination });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const handleSearch = (filters: FeedbackTypeFilter) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setFilters(filters);
  };
  const { execute: fetchEmployeeFeedBackList } = useAsync<
    GetEmployeeFeedBackList,
    GetEmployeeFeedbackListArgs
  >({
    requestFn: async (): Promise<GetEmployeeFeedBackList> => {
      return await getEmployeeFeedBackList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters },
      });
    },
    onSuccess: ({ data }) => {
      setFeedBackData(data.result.feedbackList);
      setTotalRecords(data.result.totalRecords);
    },
  });
  useEffect(() => {
    fetchEmployeeFeedBackList();
  }, [pagination, sorting, filters]);
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="My Support" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<EmployeeFeedbackType>
            columns={columns}
            data={feedBackData}
            pagination={pagination}
            sorting={sorting}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            topToolbar={() => (
              <TableTopToolBar
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
export default FeedBackAdminPage;
