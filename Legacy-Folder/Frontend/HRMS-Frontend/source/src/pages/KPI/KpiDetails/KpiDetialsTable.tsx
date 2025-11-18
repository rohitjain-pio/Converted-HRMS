import React from "react";
import {
  useMaterialReactTable,
  MaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  Stack,
  Tooltip,
  IconButton,
  Button,
  useTheme,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import {
  GetEmployeeRatingByManager,
  GoalRating,
  PlanRating,
} from "@/services/KPI";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { AssignedCell } from "@/pages/KPI/KpiDetails/type";
import { canEmployeeSubmitRatings, getManagerRatingSummary } from "../utils";
import KpiPlansSelect from "./KpiPlansSelect";

interface GoalReviewTableProps {
  columns: MRT_ColumnDef<GoalRating, unknown>[];
  goalRating: GoalRating[];
  data: GetEmployeeRatingByManager | undefined;
  planId: string | undefined;
  goalData: PlanRating | undefined;
  submittingPlan: boolean;
  setAssignedCell: (cell: AssignedCell) => void;
  setAssignGoalOpenDialog: (open: boolean) => void;
  canSubmitRatings: (ratings: GoalRating[]) => boolean;
  submitPlan: (planId: number) => void;
  setOpenConfirmationDialog: (open: boolean) => void;
  planOptions: {
    value: number;
    label: string;
  }[];
  setSelectedPlanId: React.Dispatch<React.SetStateAction<number | "">>;
  selectedPlanId: number | "";
}

const KpiDetailsTable: React.FC<GoalReviewTableProps> = ({
  columns,
  goalRating,
  data,
  goalData,
  setAssignedCell,
  setAssignGoalOpenDialog,
  canSubmitRatings,
  setOpenConfirmationDialog,
 
  planOptions,
  selectedPlanId,
  setSelectedPlanId,
}) => {
  const { KPI } = permissionValue;
  const theme = useTheme();

  const table = useMaterialReactTable({
    columns,
    data: goalRating,
    displayColumnDefOptions: {
      "mrt-row-numbers": {
        Header: "S.No",
        header: "S.No",
        size: 10,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enablePagination: false,
    enableSorting: false,
    enableFilters: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableRowNumbers: true,
    enableHiding: false,
    autoResetPageIndex: false,
    muiTableHeadRowProps: {
      sx: {
        bgcolor: "#1E75BB",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        color: theme.palette.primary.contrastText,
        textTransform: "inherit",
        "& .Mui-TableHeadCell-Content-Labels": {
          "& .MuiTableSortLabel-icon": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
          "& :hover": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
          "& .Mui-active": {
            color: `${theme.palette.primary.contrastText} !important`,
          },
        },
      },
    },
    renderTopToolbarCustomActions: () => (
      <Box flex={1}>
        <Stack direction="row" flex={1} alignItems="center">
          <Stack flex={1} direction="row">
            {hasPermission(KPI.CREATE) && goalData?.isReviewed === null && (
              <Tooltip title="Assign Goal">
                <IconButton
                  onClick={() => {
                    setAssignedCell({
                      goalId: 0,
                      target: "",
                      isDisabled: false,
                      employeeId: Number(data?.employeeId),
                      employeeEmail: data?.email,
                      plainId: Number(goalData?.planId),
                      employeeName: String(data?.employeeName),
                    });
                    setAssignGoalOpenDialog(true);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Box sx={{ minWidth: 200 }}>
              <KpiPlansSelect
                planOptions={planOptions}
                setSelectedPlanId={setSelectedPlanId}
                selectedPlanId={selectedPlanId}
              />
            </Box>
          </Stack>
        </Stack>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "inherit",
          padding: "1rem",

          bgcolor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Button
            sx={{
              "&.Mui-disabled": {
                backgroundColor: theme.palette.grey[400],
                color: theme.palette.common.white,
                opacity: 1,
                cursor: "not-allowed",
              },
            }}
            variant="contained"
            disabled={Boolean(goalData?.isReviewed)}
            onClick={() => {
              if (!canSubmitRatings(goalRating)) {
                toast.error("Please fill ratings for all the required Goals.");
                return;
              }
              if (!canEmployeeSubmitRatings(goalRating)) {
                toast.error(
                  "Please wait until the employee has completed ratings for all required goals."
                );
                return;
              }
              setOpenConfirmationDialog(true);
            }}
          >
            {goalData?.isReviewed ? "Review Submitted" : "Submit Review"}
          </Button>
        </Box>

        <Box
          padding="8px 16px"
          borderRadius="8px"
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
        >
          {getManagerRatingSummary(goalRating) !== null ? (
            <>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ marginRight: "8px" }}
              >
                Yearly Progress (%):
              </Typography>
              <Typography variant="h6" color="textPrimary" fontWeight="bold">
                {getManagerRatingSummary(goalRating)}%
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Review not submitted
            </Typography>
          )}
        </Box>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default KpiDetailsTable;
