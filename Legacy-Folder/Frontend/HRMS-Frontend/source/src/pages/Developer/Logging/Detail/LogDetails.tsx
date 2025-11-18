import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLogsResponse } from "@/services/Developer/types";
import { getDeveloperLogs } from "@/services/Developer/DeveloperService";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import { DEFAULT_DEVELOPER_LOGS_FILTER } from "@/pages/Developer/Logging/constants";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import moment from "moment";

const LogDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useAsync<DeveloperLogsResponse>({
    requestFn: async (): Promise<DeveloperLogsResponse> => {
      return await getDeveloperLogs({
        ...DEFAULT_DEVELOPER_LOGS_FILTER,
        filters: {
          ...DEFAULT_DEVELOPER_LOGS_FILTER.filters,
          id: id ? Number(id) : null,
        },
      });
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const details = useMemo(() => {
    if (!data) {
      return undefined;
    }

    const logData = data.result?.logsList?.length
      ? data.result.logsList[0]
      : null;
  
    return [
      { label: "Id", value: logData?.id },
      { label: "Level", value: logData?.level },
      { label: "Message", value: logData?.message },
      { label: "Request Id", value: logData?.requestId },
      {
        label: "Timestamp",
        value: moment(logData?.timestamp).format("YYYY MMM DD HH:mm:ss"),
      },
      { label: "Log Event", value: logData?.logEvent },
      { label: "Exception", value: logData?.exception },
    ];
  }, [data]);

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title={"Log Details"} goBack={true} />
        <Box padding="30px">
          {!details ? (
            <Typography textAlign="center">No Data Found</Typography>
          ) : (
            <Stack gap={5}>
              <Grid container spacing={2}>
                {details.map(({ label, value }, index) => (
                  <Grid container key={index} size={12} spacing={0}>
                    <Grid
                      size={12}
                      display="flex"
                      flexDirection="row"
                      gap="5px"
                      alignItems="center"
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {`${label}:`}
                      </Typography>
                    </Grid>
                    <Grid
                      size={12}
                      display="flex"
                      flexDirection="row"
                      gap="5px"
                      alignItems="center"
                    >
                      <Typography>
                        {value ? value.toString().replace(/\\/g, "") : "N/A"}
                      </Typography>
                    </Grid>
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

export default LogDetails;
