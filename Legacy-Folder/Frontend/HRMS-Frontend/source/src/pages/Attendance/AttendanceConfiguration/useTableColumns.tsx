import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import {  useNavigate } from "react-router-dom";
import { BRANCH_LOCATION_LABEL, permissionValue } from "@/utils/constants";
import {  Stack, Switch, Tooltip, Typography } from "@mui/material";
import moment from "moment";
import { AttendanceConfigResponse } from "@/pages/Attendance/types";
import { hasPermission } from "@/utils/hasPermission";
import EditIcon from "@mui/icons-material/Edit";

 type UseTableColumnsProps= {
  pagination: MRT_PaginationState;
  handleManualToggle: (employeeId: number) => void
}
export const useTableColumns = ({ pagination ,handleManualToggle}: UseTableColumnsProps) => {
    const navigate=useNavigate()
      const { EMPLOYEES } = permissionValue;
    
  const columns = useMemo<MRT_ColumnDef<AttendanceConfigResponse>[]>(
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
        size: 200,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
      {
        header: "Attendance Method",
        accessorKey: "isManualAttendance",
        size: 150,
        visibleInShowHideMenu: false,
        enableHiding: false,
        Cell: ({ row }) => (
          <Tooltip
            title={
              !row.original.isManualAttendance && !row.original.timeDoctorUserId
                ? "Time Doctor user ID not found"
                : ""
            }
          >
            <Typography
              color={
                !row.original.isManualAttendance &&
                !row.original.timeDoctorUserId
                  ? "error"
                  : "textPrimary"
              }
            >
              {row.original.isManualAttendance ? "Manual" : "Time Doctor"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        header: "Department",
        accessorKey: "department",
        size: 150,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        size: 150,
      },
      {
        header: "Branch",
        accessorFn: (row) => BRANCH_LOCATION_LABEL[row.branch],
        size: 150,
      },
      {
        header: "DOJ",
        id: "joiningDate",
        accessorFn: (row) =>
          row.joiningDate
            ? moment(row.joiningDate, "YYYY-MM-DD").format("MMM Do, YYYY")
            : "",
        size: 150,
      },
      {
        header: "Country",
        accessorKey: "country",
        size: 120,
      },
      {
        header: "Actions",
        id: "actions",
        size: 110,
        visibleInShowHideMenu: false,
        enableHiding: false,
        Cell: ({ row }) => (
          <Stack
            role="group"
            aria-label="Action buttons"
            direction="row"
            gap="10px"
          >
            <Tooltip
              title={
                row.original.isManualAttendance &&
                !row.original.timeDoctorUserId
                  ? "Time Doctor user ID is required to update the attendance method"
                  : ""
              }
            >
              <span>
                <Switch
                  checked={row.original.isManualAttendance}
                  onChange={() => handleManualToggle(row.original.employeeId)}
                  color={row.original.isManualAttendance ? "info" : "default"}
                  slotProps={{
                    input: { "aria-label": "controlled" },
                  }}
                  disabled={
                    row.original.isManualAttendance &&
                    !row.original.timeDoctorUserId
                  }
                />
              </span>
            </Tooltip>
            {hasPermission(EMPLOYEES.EDIT) && (
              <ActionIconButton
                label="Edit"
                colorType="primary"
                icon={<EditIcon />}
                onClick={() =>
                  navigate(
                    `/employment-details/edit/${row.original.employeeId}`,
                    {
                      state: { fromAttendanceConfig: true },
                    }
                  )
                }
              />
            )}
          </Stack>
        ),
      },
    ],
    [pagination]
  );

  return columns;
};
