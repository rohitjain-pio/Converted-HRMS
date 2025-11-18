import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import {
  MRT_Column,
  MRT_Row,
} from "material-react-table";
import { useMemo, useState } from "react";
import KPIEditDialog from "@/pages/KPI/KPIEditDialog";
import { Quarter } from "@/utils/constants";
import { useUserStore } from "@/store";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  getEmployeeSelfRating,
  GetEmployeeSelfRatingResponse,
  GoalRating,
  submitKPIPlan,
  SubmitKPIPlanResponse,
} from "@/services/KPI";
import { toast } from "react-toastify";
import moment from "moment";
import ManagerKPIEditDialog from "@/pages/KPI/Components/ManagerKPIEditDialog";
import Grid from "@mui/material/Grid2";
import { useTableColumns } from "@/pages/KPI/EmployeeKPI/useTableColumn";
import EmployeeKpiTable from "@/pages/KPI/EmployeeKPI/EmployeeKpiTable";
import { canEmployeeSubmitRatings } from "@/pages/KPI/utils";

export type CellAction = "view" | "edit" | "add";

const EmployeeKPI = () => {
  const { userData } = useUserStore();
  const [hoveredCell, setHoveredCell] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  const [goalRatingData, setGoalRatingData] = useState<GoalRating[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [cellAction, setCellAction] = useState<CellAction | null>(null);
  const [selectedManagerCell, setSelectedManagerCell] = useState<{
    goalId: number;
    goalTitle: string;
    managerRating: number;
    managerNote: string;
  } | null>(null);

  const [selectedQuarterCell, setSelectedQuarterCell] = useState<{
    quarter: Quarter;
    goalId: number;
    goalTitle: string;
    rating: number | null;
    note: string | null;
  } | null>(null);

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

  const { execute: fetchEmployeeSelfRating, data } =
    useAsync<GetEmployeeSelfRatingResponse>({
      requestFn: async (): Promise<GetEmployeeSelfRatingResponse> => {
        return await getEmployeeSelfRating({ employeeId: +userData.userId });
      },
      onSuccess: ({ data }) => {
        setGoalRatingData(data.result?.[0]?.ratings ?? []);
        setPlanId(data.result?.[0]?.planId ?? null);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: true,
    });

  const { execute: submitPlan, isLoading: submittingPlan } = useAsync<
    SubmitKPIPlanResponse,
    number
  >({
    requestFn: async (planId: number): Promise<SubmitKPIPlanResponse> => {
      return await submitKPIPlan(planId);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      fetchEmployeeSelfRating();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const displayDate = useMemo(() => {
    if (!data) {
      return null;
    }

    const joiningDate = moment(data?.result[0]?.joiningDate);
    if (!joiningDate.isValid()) {
      return null;
    }

    const currentYear = moment().year();

    let displayDate: string | null = null;

    if (data?.result[0]?.lastReviewDate) {
      const appraisalDate = moment(data?.result[0].lastReviewDate).add(1, "year");

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

  const columns = useTableColumns({
    data,
    handleTableCellMouseEnter,
    handleTableCellMouseLeave,
    setCellAction,
    hoveredCell,
    setSelectedManagerCell,
    setSelectedQuarterCell,
  });
  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="My KPI" />
        <Box padding="20px">
          <Grid container sx={{ mb: 3 }} spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Last Review
              </Typography>
              <Typography variant="body1">
                {data?.result[0]?.lastReviewDate
                  ? moment(data?.result[0].lastReviewDate, "YYYY-MM-DD").format(
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

          <EmployeeKpiTable
            columns={columns}
            goalRatingData={goalRatingData}
            data={data}
            planId={planId}
            submittingPlan={submittingPlan}
            canSubmitRatings={canEmployeeSubmitRatings}
            submitPlan={submitPlan}
          />
        </Box>
      </Paper>
      {!!selectedQuarterCell && planId && cellAction && (
        <KPIEditDialog
          open={!!selectedQuarterCell}
          onClose={() => {
            setSelectedQuarterCell(null);
            setCellAction(null);
          }}
          onSuccess={fetchEmployeeSelfRating}
          action={cellAction}
          data={{ ...selectedQuarterCell, planId }}
        />
      )}
      {!!selectedManagerCell && planId && cellAction && (
        <ManagerKPIEditDialog
          open={!!selectedManagerCell}
          onClose={() => {
            setSelectedManagerCell(null);
            setCellAction(null);
          }}
          editable={false}
          data={{
            ...selectedManagerCell,
            rating: selectedManagerCell.managerRating,
            note: selectedManagerCell.managerNote,
            planId,
          }}
        />
      )}
    </>
  );
};

export default EmployeeKPI;
