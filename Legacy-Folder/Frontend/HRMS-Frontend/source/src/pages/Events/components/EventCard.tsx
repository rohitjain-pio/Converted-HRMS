import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  MenuItem,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { EventCardMenu } from "@/pages/Events/components/EventCardMenu";
import { formatEventDuration } from "@/pages/Events/components/utils";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import PublishIcon from "@mui/icons-material/Publish";
import DoneIcon from "@mui/icons-material/Done";
import { EventStatusType } from "@/services/Events";
import { SyntheticEvent } from "react";
import fallbackImage from "@/assets/images/icons/fallback-image.png";

type EventCardProps = {
  event: {
    id: number;
    name: string;
    startDateTime: string;
    endDateTime: string;
    venue: string;
    status: string;
    image: string;
  };
  onDelete: () => void;
  onUpdateStatus: (
    params?: { eventId: number; status: EventStatusType } | undefined
  ) => Promise<void>;
};

const EventCard = (props: EventCardProps) => {
  const { event, onDelete, onUpdateStatus } = props;
  const { id, name, startDateTime, endDateTime, venue, status, image } = event;
  const { formattedDate, formattedTime } = formatEventDuration(
    startDateTime,
    endDateTime
  );

  const navigate = useNavigate();

  const { VIEW, EDIT, DELETE } = permissionValue.EVENTS;

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = fallbackImage;
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <CardActionArea
        disabled={!hasPermission(VIEW)}
        onClick={() => {
          navigate(`/events/view/${id}`);
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="280"
            image={image}
            alt={name}
            onError={handleImageError}
          />
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              bgcolor: (theme) => {
                const { wipPendingApproval, upcoming, completed } =
                  theme.palette.status;
                return status === "WIP / Pending Approval"
                  ? wipPendingApproval
                  : status === "Upcoming"
                    ? upcoming
                    : status === "Completed"
                      ? completed
                      : "transparent";
              },
              color: "white",
              pt: 1,
              pb: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              color="white"
              fontWeight="600"
              textAlign="center"
            >
              {status.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
      <CardContent sx={{ flexGrow: 1, padding: "1rem" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <CardActionArea
            disabled={!hasPermission(VIEW)}
            onClick={() => {
              navigate(`/events/view/${id}`);
            }}
            sx={{ minWidth: "0" }}
          >
            <Typography
              variant="h3"
              color="GrayText"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
              marginBottom="0.5rem"
            >
              {name}
            </Typography>
          </CardActionArea>
          {!hasPermission(DELETE) && !hasPermission(EDIT) ? null : (
            <Box sx={{ marginRight: "-0.5rem" }}>
              <EventCardMenu>
                {hasPermission(EDIT) && status !== "Completed" ? (
                  <Box>
                    {status === "WIP / Pending Approval" && (
                      <MenuItem
                        onClick={() => {
                          onUpdateStatus({
                            eventId: id,
                            status: "Upcoming",
                          });
                        }}
                        disableRipple
                      >
                        <PublishIcon
                          sx={{
                            color: (theme) => theme.palette.status.upcoming,
                          }}
                        />
                        Upcoming
                      </MenuItem>
                    )}
                    {status === "Upcoming" && (
                      <MenuItem
                        onClick={() => {
                          onUpdateStatus({
                            eventId: id,
                            status: "Completed",
                          });
                        }}
                        disableRipple
                      >
                        <DoneIcon
                          sx={{
                            color: (theme) => theme.palette.status.completed,
                          }}
                        />
                        Complete
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        navigate(`/events/edit/${id}`);
                      }}
                      disableRipple
                      color="primary"
                    >
                      <EditIcon color="primary" />
                      Edit
                    </MenuItem>
                  </Box>
                ) : null}
                {hasPermission(DELETE) ? (
                  <MenuItem
                    onClick={() => {
                      onDelete();
                    }}
                    disableRipple
                  >
                    <DeleteIcon color="error" />
                    Delete
                  </MenuItem>
                ) : null}
              </EventCardMenu>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <PlaceIcon sx={{ fontSize: "1em" }} />
          <Typography
            color="GrayText"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            {venue}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <EventIcon sx={{ fontSize: "1em" }} />
          <Typography
            color="GrayText"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            {formattedDate}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <ScheduleIcon sx={{ fontSize: "1em" }} />
          <Typography
            color="GrayText"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            {formattedTime}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;
