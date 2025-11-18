import { useState, useEffect } from "react";
import {
  AttendanceParams,
  AttendanceResponse,
  AttendanceRow,
  EditDetails,
  TimeInFormData,
} from "@/pages/Attendance/types";

import useAsync from "@/hooks/useAsync/useAsync";
import {
  getAttendaceReport,
  addAttendanceReport,
  updateAttendanceReport,
} from "@/services/Attendence/AttendenceService";
import useUserStore from "@/store/useUserStore";
import { toast } from "react-toastify";
import methods from "@/utils";
import moment from "moment";
export const getDateStatus = (dateStr: string) => {
  const today = moment().format("YYYY-MM-DD");
  if (dateStr === today) return "today";
  if (dateStr < today) return "past";
  return "future";
};
export function useAttendanceDialogs() {
  const { userData } = useUserStore();
  

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [openTimeIn, setOpenTimeIn] = useState(false);
  const [openTimeOut, setOpenTimeOut] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [isManualAttendance, setIsManualAttendance] = useState(false);
  const timeOutDate = moment().format("YYYY-MM-DD");
  const [showTimeInButton, setShowTimeInButton] = useState(true);
  const [filledDates, setFilledDates] = useState<string[]>([]);
  const [editDetails, setEditDetail] = useState<EditDetails>({
    id: 0,
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    note: "",
    reason: "",
    totalHours:''

  });

  const { execute: fetchAttendance,isLoading:getLoading } = useAsync<{ result: AttendanceResponse }>(
    {
      requestFn: () => {
        const params: AttendanceParams = {
          pageIndex: startIndex ,
          pageSize,
          dateFrom: filterStartDate,
          dateTo: filterEndDate,
        };
        return getAttendaceReport(userData.userId, params);
      },
      autoExecute: false,
      onSuccess: (response) => {
        const result = response.data?.result;
        setRows(result?.attendaceReport || []);
        setTotalRecords(result?.totalRecords || 0);
        setIsManualAttendance(result.isManualAttendance);
        setShowTimeInButton(result.isTimedIn);
        setFilledDates(result.dates);
      },
      onError: (err) => {
        setRows([]);
        setTotalRecords(0);
        methods.throwApiError(err);
      },
    }
  );

  const { isLoading: isAddLoading, execute: addAttendance } = useAsync({
    requestFn: (payload: AttendanceRow) =>
      addAttendanceReport(userData.userId, payload),
    onSuccess: () => {
      fetchAttendance();
      toast.success("Your Time In has been Recorded.");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { isLoading: isUpdateLoading, execute: updateAttendance } = useAsync({
    requestFn: (args: { id: number; payload: AttendanceRow }) =>
      updateAttendanceReport(userData.userId, args.id, args.payload),
    onSuccess: (_, params) => {
      fetchAttendance();
      if (params?.payload.audit[0].action == "Time Out") {
        toast.success("Thank you! Your Time Out has been recorded.");
      } else {
        toast.success("Your Time In has been Recorded.");
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchAttendance();
  }, [startIndex, pageSize, filterStartDate, filterEndDate]);
  const handleTimeIn = async (data: TimeInFormData) => {
    const dateVal = data.date;
    const startTimeVal = data.startTime;
    const endTimeVal = data.endTime;
    const locationVal = data.location;
    const noteVal = data.note;
    const reasonVal = data.reason;

    if (getDateStatus(dateVal) === "future") {
      toast.error("You can't add attendance for a future date.");
      return;
    }

    let time = moment().format("HH:mm");
    let endTime: string | undefined = undefined;
    let auditEntries;
    if (getDateStatus(dateVal) === "past") {
      time = startTimeVal;
      endTime = endTimeVal;
      auditEntries = [
        {
          action: "Time In",
          time,
          reason: reasonVal,
        },
        {
          action: "Time Out",
          time: endTime,
        },
      ];
    } else {
      auditEntries = [
        {
          action: "Time In",
          time,
          comment: noteVal ? `${noteVal} (${locationVal})` : "",
          reason: reasonVal,
        },
      ];
    }

    // Check if attendance for  already exists
    const existingIdx = rows.findIndex((item) => item.id===editDetails.id );
    const payload: AttendanceRow = {
      date: dateVal,
      startTime: time,
      location: locationVal,
      endTime: endTime ? endTime : "",
      audit: auditEntries,
    } as AttendanceRow;

    if (existingIdx !== -1) {
      // Update existing attendance
      await updateAttendance({
        id: rows[existingIdx].id,
        payload: { ...rows[existingIdx], ...payload },
      });
    } else {
      // Add new attendance
      await addAttendance(payload);
    }

    setOpenTimeIn(false);
  };

  const handleTimeOut = async () => {
    if (getDateStatus(timeOutDate) === "past") {
      toast.error(
        "Time Out for past days must be entered in the Time In section."
      );
      return;
    }
    const idx = rows.findIndex((item) => item.date === timeOutDate);

    const time = moment().format("HH:mm");
    const auditEntry = {
      action: "Time Out",
      time,
    };

    if (idx > -1) {
      const payload: AttendanceRow = {
        id: rows[idx].id,
        date: timeOutDate,
        endTime: time,
        audit: [auditEntry],
      } as AttendanceRow;
      await updateAttendance({ id: rows[idx].id, payload });
    } else {
      const payload: AttendanceRow = {
        date: timeOutDate,
        endTime: time,
        audit: [auditEntry],
      } as AttendanceRow;
      await addAttendance(payload);
    }
    setOpenTimeOut(false);
  };
  return {
    rows,
    setRows,
    openTimeIn,
    setOpenTimeIn,
    openTimeOut,
    setOpenTimeOut,
    timeOutDate,
    getDateStatus,
    handleTimeIn,
    handleTimeOut,
    startIndex,
    setStartIndex,
    pageSize,
    setPageSize,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    fetchAttendance,
    isManualAttendance,
    isAddLoading,
    isUpdateLoading,
    totalRecords,
    showTimeInButton,
    setEditDetail,
    editDetails,
    filledDates,
    getLoading
  };
}
