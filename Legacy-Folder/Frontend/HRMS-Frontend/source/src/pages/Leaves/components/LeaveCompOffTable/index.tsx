
import {
    initialPagination,
  LeaveStatus,
} from "@/utils/constants";
import {
  ApproveOrRejectCompOffAndSwapArgs,
  ApproveOrRejectCompOffAndSwapResponse,
  GetCompOffSwapHolidayArgs,
  GetLeaveCompOffResponse,
  Leave_CompOffArgs,
  LeaveCompOffDetails,
} from "@/services/LeaveManagment";
import {
  approveOrRejectCompOffAndSwap,
  getCompOffAndSwapHolidayList,
} from "@/services/LeaveManagment/leaveManagmentService";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";

import LeaveActionDialog from "@/pages/Leaves/components/LeaveDialog";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import {
  Box,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_LEAVE_REQUEST_FILTER } from "@/pages/Leaves/constant";
import {
  FilterFormHandle,
} from "@/pages/Leaves/components/LeaveCompOffTableFilte";
import { toast } from "react-toastify";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import { VisibilityState } from "node_modules/@tanstack/table-core/build/lib/features/ColumnVisibility";
import TableTopToolBar from "./TableTopToolbar";
import { mapPaginationToApiParams, mapSortingToApiParams } from "@/utils/helpers";

const LeaveCompOffPage = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] =
    useState<LeaveCompOffDetails | null>(null);
  const [leaves, setLeaves] = useState<LeaveCompOffDetails[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [filter, setFilter] = useState<Leave_CompOffArgs>(
    DEFAULT_LEAVE_REQUEST_FILTER
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(true);
  const filterFormRef = useRef<FilterFormHandle>(null);


  const { execute: getLeave } = useAsync<
    GetLeaveCompOffResponse,
    GetCompOffSwapHolidayArgs
  >({
    requestFn: async () => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      setLoading(true);
      return await getCompOffAndSwapHolidayList({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: {
          ...filter,
          employeeCode: selectedEmployees.length > 0 ? employeeCodes : "",
        },
      });
    },
    onSuccess: (response) => {
      setLeaves(response.data.result.compOffAndSwapHolidayList);
      setTotalRecords(response.data.result.totalCount);
      setLoading(false);
    },
    onError: (err) => {
      setLoading(false);
      methods.throwApiError(err);
    },
    autoExecute: false,
  });
  const handleFilterFormReset = () => {
    filterFormRef.current?.handleReset();
    setHasActiveFilters(false);
    setFilter({ ...DEFAULT_LEAVE_REQUEST_FILTER, status: null });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);

    if (selectedLeave && selectedLeave.status == LeaveStatus.Rejected) {
      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === selectedLeave.id
            ? { ...leave, status: LeaveStatus.Pending }
            : leave
        )
      );
    }
    setSelectedLeave(null);
  };

  const { execute: updateLeave } = useAsync<
    ApproveOrRejectCompOffAndSwapResponse,
    ApproveOrRejectCompOffAndSwapArgs
  >({
    requestFn: async (args: ApproveOrRejectCompOffAndSwapArgs) =>
      await approveOrRejectCompOffAndSwap(args),
    onSuccess: (_, args) => {
      if (args?.status == LeaveStatus.Accepted) {
        toast.success("Leave request approved.");
      }
      if (args?.status == LeaveStatus.Rejected) {
        toast.success("Leave request rejected");
      }
      setDialogOpen(false);
      setSelectedLeave(null);
      getLeave();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const handleLeaveAction = (
    leave: LeaveCompOffDetails,
    decision: LeaveStatus
  ) => {
    if (decision === LeaveStatus.Rejected) {
      setSelectedLeave(leave);
      setDialogOpen(true);
    } else {
      setSelectedLeave(leave);
      updateLeave({
        id: leave.id,
        employeeId: leave.employeeId,
        status: decision,
        type: leave.requestType,
        workingDate: leave.workingDate,
        leaveDate: leave.leaveDate,
        reason: leave.reason,
        leaveDateLabel: leave.leaveDateLabel,
        rejectReason: leave.rejectReason,
        workingDateLabel: leave.workingDateLabel,
        numberOfDays: leave.numberOfDays,
      });
    }
  };

  const handleConfirm = (comment: string) => {
    if (!selectedLeave) return;

    updateLeave({
      id: selectedLeave.id,
      employeeId: selectedLeave.employeeId,
      status: LeaveStatus.Rejected,
      type: selectedLeave.requestType,
      workingDate: selectedLeave.workingDate,
      leaveDate: selectedLeave.leaveDate,
      reason: selectedLeave.reason,
      leaveDateLabel: selectedLeave.leaveDateLabel,
      rejectReason: comment,
      workingDateLabel: selectedLeave.workingDateLabel,
      numberOfDays: selectedLeave.numberOfDays,
    });
    setSelectedLeave(null);
  };

  const handleSearch = (filters: Leave_CompOffArgs) => {
    setFilter(filters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setHasActiveFilters(true);
  };

  useEffect(() => {
    getLeave();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    filter,
    selectedEmployees.length,
  ]);

  const columns = useTableColumns({ pagination, handleLeaveAction });

  return (
    <>
      <Box sx={{ paddingX: "20px" }}>
        <MaterialDataTable<LeaveCompOffDetails>
          columns={columns}
          data={leaves}
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
      <LeaveActionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleConfirm}
      />
      <GlobalLoader loading={loading} />
    </>
  );
};

export default LeaveCompOffPage;
