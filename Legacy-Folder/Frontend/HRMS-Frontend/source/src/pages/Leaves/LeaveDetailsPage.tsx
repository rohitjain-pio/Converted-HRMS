import { useParams } from "react-router-dom";
import BreadCrumbs from "@/components/@extended/Router";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import useAsync from "@/hooks/useAsync";
import {
  getLeaveRequestDetails,
  GetLeaveRequestDetailsResponse,
} from "@/services/EmployeeLeave";
import methods from "@/utils";
import { useMemo } from "react";
import { DAY_SLOT_LABELS, LEAVE_STATUS_LABEL } from "@/utils/constants";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { formatDate } from "@/utils/formatDate";


function formatDays(value: number) {
  const label = value === 1 || value === 0.5 ? "Day" : "Days";
  return `${value} ${label}`;
}

const LeaveDetailsPage = () => {
  const { requestId } = useParams<{ requestId: string }>();

  const { data, isLoading } = useAsync<GetLeaveRequestDetailsResponse>({
    requestFn: async (): Promise<GetLeaveRequestDetailsResponse> => {
      return await getLeaveRequestDetails(requestId ? Number(requestId) : 0);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  // const { data: holidayList ,isLoading:holidayLoading} =
  //   useAsync<GetHolidayResponse>({
  //     requestFn: async (): Promise<GetHolidayResponse> => {
  //       return await getHolidayList();
  //     },
  //     autoExecute: true,
  //     onError: (err) => {
  //       methods.throwApiError(err);
  //     },
  //   });

  const details = useMemo(() => {
    if (!data) {
      return null;
    }
    const details = data.result;
    
    // const totalLeaveDays = calculateLeaveDays(
    //       moment(startDate),
    //       Number(startDateSlot),
    //       moment(endDate),
    //       Number(endDateSlot),
    //       holidayList?.result.india
    //     );

    return [
      { label: "Leave Type", value: details.title },
      { label: "Approval Status", value: LEAVE_STATUS_LABEL[details.status] },
      { label: "Start Date", value: formatDate(details.startDate) },
      { label: "Slot", value: DAY_SLOT_LABELS[details.startDateSlot] },
      { label: "End Date", value: formatDate(details.endDate) },
      { label: "Slot", value: DAY_SLOT_LABELS[details.endDateSlot] },
      { label: "Total Leave Days", value: formatDays(details.totalLeaveDays) },
      { label: "Reason", value: details.reason },
      ...(details.rejectReason
        ? [{ label: "Rejection Reason", value: details.rejectReason }]
        : []),
    ];
  }, [data]);

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title={"Leave Request Details"}
          goBack={true}
        />
        <Box padding="30px">
          {!details ? (
            <Typography textAlign="center">No Data Found</Typography>
          ) : (
         <Stack gap={5}>
              <Grid container spacing={2}>
                {details.map(({ label, value }, index) => (
                  <Grid
                    key={index}
                    item
                    xs={6}
                    display="flex"
                    flexDirection="row"
                    gap="5px"
                    alignItems="center"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >{`${label}:`}</Typography>
                    <TruncatedText
                      text={value}
                      tooltipTitle={value}
                      maxLength={20}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Box>
      </Paper>
      <GlobalLoader loading={isLoading} />
    </>
  );
};

export default LeaveDetailsPage;
