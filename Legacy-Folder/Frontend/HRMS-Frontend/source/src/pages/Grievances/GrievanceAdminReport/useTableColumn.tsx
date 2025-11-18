import { EmployeeGrievanceResponse } from "@/services/Grievances";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {  IconButton,  Tooltip } from "@mui/material";
import { GRIEVANCE_LEVEL_LABEL, GRIEVANCE_TAT_STATUS_LABEL} from "@/utils/constants";
import { formatUtcToLocal } from "@/utils/date";
import { Visibility } from "@mui/icons-material";
import GrievanceStatusChip from "@/pages/Grievances/components/GrievanceStatusChip";

export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
 
};
export const useTableColumns = ({
  pagination,

}: UseTableColumnsProps) => {
  const navigate = useNavigate();
  const columns = useMemo<MRT_ColumnDef<EmployeeGrievanceResponse>[]>(
    () => [
      {
        header: "Ticket ID",
        accessorKey: "ticketNo",
        size: 180,
      },
      {
        header: "Grievance Type",

        accessorKey: "grievanceTypeName",
        size: 180,
      },
      {
        header: "Status",
        accessorKey: "status",
        Cell: ({ row }) => {
          const { status, level } = row.original;
          return (
            <GrievanceStatusChip
              status={status}
              level={level}
              chipProps={{ size: "small" }}
            />
          );
        },
        size: 120,
      },
      {
        header: "Created Date",
        accessorKey: "createdOn",
        accessorFn: (row) =>
          formatUtcToLocal(row.createdOn, { format: "MMM Do, YYYY" }),
        size: 150,
      },
      {
        header: "Created By",
        accessorKey: "createdBy",
        size: 150,
      },
      {
        header: "Resolved By",
        accessorKey: "resolvedBy",
        accessorFn: (row) =>
          row.resolvedBy ? row.resolvedBy : "Not Yet Resolved",
        size: 150,
      },
      // {
      //   header: "Resolved Date",
      //   accessorKey: "resolvedDate",
      //   accessorFn: (row) =>
      //     row.resolvedDate
      //       ? formatUtcToLocal(row.resolvedDate, { format: "MMM Do, YYYY" })
      //       : "Pending",
      //   size: 150,
      // },
      {
        header: "Escalation Level",
        accessorKey: "level",
        accessorFn: (row: EmployeeGrievanceResponse) =>
          GRIEVANCE_LEVEL_LABEL[row.level],
        size: 80,
      },
      {
        header: "TAT Status",
        accessorKey: "tatStatus",
        accessorFn: (row) => GRIEVANCE_TAT_STATUS_LABEL[row.tatStatus],

        size: 120,
      },

      {
        header: "Actions",
        visibleInShowHideMenu: false,
        id: "actions",
        size: 120,
        enableSorting: false,
        enablePinning: true,
        accessorFn: (row: EmployeeGrievanceResponse) => (
          <Tooltip title="View Grievance">
            <IconButton
              aria-label="View"
              onClick={() => {
                navigate(`/Grievance/tickets/${row.id}`);
              }}
            >
              <Visibility color="primary" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [pagination]
  );
  return columns;
};
