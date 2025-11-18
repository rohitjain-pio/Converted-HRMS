import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  BRANCH_LOCATION_LABEL,
  EMPLOYEE_STATUS_LABEL,
  permissionValue,
} from "@/utils/constants";
import { Box } from "@mui/material";
import moment from "moment";
import { EmployeeType } from "@/services/Employees";
import { hasPermission } from "@/utils/hasPermission";
export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  handleRedirect: (id: number) => void;
  handleViewEmployee: (id: number) => void;
};

export const useTableColumns = ({
  pagination,
  handleRedirect,
  handleViewEmployee,
}: UseTableColumnsProps) => {
  const { EMPLOYEES } = permissionValue;
  const columns = useMemo<MRT_ColumnDef<EmployeeType>[]>(
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
        header: "DOJ",
        id: "joiningDate",
        accessorFn: (row) =>
          moment(row.joiningDate, "YYYY-MM-DD").format("MMM Do, YYYY"),
        size: 150,
      },
      {
        header: "Branch",
        id: "branch",
        accessorFn: (row) => BRANCH_LOCATION_LABEL[row.branch],
        size: 150,
      },
      {
        header: "Country",
        accessorKey: "country",
        size: 120,
      },
      {
        header: "Department",
        accessorKey: "departmentName",
        size: 150,
      },
      {
        header: "Designation",
        accessorKey: "designation",
        size: 150,
      },
      {
        header: "Mobile No",
        accessorKey: "phone",
        size: 150,
        enableSorting: false,
      },
      {
        header: "Employee Status",
        id: "status",
        accessorFn: (row) => EMPLOYEE_STATUS_LABEL[row.employeeStatus],
        size: 150,
      },
      ...(hasPermission(EMPLOYEES.EDIT) || hasPermission(EMPLOYEES.VIEW)
        ? [
            {
              header: "Actions",
              id: "actions",
              size: 120,
              enableSorting: false,
              visibleInShowHideMenu: false,
              enableHiding: false,
              enablePinning: true,
              accessorFn: (row: EmployeeType) => (
                <Box
                  role="group"
                  aria-label="Action buttons"
                  sx={{ display: "flex", gap: "10px" }}
                >
                  {hasPermission(EMPLOYEES.VIEW) && (
                    <ActionIconButton
                      label="View Employee Details"
                      colorType="primary"
                      as={Link}
                      icon={<VisibilityIcon />}
                      onClick={() => handleViewEmployee(row.id)}
                    />
                  )}
                  {hasPermission(EMPLOYEES.EDIT) && (
                    <ActionIconButton
                      label="Edit Employee"
                      colorType="primary"
                      as={Link}
                      icon={<EditIcon />}
                      onClick={() => handleRedirect(row.id)}
                    />
                  )}
                </Box>
              ),
            },
          ]
        : []),
    ],
    [pagination]
  );

  return columns;
};
