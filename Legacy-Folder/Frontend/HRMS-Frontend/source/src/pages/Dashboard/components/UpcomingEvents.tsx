import moment from "moment";
import {
  Box,
  CircularProgress,
  Tooltip,
  styled,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import defaultIcon from "@/assets/images/icons/no-photo.jpg";
import { UpcomingEventProps } from "@/services/Dashboard";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import "@/pages/Dashboard/components/UpcomingEvents.css";
import { No_Permission_To_View_Details, View_Details } from "@/utils/messages";
import { SyntheticEvent } from "react";
import fallbackImage from "@/assets/images/icons/fallback-image.png";

const StyledDataBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "3px",
  border: "1px solid #e3e7eb",
  borderRadius: "10px",
  margin: "5px 0",
  backgroundColor: "rgba(255,255,255,0.5019607843137255)",
  minHeight: "64px",
  ".venue-info": {
    minWidth: 0,
  },
  ".venue-name": {
    fontSize: "16px",
    color: "#273A50",
    fontWeight: 400,
    fontFamily: "Roboto",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ".venue-date": {
    fontSize: "12px",
    color: "#6d6d6d",
    fontWeight: 400,
    fontFamily: "Roboto",
    lineHeight: "12px",
  },
  ".venue-place": {
    fontSize: "12px",
    color: "#6d6d6d",
    fontWeight: 400,
    fontFamily: "Roboto",
    lineHeight: "12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ".event-pic": {
    width: "40px",
    height: "40px",
    margin: "0px 10px",
  },
  ".view-icon": {
    marginRight: "10px",
  },
  ".venue-details": {
    padding: "2px 0",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  },
  "&:hover": {
    background: "#F6F9FC",
  },
}));

const UpcomingEvents: React.FC<UpcomingEventProps> = ({
  isLoading,
  upcomingEvents,
}) => {
  const { VIEW } = permissionValue.EVENTS;

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = fallbackImage;
  };

  return (
    <div>
      {isLoading ? (
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      ) : (
        upcomingEvents?.map((upcomingEvent) => (
          <StyledDataBox key={upcomingEvent.id}>
            <img
              src={upcomingEvent.bannerFileName || defaultIcon}
              title={upcomingEvent.eventName}
              alt={upcomingEvent.eventName || "Event image"}
              className="event-pic"
              onError={handleImageError}
            />
            <div className="venue-info">
              <Tooltip title={upcomingEvent.eventName} followCursor>
                <Typography className="venue-name">
                  {upcomingEvent.eventName}
                </Typography>
              </Tooltip>
              <div className="venue-details">
                <Typography className="venue-date">
                  {moment(upcomingEvent.startDate).format(
                    "MMM Do, YYYY, hh:mm A"
                  )}
                </Typography>
                <Tooltip title={upcomingEvent.venue} followCursor>
                  <Typography className="venue-place">
                    {upcomingEvent.venue}
                  </Typography>
                </Tooltip>
              </div>
            </div>
            {
              <Tooltip
                title={
                  hasPermission(VIEW)
                    ? View_Details
                    : No_Permission_To_View_Details
                }
                arrow
              >
                <span>
                  <Box>
                    <ActionIconButton
                      label=""
                      colorType="primary"
                      disableRipple
                      as={Link}
                      icon={
                        hasPermission(VIEW) ? (
                          <Visibility
                            className="view-icon"
                            sx={{ color: "#27A8E0", fontSize: "24px" }}
                          />
                        ) : (
                          <VisibilityOff
                            className="view-icon"
                            sx={{ color: "#27A8E0", fontSize: "24px" }}
                          />
                        )
                      }
                      to={`/events/view/${upcomingEvent.id}`}
                      onClick={(e) => {
                        if (!hasPermission(VIEW)) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!hasPermission(VIEW)}
                    />
                  </Box>
                </span>
              </Tooltip>
            }
          </StyledDataBox>
        ))
      )}
    </div>
  );
};

export default UpcomingEvents;
