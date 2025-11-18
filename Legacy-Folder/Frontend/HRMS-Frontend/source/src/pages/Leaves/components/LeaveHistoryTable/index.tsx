import { useEffect, useState } from "react";
import {
  getLeaveHistory,
  GetLeaveHistoryResponse,
  LeaveHistoryFilter,
  LeaveHistoryItem,
} from "@/services/EmployeeLeave";
import { Stack } from "@mui/material"; // Added Collapse, Badge, Tooltip
import { initialPagination } from "@/utils/constants";
import { useUserStore } from "@/store";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { VisibilityState } from "@tanstack/table-core";
import { useRef } from "react";
import { LeaveHistoryTableFilterHandle } from "@/pages/Leaves/components/LeaveHistoryTableFilter";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import TableTopToolBar from "./TableTopToolbar";

const LeaveHistoryTable = () => {
  const [leaveHistoryList, setLeaveHistoryList] = useState<LeaveHistoryItem[]>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStartDate, setFilterStartDate] = useState<string | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<string | null>(null);
  const [leaveType, setLeaveType] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterFormRef = useRef<LeaveHistoryTableFilterHandle>(null);
  const { userData } = useUserStore();

  const { execute: fetchLeaveHistory } = useAsync<GetLeaveHistoryResponse>({
    requestFn: async (): Promise<GetLeaveHistoryResponse> => {
      return await getLeaveHistory(Number(userData.userId), {
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: {
          startDate: filterStartDate,
          endDate: filterEndDate,
          leaveType: Number(leaveType),
        },
      });
    },
    onSuccess: ({ data }) => {
      setLeaveHistoryList(data.result?.leaveHistoryList || []);
      setTotalRecords(data.result?.totalRecords || 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchLeaveHistory();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    filterStartDate,
    filterEndDate,
    leaveType,
  ]);

  const handleSearch = (filter: LeaveHistoryFilter) => {
    setFilterStartDate(filter.startDate);
    setFilterEndDate(filter.endDate);
    setLeaveType(String(filter.leaveType));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    const active =
      filter.startDate !== null ||
      filter.endDate !== null ||
      filter.leaveType != null;
    setHasActiveFilters(active);
  };

  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
    setFilterStartDate(null);
    setFilterEndDate(null);
    setLeaveType("");
    setHasActiveFilters(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns = useTableColumns({ pagination });

  return (
    <Stack gap={3}>
      <MaterialDataTable<LeaveHistoryItem>
        columns={columns}
        data={leaveHistoryList}
        pagination={pagination}
        sorting={sorting}
        columnVisibility={columnVisibility}
        totalRecords={totalRecords}
        setPagination={setPagination}
        setSorting={setSorting}
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
    </Stack>
  );
};

export default LeaveHistoryTable;
