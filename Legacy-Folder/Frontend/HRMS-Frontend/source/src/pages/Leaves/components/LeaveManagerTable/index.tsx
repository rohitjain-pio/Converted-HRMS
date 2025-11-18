import {
  Box,
} from "@mui/material";
import { initialPagination, LeaveStatus } from "@/utils/constants";
import {
  getEmployeeLeaveArgs,
  LeaveManagementResponse,
  LeaveManagerItem,
  UpdateLeaveArgs,
  UpdateLeaveResponse,
} from "@/services/LeaveManagment";
import {
  acceptOrRejectLeave,
  getEmployeeLeaves,
} from "@/services/LeaveManagment/leaveManagmentService";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import { useEffect, useState, useRef } from "react";
import LeaveActionDialog from "@/pages/Leaves/components/LeaveDialog";
import { useUserStore } from "@/store";
import {
  LeaveManagerFilter,
} from "@/services/EmployeeLeave/types";
import {
  FilterFormHandle,
} from "@/pages/Leaves/components/LeaveMangerTableFilter";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import { toast } from "react-toastify";
import {
  mapPaginationToApiParams,
  mapSortingToApiParams,
} from "@/utils/helpers";
import { useTableColumns } from "./useTableColumns";
import MaterialDataTable from "@/components/MaterialDataTable";
import { VisibilityState } from "node_modules/@tanstack/table-core/build/lib/features/ColumnVisibility";
import TableTopToolbar from "./TableTopToolbar";

const LeaveManagerTable = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [status, setStatus] = useState<LeaveStatus | null>(LeaveStatus.Pending);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveManagerItem | null>(
    null
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [leaves, setLeaves] = useState<LeaveManagerItem[]>([]);
  const { userData } = useUserStore();
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(true);
  const filterFormRef = useRef<FilterFormHandle>(null);

  const { execute: updateLeave } = useAsync<
    UpdateLeaveResponse,
    UpdateLeaveArgs
  >({
    requestFn: async (args: UpdateLeaveArgs) => await acceptOrRejectLeave(args),
    onSuccess: (_, args) => {
      if (args?.decision == LeaveStatus.Accepted) {
        toast.success("Leave request approved.");
      }
      if (args?.decision == LeaveStatus.Rejected) {
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

  const { execute: getLeave } = useAsync<
    LeaveManagementResponse,
    getEmployeeLeaveArgs
  >({
    requestFn: async () => {
      const employeeCodes = selectedEmployees
        .map((emp) => emp.split(" - ")[0])
        .join(",");
      setLoading(true);
      return await getEmployeeLeaves({
        ...mapSortingToApiParams(sorting),
        ...mapPaginationToApiParams(pagination),
        filters: {
          startDate,
          endDate,
          status: status ? Number(status) : null,
          employeeCode: selectedEmployees.length > 0 ? employeeCodes : "",
        },
      });
    },
    onSuccess: (response) => {
      setLeaves(response.data.result.leaveRequestList);
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
    setStartDate(null);
    setEndDate(null);
    setStatus(null);
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

  const handleImportSuccess = () => {
    const { sortColumnName, sortDirection } = mapSortingToApiParams(sorting);
    const hasActiveSort = sortColumnName !== "" || sortDirection !== "";
    setSorting([]);
    if (!hasActiveSort) {
      getLeave();
    }
  };

  const handleLeaveAction = (
    leave: LeaveManagerItem,
    decision: LeaveStatus
  ) => {
    if (decision === LeaveStatus.Rejected) {
      setSelectedLeave(leave);
      setDialogOpen(true);
    } else {
      setSelectedLeave(leave);
      updateLeave({
        appliedLeaveId: leave.id,
        decision: decision,
        openingBalance: leave.openingBalance,
      });
    }
  };

  const handleConfirm = (comment: string) => {
    if (!selectedLeave) return;

    updateLeave({
      appliedLeaveId: selectedLeave.id,
      decision: LeaveStatus.Rejected,
      openingBalance: selectedLeave.openingBalance,
      rejectReason: comment,
    });

    setSelectedLeave(null);
  };

  const handleSearch = (filter: LeaveManagerFilter) => {
    setStartDate(filter.startDate);
    setEndDate(filter.endDate);
    setStatus(filter.leaveStatus);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setHasActiveFilters(true);
  };

  useEffect(() => {
    getLeave();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    startDate,
    endDate,
    status,
    selectedEmployees.length,
  ]);

  const columns = useTableColumns({ pagination, handleLeaveAction });

  return (
    <>
      <Box sx={{ paddingX: "20px" }}>
        <MaterialDataTable<LeaveManagerItem>
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
            <TableTopToolbar
              userData={userData}
              selectedEmployees={selectedEmployees}
              setSelectedEmployees={setSelectedEmployees}
              setLoading={setLoading}
              handleImportSuccess={handleImportSuccess}
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
export default LeaveManagerTable;
