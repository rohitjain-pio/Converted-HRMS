import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import {
  LEAVE_REQUEST_TYPE_LABEL,
  LEAVE_STATUS_LABEL,
  LeaveRequestType,
  LeaveStatus,
} from "@/utils/constants";
import moment from "moment";
import { AdjustedLeave } from "@/services/EmployeeLeave";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  getWorkDaysLabel(numberOfDays: number | null): string | null;
};

export const useTableColumns = ({
  pagination,
  getWorkDaysLabel,
}: UseTableColumnsProps) => {
  const theme = useTheme();
  const DASH = "\u2014";
  const columns = useMemo<MRT_ColumnDef<AdjustedLeave>[]>(
    () => [
      {
        id: "requestType",
        header: "Request Type",
        size: 140,
        accessorFn: (row) => LEAVE_REQUEST_TYPE_LABEL[row?.requestType],
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
      {
        id: "workedOn",
        header: "Worked On",
        size: 240,
        accessorFn: (row) => {
          const label = row.workingDateLabel;
          const date = row.workingDate;

          const workingLabel =
            label ||
            (date ? moment(date, "YYYY-MM-DD").format("MMM Do, YYYY") : DASH);

          const isCompOff = row.requestType === LeaveRequestType.CompOff;
          const days = row.numberOfDays;

          const daysLabel = isCompOff ? getWorkDaysLabel(days) : null;

          return daysLabel ? `${workingLabel} (${daysLabel})` : workingLabel;
        },
      },
      {
        id: "takeOffOn",
        header: "Take Off On",
        size: 200,
        accessorFn: (row) => {
          const isSwap = row.requestType === LeaveRequestType.SwapLeave;
          if (!isSwap) return DASH;
          const label = row.leaveDateLabel;
          const date = row.leaveDate;
          return (
            label ||
            (date ? moment(date, "YYYY-MM-DD").format("MMM Do, YYYY") : DASH)
          );
        },
      },
      {
        id: "reason",
        header: "Reason",
        size: 260,
        accessorFn: (row) => row?.reason || DASH,
      },
      {
        id: "rejectReason",
        header: "Reject Reason",
        size: 260,
        accessorFn: (row) => row?.rejectReason || DASH,
      },
      {
        header: "Status",
        id: "status",
        accessorKey: "status",
        size: 150,
        Cell: ({ row }) => {
          const leaveStatus = row.original.status;
          const label = LEAVE_STATUS_LABEL[leaveStatus];

          let Icon = null;
          let color = "";

          switch (leaveStatus) {
            case LeaveStatus.Accepted:
              Icon = CheckCircleIcon;
              color = theme.palette.success.main;
              break;

            case LeaveStatus.Pending:
              Icon = PendingIcon;
              color = theme.palette.secondary.main;
              break;

            case LeaveStatus.Rejected:
              Icon = CancelIcon;
              color = theme.palette.error.main;
              break;
          }

          return (
            <Box display="flex" gap={0.5} sx={{ alignItems: "center", color }}>
              {Icon && <Icon sx={{ fontSize: "1rem" }} />}
              <Typography>{label}</Typography>
            </Box>
          );
        },
      },
      {
        id: "submittedOn",
        header: "Submitted On",
        visibleInShowHideMenu: false,
        enableHiding: false,
        size: 160,
        accessorFn: (row) => {
          const { createdOn } = row;
          const m = moment(createdOn);
          return m.isValid() ? m.format("MMM Do, YYYY") : DASH;
        },
      },
    ],
    [pagination]
  );
  return columns;
};

