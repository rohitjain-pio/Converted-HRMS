import { useState, useEffect, useMemo } from "react";
import moment, { Moment } from "moment";
import useAsync from "@/hooks/useAsync";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { Box, Typography, Paper } from "@mui/material";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import FilterForm from "@/pages/LeaveCalenderAdmin/Components/FilterForm";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useUserStore } from "@/store";
import type { FormData as FilterFormData } from "@/pages/LeaveCalenderAdmin/Components/FilterForm";
import methods from "@/utils";
import {
  DailyLeaveStatusDto,
  getCalendarLeaves,
  GetCalendarLeavesPayload,
  GetLeaveCalendarResponse,
} from "@/services/LeaveManagment";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import {
  GetHolidayResponse,
  IHoliday,
  getHolidayList,
} from "@/services/Dashboard";
import { CustomDateHeader } from "./Components/CustomDateHeader";

const LeaveCalendarAdmin = () => {
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [leaveData, setLeaveData] = useState<
    Record<string, DailyLeaveStatusDto[]>
  >({});
  const { userData } = useUserStore();
  const [departmentId, setDepartmentId] = useState<number | undefined>(
    undefined
  );
  const [status, setStatus] = useState<number | undefined>(undefined);

  // Fetch calendar leaves
  const { execute: fetchCalendarLeaves, isLoading } =
    useAsync<GetLeaveCalendarResponse>({
      requestFn: async (): Promise<GetLeaveCalendarResponse> => {
        const payload: GetCalendarLeavesPayload = {
          employeeId: Number(userData.userId),
          departmentId: departmentId ?? 0,
          status: status ?? 0,
          date: selectedDate.startOf("month").format("YYYY-MM-DD"),
        };
        return await getCalendarLeaves(payload);
      },
      onSuccess: ({ data }) => {
        const dailyStatuses = data.result.dailyStatuses || [];
        const mapped: Record<string, DailyLeaveStatusDto[]> = {};

        dailyStatuses.forEach((item: DailyLeaveStatusDto) => {
          const dateKey = moment(item.date).format("YYYY-MM-DD");
          if (!mapped[dateKey]) {
            mapped[dateKey] = [];
          }
          mapped[dateKey].push(item);
        });
        setLeaveData(mapped);
      },
      onError: (err) => {
        setLeaveData({});
        methods.throwApiError(err);
      },
    });

  useEffect(() => {
    fetchCalendarLeaves();
  }, [departmentId, status, selectedDate]);

  const handleSearch = (data: FilterFormData) => {
    const newSelectedDate = data.date ? moment(data.date) : moment();
    setSelectedDate(newSelectedDate);
    setDepartmentId(data.departmentId ? Number(data.departmentId) : undefined);
    setStatus(data.status ? Number(data.status) : undefined);
  };

  const { data: holidayResponse, isLoading: isFetchingHoliday } =
    useAsync<GetHolidayResponse>({
      requestFn: async (): Promise<GetHolidayResponse> => {
        return await getHolidayList();
      },
      autoExecute: true,
    });

  const indianHolidays = holidayResponse?.result?.india || [];
  const holidayMap = useMemo(() => {
    if (!indianHolidays) return {};

    const selectedMonth = selectedDate.month();
    const selectedYear = selectedDate.year();

    const map: Record<string, string> = {};

    indianHolidays.forEach((holiday: IHoliday) => {
      const holidayMoment = moment(holiday.date, "MM/DD/YYYY");
      if (
        holidayMoment.month() === selectedMonth &&
        holidayMoment.year() === selectedYear
      ) {
        const dateKey = holidayMoment.format("YYYY-MM-DD");
        map[dateKey] = holiday.title;
      }
    });
    return map;
  }, [indianHolidays, selectedDate]);

  const localizer = momentLocalizer(moment);

  const CustomMonthDateHeader = ({
    label,
    date,
  }: {
    label: string;
    date: Date;
  }) => {
    return (
      <CustomDateHeader
        label={label}
        date={date}
        leaveData={leaveData}
        holidayMap={holidayMap}
        isFetchingHoliday={isFetchingHoliday}
      />
    );
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Leave Calendar"
          hideBorder={true}
          actionButton={<FilterForm onSearch={handleSearch} />}
        />

        <Box padding="20">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Typography variant="h6">
                {moment(selectedDate).format("MMMM YYYY")}
              </Typography>
            </Box>
            <Box
              sx={{
                height: "100vh",
                padding: "20px",
              }}
            >
              <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                toolbar={false}
                date={selectedDate.toDate()}
                view={Views.MONTH}
                onNavigate={(date: Date) => setSelectedDate(moment(date))}
                components={{
                  month: {
                    dateHeader: (props) => (
                      <CustomMonthDateHeader {...props} date={props.date} />
                    ),
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>
      </Paper>
      <GlobalLoader loading={isLoading || isFetchingHoliday} />
    </>
  );
};

export default LeaveCalendarAdmin;
