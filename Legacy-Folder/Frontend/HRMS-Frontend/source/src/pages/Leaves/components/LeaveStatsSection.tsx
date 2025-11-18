import { Box, Grid, Stack, Typography } from "@mui/material";


export type LeaveStats = {
  openingBalance: number;
  creditedBalance: number;
  leavesTaken: number;
  closingBalance: number;
};

type LeaveStatsSectionProps = {
  stats: LeaveStats;
};

const LeaveStatsSection = ({ stats }: LeaveStatsSectionProps) => {
  const { openingBalance, closingBalance, leavesTaken } = stats;
  const creditedBalance = (closingBalance + leavesTaken) - openingBalance;

  const displayStats = [
    { key: "openingBalance", label: "Opening Balance", value: openingBalance },
    { key: "creditedBalance", label: "Credited Balance", value: creditedBalance },
    { key: "leavesTaken", label: "Leaves Taken", value: leavesTaken },
    { key: "closingBalance", label: "Closing Balance", value: closingBalance },
  ];

  return (
    <Box width="100%" sx={(theme) => ({ bgcolor: theme.palette.grey[100] })}>
      <Grid container>
        { displayStats .map(({ key, label,value }) => (
          <Grid item xs={12} sm={6} md={3} key={key} p={"10px"}>
            <Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ textTransform: "uppercase", color: "GrayText" }}
              >
                {label}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LeaveStatsSection;
