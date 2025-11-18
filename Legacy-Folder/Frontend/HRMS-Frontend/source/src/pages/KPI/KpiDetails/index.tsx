import { Box, Paper, Typography } from "@mui/material";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { MRT_Column, MRT_Row } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import KPIEditDialog from "@/pages/KPI/KPIEditDialog";
import ManagerKPIEditDialog from "@/pages/KPI/Components/ManagerKPIEditDialog";

import moment from "moment";
import {
  GetEmployeeRatingByManager,
  getEmployeeRatingByManager,
  GetEmployeeRatingByManagerResponse,
  GoalRating,
  PlanRating,
  submitManagerPlan,
  SubmitManagerReviewResponse,
} from "@/services/KPI";
import useAsync from "@/hooks/useAsync";
import { useParams } from "react-router-dom";
import methods from "@/utils";
import AssignGoalDialog from "@/pages/KPI/Components/AssignGoalDialog";
import Grid from "@mui/material/Grid2";
import { toast } from "react-toastify";
import { useTableColumns } from "@/pages/KPI/KpiDetails/useTableColumn";
import KpiDetailsTable from "@/pages/KPI/KpiDetails/KpiDetialsTable";
import {
  CellPosition,
  AssignedCell,
  SelectedCell,
} from "@/pages/KPI/KpiDetails/type";
import { canManagerSubmitRatings } from "@/pages/KPI/utils";
import { KpiRatingHistoryDialog } from "./KpiRatingHistoryTable";
import KpiRatingConfirmDialog from "./KpiConfiramtionDialog";

export type CellAction = "view" | "edit" | "add";

const KpiDetails = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [goalId, setSelectedGoalId] = useState<number>();
  const [dialogType, setDialogType] = useState<"view" | "edit" | null>(null);
  const [openAssignGoalDialog, setAssignGoalOpenDialog] = useState(false);
  const [openRatingHistoryDialog, setOpenRatingHistoryDialog] = useState(false);
  const [openConfirmSubmit, setOpenConfirmSubmit] = useState(false);
  const { employeeId } = useParams();
  const [hoveredCell, setHoveredCell] = useState<CellPosition>(null);
  const [activeCell, setActiveCell] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);
  const [assignedSelectedCell, setAssignedCell] = useState<AssignedCell>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const handleOpenDialog = (goalId: number) => {
    setSelectedGoalId(goalId);
    setOpenRatingHistoryDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenRatingHistoryDialog(false);
  };
  const handleConfirmSubmissionDialog = () => {
    submitPlan(Number(goalRating?.planId));
    
  };
  
  const [goalRating, setGoalRating] = useState<PlanRating>();
  const [goalRatingData, setGoalRatingDAta] =
    useState<GetEmployeeRatingByManager>();
  const [planOption, setPlanOption] = useState<
    { value: number; label: string }[]
  >([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");

  const { data, execute: fetchEmployeeRating } = useAsync<
    GetEmployeeRatingByManagerResponse,
    number
  >({
    requestFn: async () => await getEmployeeRatingByManager(Number(employeeId)),
    onSuccess: ({ data }) => {
      setGoalRatingDAta(data.result[0]);
    },
    onError(error) {
      methods.throwApiError(error);
    },
    autoExecute: true,
  });
  useEffect(() => {
    if (!selectedPlanId) return;

    const selectedPlan = goalRatingData?.ratings?.find(
      (plan) => plan.planId === selectedPlanId
    );
    setGoalRating(selectedPlan);
  }, [selectedPlanId, goalRatingData]);

  useEffect(() => {
    if (!goalRatingData?.ratings?.length) return;

    const response =
      goalRatingData.ratings?.map((plan, index) => ({
        value: plan.planId,
        label:
          index === 0
            ? "KPI Current"
            : `KPI Review Date: ${moment(plan.reviewDate, "YYYY-MM-DD").format("MMM Do, YYYY") ?? "No Review Date"}`,
      })) || [];

    setPlanOption(response);
    setSelectedPlanId(response[0]?.value ?? "");
  }, [goalRatingData]);

  const handleTableCellMouseEnter =
    (row: MRT_Row<GoalRating>, column: MRT_Column<GoalRating, unknown>) =>
    () => {
      setHoveredCell({
        rowIndex: row.index,
        columnIndex: column.getIndex(),
      });
    };
  const handleTableCellMouseLeave = () => {
    setHoveredCell(null);
  };
  const displayDate = useMemo(() => {
    if (!data) {
      return null;
    }

    const joiningDate = moment(goalRatingData?.joiningDate);
    if (!joiningDate.isValid()) {
      return null;
    }

    const currentYear = moment().year();

    let displayDate: string | null = null;

    if (goalRating?.reviewDate) {
      const appraisalDate = moment(goalRating?.reviewDate).add(1, "year");

      displayDate = appraisalDate.format("MMM Do, YYYY");
    } else {
      const monthDate = joiningDate.format("MMM Do");
      const joiningYear = joiningDate.year();

      const yearToUse =
        joiningYear < currentYear - 1 ? joiningYear + 1 : currentYear + 1;

      displayDate = `${monthDate} ${yearToUse}`;
    }

    return displayDate;
  }, [data]);
  const { execute: submitPlan, isLoading: submittingPlan } = useAsync<
    SubmitManagerReviewResponse,
    number
  >({
    requestFn: async (planId: number): Promise<SubmitManagerReviewResponse> => {
      return await submitManagerPlan(planId);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      fetchEmployeeRating();
      setOpenConfirmSubmit(false);
    },
    onError: (err) => {
      methods.throwApiError(err);
      setOpenConfirmSubmit(false);
    },
  });
  const columns = useTableColumns({
    activeCell,
    data: goalRatingData,
    handleTableCellMouseEnter,
    hoveredCell,
    setActiveCell,
    setAssignGoalOpenDialog,
    setAssignedCell,
    handleOpenDialog,
    goalData: goalRating,
    setSelectedCell,
    setDialogType,
    setOpenDialog,
    handleTableCellMouseLeave,
  });
  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="KPI Details" />
        <Box padding="20px">
          <Grid container sx={{ mb: 3 }} spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Employee Name
              </Typography>
              <Typography variant="body1">
                {goalRatingData?.employeeName}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Employee Email
              </Typography>
              <Typography variant="body1">{goalRatingData?.email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Last Review
              </Typography>
              <Typography variant="body1">
                {goalRating?.lastAppraisal
                  ? moment(goalRating?.lastAppraisal, "YYYY-MM-DD").format(
                      "MMM Do, YYYY"
                    )
                  : "N/A"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Next Review
              </Typography>
              <Typography variant="body1">{displayDate}</Typography>
            </Grid>
          </Grid>
          <KpiDetailsTable
            columns={columns}
            data={goalRatingData}
            setOpenConfirmationDialog={setOpenConfirmSubmit}
            goalRating={goalRating?.goals ?? []}
            planId={String(goalRating?.planId)}
            goalData={goalRating}
            planOptions={planOption}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            setAssignedCell={setAssignedCell}
            setAssignGoalOpenDialog={setAssignGoalOpenDialog}
            canSubmitRatings={canManagerSubmitRatings}
            submitPlan={submitPlan}
            submittingPlan={submittingPlan}
          />
        </Box>
      </Paper>
      {!!selectedCell && goalRating?.planId && (
        <KPIEditDialog
          open={!!selectedCell && dialogType != "edit"}
          onClose={() => {
            setSelectedCell(null);
          }}
          data={{ ...selectedCell, planId: Number(goalRating?.planId) }}
          action={"view"}
        />
      )}
      {openDialog && selectedCell && (
        <ManagerKPIEditDialog
          open={openDialog && dialogType == "edit"}
          onClose={() => {
            setOpenDialog(false);
          }}
          data={{ ...selectedCell, planId: Number(goalRating?.planId) }}
          editable={selectedCell.isEditable}
          fetchEmployeeRating={fetchEmployeeRating}
        />
      )}
      <AssignGoalDialog
        open={openAssignGoalDialog}
        onClose={() => setAssignGoalOpenDialog(false)}
        data={assignedSelectedCell}
        fetchData={fetchEmployeeRating}
      />
      {goalId&&
      <KpiRatingHistoryDialog
        open={openRatingHistoryDialog}
        onClose={handleCloseDialog}
        planId={Number(goalRating?.planId)}
        goalId={Number(goalId)}
      />}
      <KpiRatingConfirmDialog
        onClose={() => setOpenConfirmSubmit(false)}
        open={openConfirmSubmit}
        loading={submittingPlan}
        onConfirm={handleConfirmSubmissionDialog}
      />
    </>
  );
};

export default KpiDetails;
