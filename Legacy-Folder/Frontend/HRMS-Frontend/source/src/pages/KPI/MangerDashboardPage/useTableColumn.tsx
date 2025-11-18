import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { employeesGoalList } from "@/services/KPI";
import { hasPermission } from "@/utils/hasPermission";
import { KPI_STATUS_LABEL, permissionValue } from "@/utils/constants";
import moment from "moment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/material";

import TaskAltIcon from "@mui/icons-material/TaskAlt";

export type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
  getKpiStatus: (row: employeesGoalList) => 1 | 2 | 3 | 4;
  handleActionClick: (row: employeesGoalList, flag?: boolean) => void;
};

export const useTableColumns = ({
  pagination,
  getKpiStatus,
  handleActionClick,
}: UseTableColumnsProps) => {
  const { KPI } = permissionValue;
  const columns = useMemo<MRT_ColumnDef<employeesGoalList>[]>(
    () => [
      {
        header: "Employee Code",
        accessorKey: "employeeCode",
        size: 100,
      },
      {
        header: "Employee Name",
        accessorKey: "employeeName",
        size: 150,
      },
      {
        header: "Joining Date",
        accessorKey: "joiningDate",
       accessorFn:(row:employeesGoalList)=>moment(row.joiningDate).format("MMM Do, YYYY"),
        size: 150,
      },
      {
        header: "Last Review Date",
        accessorKey: "lastAppraisal",
        accessorFn: (row: employeesGoalList) =>
          row.lastReviewDate
            ? moment(row.lastReviewDate).format("MMM Do, YYYY")
            : "N/A",
        size: 150,
      },
      {
        header: "Next Review Date",
        accessorKey: "nextAppraisal",
        accessorFn: (row: employeesGoalList) => {
          const joiningDate = moment(row.joiningDate);
          const currentYear = moment().year();
          if (row.lastReviewDate) {
            const appraisalDate = moment(row.lastReviewDate).add(1, "year");
            return appraisalDate.format("MMM Do, YYYY");
          }
          const monthDate = joiningDate.format("MMM Do");
          const joiningYear = joiningDate.year();
          const yearToUse =
            joiningYear < currentYear - 1 ? joiningYear + 1 : currentYear + 1;
          return `${monthDate} ${yearToUse}`;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableSorting: false,
        accessorFn: (row: employeesGoalList) =>
          KPI_STATUS_LABEL[getKpiStatus(row)],
        size: 150,
      },
      ...(hasPermission(KPI.CREATE) || hasPermission(KPI.VIEW)
        ? [
            {
              header: "Actions",
              id: "actions",
              size: 120,
              enableSorting: false,
              visibleInShowHideMenu: false,
              enableHiding: false,
              Cell: ({ row }: { row: { original: employeesGoalList } }) => {
                const { planId, isReviewed } = row.original;

                const showView = !!planId && hasPermission(KPI.VIEW);
                const showAssign = !planId && hasPermission(KPI.CREATE);

                if (!showView && !showAssign) return null;

                const label = showView
                  ? isReviewed
                    ? "View Completed KPI"
                    : "View KPI Details"
                  : "Assign New KPI";

                const icon = showView ? (
                  isReviewed ? (
                    <TaskAltIcon />
                  ) : (
                    <VisibilityIcon />
                  )
                ) : (
                  <AddIcon />
                );

                return (
                  <Box
                    aria-label="Action buttons"
                    sx={{ display: "flex", gap: "20px" }}
                  >
                    <ActionIconButton
                      label={label}
                      colorType="primary"
                      icon={icon}
                      onClick={() => handleActionClick(row.original)}
                    />

                    {row.original.isReviewed && (
                      <ActionIconButton
                        label="Create New KPI"
                        colorType="primary"
                        icon={<AddIcon />}
                        onClick={() => handleActionClick(row.original, true)}
                      />
                    )}
                  </Box>
                );
              },
            },
          ]
        : []),
    ],
    [pagination]
  );

  return columns;
};
