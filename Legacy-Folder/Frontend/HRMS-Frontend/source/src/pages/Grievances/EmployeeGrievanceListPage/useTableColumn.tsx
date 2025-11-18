import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { EmployeeGrievance } from "@/services/Grievances";
import { formatUtcToLocal } from "@/utils/date";
import { Visibility } from "@mui/icons-material";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import GrievanceStatusChip from "@/pages/Grievances/components/GrievanceStatusChip";
export type UseTableColumnsProps= {
  pagination: MRT_PaginationState;
}

export const useTableColumns = ({ pagination }: UseTableColumnsProps) => {
  const columns = useMemo<MRT_ColumnDef<EmployeeGrievance>[]>(
    () => [
      {
        header: "Ticket ID",
        accessorKey: "ticketNo",
        size: 150,
        enableSorting: false,
      },
      {
        header: "Grievance Type",
        accessorKey: "grievanceTypeName",
        size: 150,
      },
      {
        header: "Status",
        id: "status",
        size: 100,
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
      },
      {
        header: "Raised On",
        id: "createdOn",
        accessorFn: (row) =>
          formatUtcToLocal(row.createdOn, { format: "MMM Do, YYYY" }),
        size: 100,
      },
      {
        header: "Managed By",
        accessorKey: "manageBy",
        accessorFn: (row: EmployeeGrievance) => (
          <TruncatedText
            text={row.manageBy}
            tooltipTitle={row.manageBy}
            maxLength={40}
          />
        ),
        size: 180,
        enableSorting: false,
      },
      {
        header: "Actions",
        id: "actions",
        size: 100,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
        enablePinning: true,
        accessorFn: (row: EmployeeGrievance) => (
          <ActionIconButton
            label="View Details"
            colorType="primary"
            as={Link}
            size="medium"
            icon={<Visibility />}
            to={`/Grievance/tickets/${row.id}`}
          />
        ),
      },
    ],
    [pagination]
  );

  return columns;
};
