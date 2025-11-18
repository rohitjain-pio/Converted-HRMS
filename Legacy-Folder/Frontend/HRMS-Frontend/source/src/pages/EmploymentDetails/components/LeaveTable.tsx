import { useState } from "react";
import DataTable from "@/components/DataTable/DataTable";
import {
  TextField,
  IconButton,
  Dialog,
  Box,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { AccuralLeave } from "@/pages/EmploymentDetails/components/AccuralLeave";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import useAsync from "@/hooks/useAsync";
import {
  getEmployeeLeaveById,
  updateLeaves,
} from "@/services/LeaveManagment/leaveManagmentService";
import {
  EmployeeLeave,
  GetEmployeeLeaveByIdResponse,
  UpdateLeaveRequest,
} from "@/services/LeaveManagment/types";
import methods from "@/utils";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useParams } from "react-router-dom";
import LeaveActionDialog from "@/pages/EmploymentDetails/components/LeaveActionDialog";
import { LEAVE_TYPES } from "@/utils/constants";

export const LeaveTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [leaveRows, setLeaveRows] = useState<EmployeeLeave[]>([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedLeaveRow, setSelectedLeaveRow] =
    useState<EmployeeLeave | null>(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | undefined>();
  const { id } = useParams();

  const [initialInputData, setInitialInputData] = useState<{
    [key: number]: number;
  }>({});

  const { execute: fetchEmployeeLeave } =
    useAsync<GetEmployeeLeaveByIdResponse>({
      requestFn: async () => await getEmployeeLeaveById(Number(id)),
      onSuccess: ({ data }) => {
        const rows = data.result || [];
        setLeaveRows(rows);

        const initialData: { [key: number]: number } = {};
        rows.forEach((row) => {
          initialData[row.leaveId] = row.openingBalance;
        });

        setInitialInputData(initialData);
      },
      onError(error) {
        methods.throwApiError(error);
      },
      autoExecute: true,
    });

  const { execute: executeUpdateLeave } = useAsync<unknown, UpdateLeaveRequest>(
    {
      requestFn: async (payload) => await updateLeaves(payload),
      onSuccess: () => {
        fetchEmployeeLeave();
      },
      onError: (error) => {
        methods.throwApiError(error);
      },
    }
  );

  const handleOpenDialog = (id: number) => {
    setSelectedLeaveId(id);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLeaveId(undefined);
  };

  const handleCheckOption = (row: EmployeeLeave) => {
    const updatedIsActive = !row.isActive;
    executeUpdateLeave({
      employeeId: Number(id),
      leaveId: row.leaveId,
      openingBalance: row.openingBalance,
      isActive: updatedIsActive,
    });
  };

  const headerCells = [
    {
      label: "Status",
      accessor: "checkbox",
      width: "50px",
      renderColumn: (row: EmployeeLeave) => (
        <Switch
          checked={row.isActive}
          onChange={() => handleCheckOption(row)}
          color="primary"
        />
      ),
    },
    { label: "Leave Type", accessor: "title", width: "150px" },
    {
      label: "Opening Balance",
      accessor: "openingBalance",
      width: "150px",
      renderColumn: (row: EmployeeLeave) => {
        return (
          <Box>
            <TextField
              size="small"
              value={row.openingBalance}
              type="number"
              variant="outlined"
              disabled={!row.isActive}
              onChange={(e) => {
                const newBalance = Number(e.target.value);
                setLeaveRows((prevRows) =>
                  prevRows.map((r) =>
                    r.leaveId === row.leaveId
                      ? { ...r, openingBalance: newBalance }
                      : r
                  )
                );
              }}
              onBlur={(e) => {
                const newBalance = Number(e.target.value);
                if (newBalance === initialInputData[row.leaveId]) {
                  return;
                }
                setSelectedLeaveRow({ ...row, openingBalance: newBalance });
                setCommentDialogOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const newBalance = Number(
                    (e.target as HTMLInputElement).value
                  );
                  if (newBalance === initialInputData[row.leaveId]) {
                    return;
                  }
                  setSelectedLeaveRow({ ...row, openingBalance: newBalance });
                  setCommentDialogOpen(true);
                }
              }}
              slotProps={{
                htmlInput: { style: { width: 60 } },
              }}
            />
          </Box>
        );
      },
    },
    { label: "Accrued Leave", accessor: "accruedLeave", width: "100px" },
    { label: "Closing Balance", accessor: "closingBalance", width: "100px" },
    {
      label: "Actions",
      accessor: "actions",
      width: "100px",
      renderColumn: (row: EmployeeLeave) => (
        <>
          <Tooltip title="View Computation">
            <IconButton
              onClick={() => handleOpenDialog(row.leaveId)}
              size="small"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader variant="h2" title="Leaves" hideBorder={true} />
      <DataTable
        headerCells={headerCells}
        data={leaveRows}
        totalRecords={leaveRows.length}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <Box display="flex" justifyContent="space-between" p={1}>
          <Typography pl={2} pt={1}
            variant="h4"
            sx={{ textTransform: "capitalize" }}
          >
            {LEAVE_TYPES[Number(selectedLeaveId)]?.label}
          </Typography>

          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </Box>
        <AccuralLeave leaveId={Number(selectedLeaveId)} />
      </Dialog>

      <LeaveActionDialog
        open={commentDialogOpen}
        onClose={() => {
          if (selectedLeaveRow) {
            const originalBalance = initialInputData[selectedLeaveRow.leaveId];
            setLeaveRows((prevRows) =>
              prevRows.map((r) =>
                r.leaveId === selectedLeaveRow.leaveId
                  ? { ...r, openingBalance: originalBalance }
                  : r
              )
            );
          }
          setCommentDialogOpen(false);
          setSelectedLeaveRow(null);
        }}
        onConfirm={(comment) => {
          if (selectedLeaveRow) {
            executeUpdateLeave({
              employeeId: Number(id),
              leaveId: selectedLeaveRow.leaveId,
              openingBalance: selectedLeaveRow.openingBalance,
              isActive: selectedLeaveRow.isActive,
              description: comment,
            });
          }
          setCommentDialogOpen(false);
          setSelectedLeaveRow(null);
        }}
      />
    </>
  );
};
