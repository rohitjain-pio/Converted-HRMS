import {
  FeedbackType,
  FeedbackTypeFilter,
  GetFeedBackList,
  GetFeedbackListArgs,
} from "@/services/Support/types";
import { FilterFormHandle, initialPagination } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import { VisibilityState } from "@tanstack/table-core";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import BreadCrumbs from "@/components/@extended/Router";
import { Box, Paper } from "@mui/material";
import MaterialDataTable from "@/components/MaterialDataTable";
import { useTableColumns } from "./useTableColums";
import PageHeader from "@/components/PageHeader/PageHeader";
import TableTopToolBar from "./TableTopToolBar";
import { DEFAULT_FEEDBACK_TYPE_FILTERS } from "./constant";
import { getFeedBackList } from "@/services/Support";
import useAsync from "@/hooks/useAsync";
import {
  mapSortingToApiParams,
  mapPaginationToApiParams,
} from "@/utils/helpers";
import methods from "@/utils";

const FeedBackAdminPage = () => {
  const [feedBackData, setFeedBackData] = useState<FeedbackType[]>([]);
  const filterFormRef = useRef<FilterFormHandle>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FEEDBACK_TYPE_FILTERS);

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
  };
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
  });
  const { execute: fetchEmployeeFeedBackList } = useAsync<
    GetFeedBackList,
    GetFeedbackListArgs
  >({
    requestFn: async (): Promise<GetFeedBackList> => {
      return await getFeedBackList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: { ...filters },
      });
    },
    onSuccess: ({ data }) => {
      setFeedBackData(data.result.feedbackList);
      setTotalRecords(data.result.totalRecords);
    },
    onError:(err)=>{
      methods.throwApiError(err)
    }
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
  useEffect(() => {
    fetchEmployeeFeedBackList();
  }, [pagination, sorting, filters,selectedEmployees]);
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" title="Support Queries" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<FeedbackType>
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
      </Paper>
    </>
  );
};
export default FeedBackAdminPage;
