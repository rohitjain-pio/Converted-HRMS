import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { LEAVE_STATUS_LABEL, LeaveStatus } from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import moment from "moment";
import RouterMaterialLink from "@/pages/CompanyPolicy/components/RouterMaterialLink";
import { LeaveHistoryItem } from "@/services/EmployeeLeave";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
};

export const useTableColumns = ({
  pagination,
}: UseTableColumnsProps) => {
    const theme = useTheme();
  const columns = useMemo<MRT_ColumnDef<LeaveHistoryItem>[]>(
    () => [
   {
        header: "Leave",
        accessorKey: "leaveTitle",
        size: 250,
        Cell: ({ row }) => {
          const { totalDays } = row.original;

          const leaveTitle = row.original.leaveTitle?.toLowerCase();

          const dayLabel =
            totalDays === 1 || totalDays === 0.5 ? "day" : "days";
          const leaveDescription = `${totalDays} ${dayLabel} of ${leaveTitle}`;

          return (
            <RouterMaterialLink to={`/leave/details/${row.original.id}`}>
              <TruncatedText
                text={leaveDescription}
                tooltipTitle={leaveDescription}
                maxLength={30}
              />
            </RouterMaterialLink>
          );
        },
      },
      {
        header: "Reason",
        accessorKey: "reason",
        enableSorting: false,
        size: 300,
        Cell: ({ row }) => (
          <TruncatedText
            text={row.original.reason}
            tooltipTitle={row.original.reason}
            maxLength={50}
          />
        ),
      },
      {
        header: "Duration",
        id: "duration",
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => {
          const startDateFormatted = moment(
            row.original.startDate,
            "YYYY-MM-DD"
          ).format("DD MMM");
          const endDateFormatted = moment(
            row.original.endDate,
            "YYYY-MM-DD"
          ).format("DD MMM");
          const DASH = "\u2014";
          const duration = `${startDateFormatted} ${DASH} ${endDateFormatted}`;
          return (
            <TruncatedText
              text={duration}
              tooltipTitle={duration}
              maxLength={15}
            />
          );
        },
      },
      {
        header: "Status",
        id: "status",
        accessorKey: "status",
        size: 150,
        enableSorting: false,
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
    ],
    [pagination]
  );
  return columns;
};
