import { useMemo } from "react";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { formatDate } from "@/utils/formatDate";
import {
  permissionValue,
} from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { AttendanceRow } from "@/pages/Attendance/types";
import { getDateStatus } from "@/pages/Attendance/Employee/useAttendanceDialogs";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  isManualAttendance: boolean
  handleEditClick: (row: AttendanceRow) => void
};

export const useTableColumns = ({ pagination,isManualAttendance ,handleEditClick}: UseTableColumnsProps) => {

  const columns = useMemo<MRT_ColumnDef<AttendanceRow>[]>(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        size: 120,
        enableSorting: false,

        Cell: ({ row }) => formatDate(row.original.date),
      },
      {
        header: "Start Time",
        accessorKey: "startTime",
        size: 90,
        enableSorting: false,
      },
      {
        header: "End Time",
        accessorKey: "endTime",
        size: 90,
        enableSorting: false,
      },
      { header: "Day", accessorKey: "day", size: 100, enableSorting: false },
      {
        header: "Attendance Type",
        accessorKey: "attendanceType",
        size: 120,
        enableSorting: false,
      },
      {
        header: "Total Hours",
        accessorKey: "totalHours",
        size: 100,
        enableSorting: false,

        Cell: ({ row }) => {
          if (row.original.totalHours && row.original.totalHours !== "") {
            const [h, m] = row.original.totalHours.split(":");
            return `${parseInt(h, 10)}:${m}`;
          }
          return "";
        },
      },
      {
        header: "Actions",
        id: "actions",
        size: 100,
        enableSorting: false,

        visibleInShowHideMenu: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip
              title={
                <Box sx={{ minWidth: 140 }}>
                  <Typography variant="body2">Audit Trail:</Typography>
                  <Box
                    sx={{
                      overflowY: "auto",
                      maxHeight: "140px",
                      scrollbarWidth: "thin",
                      overflowX: "auto",
                    }}
                  >
                    {row.original.audit.map((item, idx: number) => (
                      <Box key={idx}>
                        <b>{item.action}</b> at - {item.time.slice(0, 5)}
                        {item.comment && (
                          <>
                            <br />
                            <span>Note:</span>
                            <span style={{ color: "gray" }}>
                              — {item.comment}
                            </span>
                          </>
                        )}
                        {item.reason && (
                          <>
                            <br />
                            <span>Reason For Past entry:</span>
                            <span style={{ color: "gray" }}>
                              — {item.reason}
                            </span>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              }
              placement="top"
            >
              <IconButton size="medium" aria-label="View Audit Trail">
                <VisibilityIcon
                  sx={{ color: "rgb(30, 117, 187)" }}
                  fontSize="medium"
                />
              </IconButton>
            </Tooltip>
            {getDateStatus(row.original.date) !== "today" &&
              hasPermission(permissionValue.Attendance_Details.EDIT) &&
              isManualAttendance && (
                <ActionIconButton
                  label="Edit Attendance"
                  colorType="primary"
                  onClick={() => handleEditClick(row.original)}
                  icon={<EditIcon />}
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
