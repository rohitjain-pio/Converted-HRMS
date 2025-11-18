import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { Visibility } from "@mui/icons-material";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ExitEmployeeListItem } from "@/services/EmployeeExitAdmin";
import { BRANCH_LOCATION_LABEL, RESIGNATION_STATUS_LABELS, ResignationStatusCode, EMPLOYEE_STATUS_LABEL, KT_STATUS_LABELS, KTStatus } from "@/utils/constants";
import { Box } from "@mui/material";
import moment from "moment";
export type UseTableColumnsProps= {
  pagination: MRT_PaginationState;
}

export const useTableColumns = ({ pagination }: UseTableColumnsProps) => {
  const columns = useMemo<MRT_ColumnDef<ExitEmployeeListItem>[]>(
    () => [
         {
           header: "Employee Code",
           accessorKey: "employeeCode",
           size: 100,
           visibleInShowHideMenu: false,
           enableHiding: false,
         },
         {
           header: "Employee Name",
           accessorKey: "employeeName",
           enableHiding: false,
           size: 200,
           visibleInShowHideMenu: false,
         },
         {
           header: "Department",
           accessorKey: "departmentName",
           size: 150,
         },
         {
           header: "Branch",
           id: "branchId",
           accessorFn: (row) => BRANCH_LOCATION_LABEL[row.branchId],
           size: 120,
         },
         {
           header: "Resignation Date",
           id: "resignationDate",
           accessorFn: (row) =>
             row.resignationDate
               ? moment(row.resignationDate, "YYYY-MM-DD").format("MMM Do, YYYY")
               : "",
           size: 100,
         },
         {
           header: "Last Working Day",
           id: "lastWorkingDay",
           accessorFn: (row) =>
             row.lastWorkingDay
               ? moment(row.lastWorkingDay, "YYYY-MM-DD").format("MMM Do, YYYY")
               : "",
           size: 100,
         },
         {
           header: "Resignation Status",
           id: "resignationStatus",
           enableHiding: false,
           visibleInShowHideMenu: false,
           accessorFn: (row) =>
             RESIGNATION_STATUS_LABELS[
               row.resignationStatus as ResignationStatusCode
             ],
           size: 100,
         },
         {
           header: "Employee Status",
           id: "employeeStatus",
           accessorFn: (row) => EMPLOYEE_STATUS_LABEL[row.employeeStatus],
           size: 100,
         },
         {
           header: "KT Status",
           id: "ktStatus",
           accessorFn: (row) =>
             KT_STATUS_LABELS[row.ktStatus] ?? KT_STATUS_LABELS[KTStatus.pending],
           size: 100,
         },
         {
           header: "Exit Interview Status",
           id: "exitInterviewStatus",
           accessorFn: (row) =>
             row.exitInterviewStatus ? "Completed" : "Pending",
           size: 200,
         },
         {
           header: "IT No Due",
           id: "itNoDue",
           accessorFn: (row) => (row.itNoDue ? "Yes" : "No"),
           size: 100,
         },
         {
           header: "Accounts No Due",
           id: "accountsNoDue",
           accessorFn: (row) => (row.accountsNoDue ? "Yes" : "No"),
           size: 100,
         },
         {
           header: "Actions",
           id: "actions",
           size: 100,
           enableSorting: false,
           visibleInShowHideMenu: false,
           enableHiding: false,
           enablePinning: true,
           accessorFn: (row) => (
             <Box
               role="group"
               aria-label="Action buttons"
               sx={{ display: "flex", gap: "10px" }}
             >
               <ActionIconButton
                 label="View"
                 colorType="primary"
                 as={Link}
                 icon={<Visibility />}
                 to={`/employees/employee-exit/${row.resignationId}`}
               />
             </Box>
           ),
         },
    ],
    [pagination]
  );

  return columns;
};
