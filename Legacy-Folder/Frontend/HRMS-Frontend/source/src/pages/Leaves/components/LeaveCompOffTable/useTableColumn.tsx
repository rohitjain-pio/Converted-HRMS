import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Typography } from "@mui/material";
import { LEAVE_REQUEST_TYPE_LABEL, LeaveRequestType, LeaveStatus } from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import SplitButton from "../SplitActionButton";
import moment from "moment";
import { LeaveCompOffDetails } from "@/services/LeaveManagment";

export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
 handleLeaveAction: (leave: LeaveCompOffDetails, decision: LeaveStatus) => void
};

export const useTableColumns = ({
  pagination,
  handleLeaveAction
}: UseTableColumnsProps) => {
  const columns = useMemo<MRT_ColumnDef<LeaveCompOffDetails>[]>(
    () => [
         {
        header: "Employee Code",
        accessorKey: "employeeCode",
        size: 120,
        Cell: ({ row }) => {
          return (
           
              <Typography>{row.original.employeeCode}</Typography>
          
          );
        },
      },
      {
        header: "Employee Name",
        id: "EmployeeName",
        accessorKey: "employeeName",
        size: 200,
      },
      {
        header: "Request Type",
        accessorKey: "type",
        size: 120,
        Cell: ({ row }) => LEAVE_REQUEST_TYPE_LABEL[row.original.requestType],
      },
      {
        header: "Working Date ",
        id: "workingDate",
        enableSorting: false,
        accessorFn: (row) => {
          const workingDate = moment(row.workingDate, "YYYY-MM-DD").format(
            "MMM Do, YYYY"
          );
          const noOfDay =
            row.numberOfDays && row.numberOfDays == 0.5
              ? "(Half Day)"
              : "(FullDay)";
          return `${workingDate} ${noOfDay}`;
        },
        size: 200,
      },
      {
        header: "Swapped With",
        id: "swappedWith",
        size: 250,
        enableSorting: false,
        Cell: ({ row }) => {
          const { requestType, leaveDate, leaveDateLabel } = row.original;

          if (requestType === LeaveRequestType.SwapLeave) {
            const swappedDesc = `${leaveDateLabel} (${moment(leaveDate).format("MMM Do, YYYY")})`;

            return (
              <TruncatedText
                text={swappedDesc}
                tooltipTitle={swappedDesc}
                maxLength={40}
              ></TruncatedText>
            );
          }

          return <Typography>N/A</Typography>;
        },
      },
      {
        header: "Reason",
        accessorKey: "reason",
        enableSorting: false,
        size: 250,
        Cell: ({ cell }) => (
          <TruncatedText
            text={cell.getValue<string>()}
            tooltipTitle={cell.getValue<string>()}
            maxLength={50}
          />
        ),
      },
      {
        header: "Actions",
        id: "actions",
        size: 150,
        enablePinning: true,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableColumnPinning: true,
        Cell: ({ row }) => (
          <SplitButton
            initial={row.original.status}
            onAction={(decision) => handleLeaveAction(row.original, decision)}
          />
        ),
      },
    ],
    [pagination]
  );
  return columns;
};
