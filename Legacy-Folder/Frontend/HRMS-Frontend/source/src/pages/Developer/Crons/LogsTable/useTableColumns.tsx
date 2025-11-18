import { useMemo } from "react";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import {
    CRON_TYPE_OPTIONS,
} from "@/utils/constants";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CronLogsResponseData } from "@/services/Developer/types";
import moment from "moment";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  handleViewLog: (id: number) => void
};

export const useTableColumns = ({ pagination,handleViewLog }: UseTableColumnsProps) => {

  const columns = useMemo<MRT_ColumnDef<CronLogsResponseData>[]>(
    () => [
      {
              header: "Id",
              accessorKey: "id",
              size: 50,
              visibleInShowHideMenu: true,
              enableHiding: true,
            },
            {
              header: "Type",
              accessorKey: "typeId",
              size: 100,
              visibleInShowHideMenu: true,
              enableHiding: true,
              Cell: ({ row }) => {
                const v = row.getValue<string | null>("typeId");
                if (!v) return "";
                const option = CRON_TYPE_OPTIONS.find((opt) => opt.id == v);
                return option ? option.label : "";
              },
            },
            {
              header: "Started At",
              accessorKey: "startedAt",
              size: 120,
              visibleInShowHideMenu: true,
              enableHiding: true,
              Cell: ({ row }) => {
                const v = row.getValue<string | null>("startedAt");
                if (!v) return "";
                return moment(v).format("MMM Do, YYYY, hh:mm A");
              },
            },
            {
              header: "Completed At",
              accessorKey: "completedAt",
              size: 120,
              enableSorting: false,
              visibleInShowHideMenu: true,
              enableHiding: true,
              Cell: ({ row }) => {
                const v = row.getValue<string | null>("completedAt");
                if (!v) return "";
                return moment(v).format("MMM Do, YYYY, hh:mm A");
              },
            },
            {
              header: "Payload",
              accessorKey: "payload",
              size: 120,
              visibleInShowHideMenu: true,
              enableHiding: true,
              enableSorting: false,
            },
            {
              header: "Status",
              id: "status",
              size: 120,
              enableSorting: false,
              visibleInShowHideMenu: false,
              enableHiding: false,
              enablePinning: true,
              Cell: ({ row }) => {
                const v = row.getValue<string | null>("completedAt");
                if (!v) return "Running";
                return "Completed";
              },
            },
            {
              header: "Actions",
              id: "actions",
              size: 120,
              enableSorting: false,
              visibleInShowHideMenu: false,
              enableHiding: false,
              enablePinning: true,
              accessorFn: (row: CronLogsResponseData) => (
                <Box
                  role="group"
                  aria-label="Action buttons"
                  sx={{ display: "flex", gap: "10px" }}
                >
                  {row.logId ? (
                    <ActionIconButton
                      label="View Log Details"
                      colorType="primary"
                      as={Link}
                      icon={<VisibilityIcon />}
                      onClick={() => handleViewLog(row.logId!)}
                    />
                  ) : (
                    <ActionIconButton
                      label="No Log Found"
                      colorType="error"
                      icon={<VisibilityIcon />}
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
