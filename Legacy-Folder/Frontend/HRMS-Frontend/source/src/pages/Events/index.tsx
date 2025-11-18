import {
  Box,
  CircularProgress,
  debounce,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import EventCard from "@/pages/Events/components/EventCard";
import { useEffect, useRef, useState } from "react";
import {
  deleteEvent,
  DeleteEventResponse,
  EventListItem,
  EventListSearchFilter,
  EventStatusType,
  getEventList,
  GetEventListResponse,
  updateEventStatus,
  UpdateEventStatusResponse,
} from "@/services/Events";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useIntersectionObserver } from "@/pages/Events/components/useIntersectionObserver";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import AddIcon from "@mui/icons-material/Add";
import FilterForm from "@/pages/Events/components/FilterForm";
import { hasPermission } from "@/utils/hasPermission";
import { eventStatusToId, permissionValue, role } from "@/utils/constants";
import { objectToFormData } from "@/utils/formData";
import BreadCrumbs from "@/components/@extended/Router";
import { useUserStore } from "@/store";

const Events = () => {
  const [eventList, setEventList] = useState<EventListItem[]>([]);
  const sortColumnName = "";
  const sortDirection = "";
  const [eventName, setEventName] = useState("");
  const [statusId, setStatusId] = useState<number>(eventStatusToId["Upcoming"]);
  const [startIndex, setStartIndex] = useState(1);
  const pageSize = 12;
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const [eventToDeleteId, setEventToDeleteId] = useState<number | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);

  const { userData } = useUserStore();

  const isEmployeeRole = userData.roleName === role.EMPLOYEE;

  const hasMore = totalRecords === null || eventList.length < totalRecords;

  const { CREATE } = permissionValue.EVENTS;

  const navigate = useNavigate();

  const debouncedSetStartIndex = useRef(
    debounce(() => {
      setStartIndex((prev) => prev + 1);
    }, 300)
  ).current;

  function handleObserver() {
    if (hasMore && !isLoading) {
      debouncedSetStartIndex();
    }
  }

  const { ref } = useIntersectionObserver({
    threshold: 0.3,
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        handleObserver();
      }
    },
  });

  const openConfirmationDialog = (eventId: number) => {
    setIsConfirmationDialogOpen(true);
    setEventToDeleteId(eventId);
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setEventToDeleteId(null);
  };

  const handleConfirmDelete = (eventId: number) => {
    if (!eventId) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    removeEvent(eventId);
  };

  const { execute: fetchEvents, isLoading } = useAsync<GetEventListResponse>({
    requestFn: async (): Promise<GetEventListResponse> => {
      return await getEventList({
        sortColumnName,
        sortDirection,
        startIndex,
        pageSize,
        filters: {
          eventName,
          statusId,
        },
      });
    },
    onSuccess: ({ data }) => {
      const newEvents = data.result?.eventList ?? [];

      const filteredEvents = isEmployeeRole
        ? newEvents.filter(({ status }) => status !== "WIP / Pending Approval")
        : newEvents;
      const removedCount = newEvents.length - filteredEvents.length;
      const originalTotal = data.result?.totalRecords ?? 0;
      const updatedTotalRecords = isEmployeeRole
        ? originalTotal - removedCount
        : originalTotal;
      setEventList((prev) => [...prev, ...filteredEvents]);
      setTotalRecords(updatedTotalRecords);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: false,
  });

  const { execute: removeEvent } = useAsync<DeleteEventResponse, number>({
    requestFn: async (eventId: number): Promise<DeleteEventResponse> => {
      return await deleteEvent(eventId);
    },
    onSuccess: () => {
      toast.success("Event deleted successfully");
      const newEventList = eventList.filter(
        (event) => event.id !== eventToDeleteId
      );
      setEventList(newEventList);
      closeConfirmationDialog();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: updateStatus } = useAsync<
    UpdateEventStatusResponse,
    { eventId: number; status: EventStatusType }
  >({
    requestFn: async (args: {
      eventId: number;
      status: EventStatusType;
    }): Promise<UpdateEventStatusResponse> => {
      const { eventId, status } = args;
      const formData = objectToFormData({ statusId: eventStatusToId[status] });
      return await updateEventStatus(eventId, formData);
    },
    onSuccess: (response, args) => {
      toast.success(response.data.message);
      const newEventList = eventList.map((event) =>
        event.id === args?.eventId ? { ...event, status: args.status } : event
      );
      setEventList(newEventList);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchEvents();
  }, [startIndex, pageSize, eventName, statusId]);

  const handleSearch = async ({
    eventName,
    statusId,
    isReset = false,
  }: EventListSearchFilter) => {
    setEventName(eventName);
    setStatusId(statusId);
    if (isReset) {
      setStartIndex(1);
      setEventList([]);
    }
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Events"
          hideBorder
          actionButton={
            <FilterForm
              onSearch={handleSearch}
              addIcon={
                hasPermission(CREATE) ? (
                  <RoundActionIconButton
                    onClick={() => navigate("/events/add")}
                    label="Add Event"
                    size="small"
                    icon={<AddIcon />}
                  />
                ) : null
              }
            />
          }
        />
        <Box padding="20px">
          <Box marginBottom="16px" margin={"auto"}>
            <Grid container spacing={2} sx={{ justifyContent: "flex-start" }}>
              {eventList.length ? (
                eventList.map((event, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                    <Box ref={eventList.length - 1 === index ? ref : null}>
                      <EventCard
                        event={{
                          name: event.eventName,
                          startDateTime: event.startDate,
                          endDateTime: event.endDate,
                          id: event.id,
                          venue: event.venue,
                          status: event.status,
                          image: event.bannerFileName,
                        }}
                        onDelete={() => openConfirmationDialog(event.id)}
                        onUpdateStatus={updateStatus}
                      />
                    </Box>
                  </Grid>
                ))
              ) : !isLoading ? (
                <Typography
                  sx={{ textAlign: "center", pt: 4.5, pb: 4.5, width: "100%" }}
                >
                  No Events Found
                </Typography>
              ) : null}
            </Grid>
            {isLoading ? (
              <Box
                sx={{
                  mt: 4,
                  mb: 2.5,
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Paper>
      {eventToDeleteId && isConfirmationDialogOpen ? (
        <ConfirmationDialog
          title="Delete Event"
          content="Are you sure you want to proceed? The selected item will be permanently deleted."
          open={isConfirmationDialogOpen}
          onClose={closeConfirmationDialog}
          onConfirm={() => handleConfirmDelete(eventToDeleteId)}
        />
      ) : null}
    </>
  );
};

export default Events;
