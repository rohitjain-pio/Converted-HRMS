import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  darken,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import { useUserStore } from "@/store";
import methods from "@/utils";
import { useState } from "react";
import {
  GetLeaveBalancesResponse,
  LeaveBalanceItem,
} from "@/services/LeaveManagment";
import { getLeaveBalances } from "@/services/LeaveManagment/leaveManagmentService";

const LeaveTypeCardGrid = () => {
  const { userData } = useUserStore();
  const [leaveTypes, setLeaveTypes] = useState<LeaveBalanceItem[]>([]);

  const { isLoading } = useAsync<GetLeaveBalancesResponse>({
    requestFn: async (): Promise<GetLeaveBalancesResponse> => {
      return await getLeaveBalances(Number(userData.userId));
    },
    onSuccess: ({ data }) => {
      setLeaveTypes(data.result.data);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const navigate = useNavigate();

  return (
    <Grid container spacing={2.5}>
      {isLoading ? (
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Grid>
      ) : !leaveTypes.length ? (
        <Grid size={{ xs: 12 }} textAlign="center">
          No Data Found
        </Grid>
      ) : (
        leaveTypes.map(({ leaveId, title, closingBalance }) => {
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
              <Card
                sx={(theme) => ({
                  border: "1px solid",
                  borderColor: theme.palette.grey[300],
                  borderRadius: 2,
                })}
              >
                <CardActionArea
                  onClick={() => navigate(`/leave/apply-leave/add/${leaveId}`)}
                >
                  <CardContent
                    sx={{ justifyItems: "center", textAlign: "center" }}
                  >
                    <Box
                      sx={{
                        width: "66px",
                        height: "66px",
                        borderRadius: "50%",
                        backgroundColor: "#27A8E0",
                        border: `2px solid ${darken("#27A8E0", 0.2)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "auto",
                      }}
                    >
                      <Typography variant="h3" color="white" textAlign="center">
                        {closingBalance}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#1E75BB", mt: "10px", textAlign: "center" }}
                    >
                      {title}
                    </Typography>
                    <Box>
                      <Typography variant="caption">Closing Balance</Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })
      )}
    </Grid>
  );
};

export default LeaveTypeCardGrid;
