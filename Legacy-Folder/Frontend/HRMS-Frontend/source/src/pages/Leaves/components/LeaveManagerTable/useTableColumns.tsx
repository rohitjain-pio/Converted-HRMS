import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Typography } from "@mui/material";
import { LeaveStatus } from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import SplitButton from "../SplitActionButton";
import moment from "moment";
import RouterMaterialLink from "@/pages/CompanyPolicy/components/RouterMaterialLink";
import { LeaveManagerItem } from "@/services/LeaveManagment";

export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
 handleLeaveAction: (leave: LeaveManagerItem, decision: LeaveStatus) => void
};

export const useTableColumns = ({
  pagination,
  handleLeaveAction
}: UseTableColumnsProps) => {
  const columns = useMemo<MRT_ColumnDef<LeaveManagerItem>[]>(
    () => [
    {
        header: "Employee Code",
        accessorKey: "employeeCode",
        size: 150,
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
        header: "Leave",
        accessorKey: "leaveTitle",
        size: 250,
        Cell: ({ row }) => {
          const { totalLeaveDays } = row.original;

          const leaveTitle = row.original.title?.toLowerCase();

          const dayLabel =
            totalLeaveDays === 1 || totalLeaveDays === 0.5 ? "day" : "days";
          const leaveDescription = `${totalLeaveDays} ${dayLabel} of ${leaveTitle}`;
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
        header: "Duration",
        id: "duration",
        enableSorting: false,
        accessorFn: (row) => {
          const startDate = moment(row.startDate, "YYYY-MM-DD").format(
            "DD MMM"
          );
          const endDate = moment(row.endDate, "YYYY-MM-DD").format("DD MMM");
          const DASH = "\u2014";
          return `${startDate} ${DASH} ${endDate}`;
        },
        size: 180,
      },
      {
        header: "Reason",
        accessorKey: "reason",
        enableSorting: false,
        size: 300,
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
