import React from "react";
import {
  useMaterialReactTable,
  MaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { Box, Stack, Button, useTheme, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { GetEmployeeSelfRatingResponse, GoalRating } from "@/services/KPI";
import { getManagerRatingSummary } from "../utils";

interface KpiDetailsTableProps {
  columns: MRT_ColumnDef<GoalRating, unknown>[];
  goalRatingData: GoalRating[];
  data: GetEmployeeSelfRatingResponse | null;
  planId: number | null;
  submittingPlan: boolean;
  canSubmitRatings: (ratings: GoalRating[]) => boolean;
  submitPlan: (planId: number) => void;
}

const EmployeeKpiTable: React.FC<KpiDetailsTableProps> = ({
  columns,
  goalRatingData,
  data,
  planId,
  submittingPlan,
  canSubmitRatings,
  submitPlan,
}) => {
  const theme = useTheme();

  const table = useMaterialReactTable({
    columns,
    data: goalRatingData,
    displayColumnDefOptions: {
      "mrt-row-numbers": {
        Header: "S.No",
        header: "S.No",
        size: 80,
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
            {goalRatingData.length > 0 && planId && (
              <Button
                sx={{
                  "&.Mui-disabled": {
                    backgroundColor: theme.palette.grey[400],
                    color: theme.palette.common.white,
                    opacity: 1,
                    cursor: "not-allowed",
                  },
                }}
                disabled={data?.result[0]?.isReviewed != null}
                variant="contained"
                onClick={() => {
                  if (!canSubmitRatings(goalRatingData)) {
                    toast.error(
                      "Please fill ratings for all the required quarters"
                    );
                    return;
                  }
                  submitPlan(Number(planId));
                }}
                loading={submittingPlan}
              >
                {data?.result[0]?.isReviewed === null
                  ? "Send for Review"
                  : data?.result[0]?.isReviewed === false
                    ? "Review in Progress"
                    : "Review Completed"}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    ),

    renderBottomToolbar: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          // padding: "1rem",
        }}
      >
        <Box
          padding="16px 16px"
          paddingRight="16px"
          borderRadius="16px"
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
        >
          {getManagerRatingSummary(goalRatingData) !== null && data?.result[0].isReviewed==true && (
            <>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ marginRight: "8px" }}
              >
                Yearly Progress (%):
              </Typography>
              <Typography variant="h6" color="textPrimary" fontWeight="bold">
                {getManagerRatingSummary(goalRatingData)}%
              </Typography>
            </>
          ) }
        </Box>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default EmployeeKpiTable;
