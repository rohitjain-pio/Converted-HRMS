import { useMemo } from "react";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DeveloperLogsResponseData } from "@/services/Developer/types";
import moment from "moment";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { truncate } from "@/utils/helpers";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  handleViewLog: (row: DeveloperLogsResponseData) => void
};

export const useTableColumns = ({ pagination,handleViewLog }: UseTableColumnsProps) => {

  const columns = useMemo<MRT_ColumnDef<DeveloperLogsResponseData>[]>(
    () => [
       {
        header: "Id",
        accessorKey: "id",
        size: 50,
        visibleInShowHideMenu: true,
        enableHiding: true,
      },
      {
        header: "Level",
        accessorKey: "level",
        size: 100,
        visibleInShowHideMenu: true,
        enableHiding: true,
      },
      {
        header: "Message",
        accessorKey: "message",
        size: 200,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
      {
        header: "Request Id",
        accessorKey: "requestId",
        size: 150,
        enableSorting: false,
        visibleInShowHideMenu: true,
        enableHiding: true,
      },
      {
        header: "Timestamp",
        accessorKey: "timeStamp",
        size: 120,
        visibleInShowHideMenu: true,
        enableHiding: true,
        Cell: ({ row }) => {
          const v = row.getValue<string | null>("timeStamp");
          if (!v) return "";
          return moment(v).format("MMM Do, YYYY, hh:mm A");
        },
      },
      {
        header: "Exception",
        accessorKey: "exception",
        size: 150,
        enableSorting: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
        Cell: ({ row }) => {
          const v = row.getValue<string | null>("exception");
          return truncate(v ?? "", { maxLength: 100 });
        },
      },
      {
        header: "Log Event",
        accessorKey: "logEvent",
        size: 150,
        enableSorting: false,
        visibleInShowHideMenu: true,
        enableHiding: true,
        Cell: ({ row }) => {
          const v = row.getValue<string | null>("logEvent");
          return truncate(v ?? "", { maxLength: 100 });
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
        accessorFn: (row: DeveloperLogsResponseData) => (
          <Box
            role="group"
            aria-label="Action buttons"
            sx={{ display: "flex", gap: "10px" }}
          >
            <ActionIconButton
              label="View Log Details"
              colorType="primary"
              as={Link}
              icon={<VisibilityIcon />}
              onClick={() => handleViewLog(row)}
            />
          </Box>
        ),
      },
    ],
    [pagination]
  );

  return columns;
};
