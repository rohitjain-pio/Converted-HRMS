import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { GrievanceType } from "@/services/Grievances";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Switch } from "@mui/material";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";

export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  handleAutoEscalation: (row: GrievanceType) => void;
  openConfirmationDialog: (grievanceId: number) => void;
};

export const useTableColumns = ({
  pagination,
  handleAutoEscalation,
  openConfirmationDialog,
}: UseTableColumnsProps) => {
  const navigate = useNavigate();
  const { GRIEVANCE } = permissionValue;
  const columns = useMemo<MRT_ColumnDef<GrievanceType>[]>(
    () => [
      {
        header: "Grievance Type",
        accessorKey: "grievanceName",
        size: 150,
      },
      {
        header: "Description",
        accessorKey: "description",
        enableHiding: true,
        accessorFn: (row: GrievanceType) => (
          <TruncatedText
            text={row.description}
            tooltipTitle={row.description}
            maxLength={50}
          />
        ),
        size: 250,
      },
      {
        header: "L1 Owner",
        accessorKey: "l1OwnerName",
        enableSorting: false,
        accessorFn: (row: GrievanceType) => (
          <TruncatedText
            text={row.l1OwnerName}
            tooltipTitle={row.l1OwnerName}
            maxLength={50}
          />
        ),
        size: 250,
      },

      {
        header: "TATs(L1)",
        accessorFn: (row: GrievanceType) => `${row.l1TatHours} hr`,
        id: "l1TatHours",
        size: 100,
      },
      {
        header: "L2 Owner",
        accessorKey: "l2OwnerName",
        enableSorting: false,
        accessorFn: (row: GrievanceType) => (
          <TruncatedText
            text={row.l2OwnerName}
            tooltipTitle={row.l2OwnerName}
            maxLength={50}
          />
        ),
        size: 250,
      },
      {
        header: "TATs(L2)",
        accessorFn: (row: GrievanceType) => `${row.l2TatHours} hr`,
        id: "l2TatHours",
        size: 100,
      },
      {
        header: "L3 Owner",
        accessorKey: "l3OwnerName",
        accessorFn: (row: GrievanceType) => (
          <TruncatedText
            text={row.l3OwnerName}
            tooltipTitle={row.l3OwnerName}
            maxLength={50}
          />
        ),
        enableSorting: false,
        size: 250,
      },
      {
        header: "TATs(L3)",
        accessorFn: (row: GrievanceType) =>
          `${row.l3TatDays} ${row.l3TatDays === 1 ? "day" : "days"}`,
        id: "l3TatDays",
        size: 100,
      },
      {
        header: "Auto Escalation",
        accessorFn: (row: GrievanceType) => (
          <Switch
            checked={row.isAutoEscalation}
            onChange={() => handleAutoEscalation(row)}
            slotProps={{
              input: { "aria-label": "controlled" },
            }}
          />
        ),
        id: "isAutoEscalation",
        enableSorting: false,
        size: 100,
      },
      {
        header: "Actions",
        id: "actions",
        size: 120,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
        enablePinning: true,
        accessorFn: (row: GrievanceType) => (
          <Box
            aria-label="Action buttons"
            sx={{ display: "flex", gap: "20px" }}
          >
            {hasPermission(GRIEVANCE.EDIT) && (
              <ActionIconButton
                label="Edit Grievance"
                size="small"
                onClick={() => navigate(`edit-grievance/${row.id}`)}
                icon={<EditIcon />}
              />
            )}
            {hasPermission(GRIEVANCE.DELETE) && (
              <ActionIconButton
                label="Delete Grievance"
                size="small"
                onClick={() => openConfirmationDialog(Number(row.id))}
                icon={<DeleteIcon />}
                colorType="error"
              />
            )}
          </Box>
        ),
      },
    ],
    [pagination]
  );
  return columns;
};
