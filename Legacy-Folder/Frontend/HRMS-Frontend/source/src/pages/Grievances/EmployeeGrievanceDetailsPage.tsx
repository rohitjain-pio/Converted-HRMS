import { useParams } from "react-router-dom";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  getEmployeeGrievanceDetail,
  GetEmployeeGrievanceDetailResponse,
} from "@/services/Grievances";
import { Box, Paper, Typography } from "@mui/material";
import { useMemo } from "react";
import GrievanceStatusChip from "@/pages/Grievances/components/GrievanceStatusChip";
import moment from "moment";
import Grid from "@mui/material/Grid2";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";

const EmployeeGrievanceDetailsPage = () => {
  const { grievanceId } = useParams<{ grievanceId: string }>();

  const { data } = useAsync<GetEmployeeGrievanceDetailResponse>({
    requestFn: async (): Promise<GetEmployeeGrievanceDetailResponse> => {
      return await getEmployeeGrievanceDetail(Number(grievanceId ?? 0));
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const grievanceDetails = useMemo(() => {
    if (!data?.result) {
      return null;
    }

    const details = data.result;

    return [
      { label: "Ticket No", value: details.ticketNo },
      { label: "Title", value: details.title },
      {
        label: "Status",
        customElement: (
          <GrievanceStatusChip status={details.status} level={details.level} />
        ),
      },
      {
        label: "Grievance Type",
        value: details.grievanceTypeName,
      },
      {
        label: "Description",
        value: details.description,
      },
      {
        label: "Level",
        value: details.level,
      },
      {
        label: "Managed By",
        value: details.manageBy,
      },
      {
        label: "Resolved Date",
        value: details.resolvedDate
          ? moment(details.resolvedDate).format("MMM Do, YYYY")
          : "Not Yet Resolved",
      },
      {
        label: "Raised On",
        value: moment(details.createdOn).format("MMM Do, YYYY"),
      },
      {
        label: "File Name",
        customElement: (
          <Box display="flex" alignItems="center">
            {details.fileOriginalName ? (
              <>
                <Typography >{details.fileOriginalName}</Typography>
                <ViewDocument containerType={1} filename={details.attachmentPath} />
              </>
            ) : (
              <Typography >No file uploaded</Typography>
            )}
          </Box>
        ),
      },
    ];
  }, [data]);

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title="My Grievance" goBack={true} />
        {!grievanceDetails ? (
          <Typography sx={{ textAlign: "center", p: "20px" }}>
            No Data Found
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {grievanceDetails.map(({ label, value, customElement }, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >{`${label}:`}</Typography>
                {customElement ?? (
                  <TruncatedText
                    text={value}
                    tooltipTitle={value}
                    maxLength={40}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default EmployeeGrievanceDetailsPage;
