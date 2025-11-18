
import DOMPurify from 'dompurify';

import { useParams } from "react-router-dom";
import {
  Box,
  Divider,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import NotFoundPage from "@/pages/NotFoundPage";
import Loader from "@/components/Loader";
import { getEvent, GetEventResponse } from "@/services/Events";
import ShowDateTime from "@/components/ShowDateTime";
import EventDetailBox from "@/pages/Events/components/EventDetailBox";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import PageHeader from "@/components/PageHeader/PageHeader";
import BreadCrumbs from "@/components/@extended/Router";
import { SyntheticEvent } from "react";
import fallbackImage from "@/assets/images/icons/fallback-image.png";

const Detail = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const smMediaQuery = useMediaQuery(theme.breakpoints.up("sm"));
  const smallMobileMediaQuery = useMediaQuery("(max-width:320px)");
  const { READ } = permissionValue.EVENTS;

  const { data, isLoading } = useAsync<GetEventResponse>({
    requestFn: async (): Promise<GetEventResponse> => {
      return await getEvent(Number(id));
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: hasPermission(READ) ? true : false,
  });

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = fallbackImage;
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!hasPermission(READ) || !data?.result) {
    return <NotFoundPage />;
  }

  
const sanitizedHTML = DOMPurify.sanitize(data.result.content);

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h3" title="Event Detail" goBack={true} />
        <Box sx={{ padding: "24px" }}>
          <Box
            component="img"
            sx={{
              height: "auto",
              width: "100%",
              borderRadius: "4px",
              maxHeight: "400px",
              objectFit: "cover",
              boxShadow: "10px 10px 25px -15px rgba(0, 0, 0, 90%)",
            }}
            alt={data.result.eventName}
            src={data.result.bannerFileName}
            onError={handleImageError}
          />
          <Typography variant="h1" sx={{ marginTop: "24px" }}>
            {data.result.eventName}
          </Typography>
          <Grid
            container
            sx={{ paddingTop: "24px", paddingBottom: "24px" }}
            direction={smMediaQuery ? "row" : "column-reverse"}
          >
            <Grid item xs={12} sm={7} md={8}>
              <Box
                sx={{ paddingRight: smMediaQuery ? "24px" : 0 }}
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              />
            </Grid>

            <Grid item xs={12} sm={5} md={4}>
              <Box
                sx={{
                  paddingLeft: smMediaQuery ? "24px" : 0,
                  height: "100%",
                  borderLeft: smMediaQuery ? "1px solid #dee2e6" : "none",
                }}
              >
                <Typography variant="h4" fontWeight={800}>
                  Date
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: smallMobileMediaQuery
                      ? "flex-start"
                      : "center",
                    alignItems: "center",
                    gap: "24px",
                  }}
                >
                  <ShowDateTime date={data.result.startDate} />
                  <Box>
                    <Typography
                      color={theme.palette.primary.light}
                      fontWeight={800}
                    >
                      TO
                    </Typography>
                  </Box>
                  <ShowDateTime date={data.result.endDate} />
                </Box>
                <Divider
                  orientation="horizontal"
                  variant="fullWidth"
                  sx={{
                    borderColor: "#dee2e6",
                    marginTop: "24px",
                    marginBottom: "24px",
                  }}
                />

                <EventDetailBox title="Status" value={data.result.status} />
                <EventDetailBox title="Venue" value={data.result.venue} />
                {data.result.link1 && (
                  <EventDetailBox
                    title="Meeting Link"
                    value={data.result.link1}
                    isUrl={true}
                  />
                )}
                {data.result.link2 && (
                  <EventDetailBox
                    title="Video Link"
                    value={data.result.link2}
                    isUrl={true}
                  />
                )}
                {data.result.link3 && (
                  <EventDetailBox
                    title="Reference Link"
                    value={data.result.link3}
                    isUrl={true}
                  />
                )}
                {data.result.eventFeedbackSurveyLink && (
                  <EventDetailBox
                    title="Feedback Survey Link"
                    value={data.result.eventFeedbackSurveyLink}
                    isUrl={true}
                  />
                )}

                {data.result.eventDocument &&
                  data.result.eventDocument.length > 0 && (
                    <EventDetailBox
                      title="Download Files"
                      value={data.result.eventDocument}
                      isFileList
                    />
                  )}

                <Divider
                  orientation="horizontal"
                  variant="fullWidth"
                  sx={{
                    borderColor: "#dee2e6",
                    marginTop: "24px",
                    marginBottom: "24px",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default Detail;
