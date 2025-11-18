import {
  DaySlot,
  LEAVE_TYPES,
  LeaveType,
} from "@/utils/constants";

import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { toast } from "react-toastify";
import { useUserStore } from "@/store";
import { useMemo, useState, useEffect } from "react";
import {
  applyLeave,
  ApplyLeaveArgs,
  ApplyLeaveResponse,
  GetHolidayResponse,
  getLeaveBalanceDetails,
  GetLeaveBalanceDetailsResponse,
  getPersonalizedHolidayList,
  IHoliday,
} from "@/services/EmployeeLeave";
import { LeaveStats } from "@/pages/Leaves/components/LeaveStatsSection";
import { calculateLeaveDays } from "@/utils/helpers";
import LeaveApplicationForm from "./LeaveApplicationForm";
import { schema } from "./validationSchema";


type FormValues = Yup.InferType<typeof schema>;

const LeaveFormPage = () => {
  const { leaveType } = useParams<{ leaveType?: string }>();
  const { userData } = useUserStore();
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const leaveTypeLabel =
    leaveType && LEAVE_TYPES[Number(leaveType)]
      ? LEAVE_TYPES[Number(leaveType)].label
      : "";

  const method = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: null,
      startDateSlot: "",
      endDate: null,
      endDateSlot: "",
      reason: "",
      attachment: null,
    },
  });
  const navigate = useNavigate();
  const { reset, watch, setValue } = method;

  const [startDate, startDateSlot, endDate, endDateSlot] = watch([
    "startDate",
    "startDateSlot",
    "endDate",
    "endDateSlot",
  ]);

  const { execute: add, isLoading: isAdding } = useAsync<
    ApplyLeaveResponse,
    ApplyLeaveArgs
  >({
    requestFn: async (args: ApplyLeaveArgs): Promise<ApplyLeaveResponse> => {
      return await applyLeave(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      navigate("/leave/apply-leave");
      reset();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { data: holidayList, isLoading: isFetchingHoliday } =
    useAsync<GetHolidayResponse>({
      requestFn: async (): Promise<GetHolidayResponse> => {
        return await getPersonalizedHolidayList(Number(userData.userId));
      },
      autoExecute: true,
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  const { isLoading: isFetchingBalanceDetails } =
    useAsync<GetLeaveBalanceDetailsResponse>({
      requestFn: async (): Promise<GetLeaveBalanceDetailsResponse> => {
        return await getLeaveBalanceDetails({
          employeeId: Number(userData.userId),
          leaveId: Number(leaveType || 0),
        });
      },
      onSuccess: ({ data }) => {
        setLeaveStats(data.result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: true,
    });

  const totalLeaveDays = useMemo(() => {
    if (!startDate || !endDate || !startDateSlot || !endDateSlot) {
      return 0;
    }

    return calculateLeaveDays(
      startDate,
      Number(startDateSlot),
      endDate,
      Number(endDateSlot),
      holidayList?.result.india
    );
  }, [startDate, startDateSlot, endDate, endDateSlot, holidayList]);

  const shouldDisableDateCombined = (date: moment.Moment) => {
    const day = date.day();
    if (day === 0 || day === 6) {
      return true;
    }

    const isHoliday = holidayList?.result?.india?.some((holiday: IHoliday) =>
      moment(holiday.date, "MM/DD/YYYY").isSame(date, "day")
    );

    if (isHoliday) {
      return true;
    }

    return false;
  };

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (!values.startDate || !values.endDate || !leaveType) {
      return;
    }

    if (
      leaveType !== String(LeaveType.Paternity) &&
      leaveType !== String(LeaveType.Maternity) &&
      totalLeaveDays > 5
    ) {
      toast.error("You cannot apply for more than 5 days of leave.");
      return;
    }

    add({
      employeeId: +userData.userId,
      leaveId: +leaveType,
      startDate: moment(values.startDate).format("YYYY-MM-DD"),
      endDate: moment(values.endDate).format("YYYY-MM-DD"),
      startDateSlot: +values.startDateSlot,
      endDateSlot: +values.endDateSlot,
      reason: values.reason,
      attachment: values.attachment,
      totalLeaveDays: totalLeaveDays,
    });
  };

  const isSameDay =
    !!startDate && !!endDate && startDate.isSame(endDate, "day");

  useEffect(() => {
    if (isSameDay) return;

    if (startDateSlot !== String(DaySlot.FullDay)) {
      setValue("endDateSlot", String(DaySlot.FullDay));
    }
  }, [startDateSlot, isSameDay]);

  useEffect(() => {
    if (isSameDay) return;

    if (endDateSlot !== String(DaySlot.FullDay)) {
      setValue("startDateSlot", String(DaySlot.FullDay));
    }
  }, [endDateSlot, isSameDay]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    if (isSameDay && startDateSlot) {
      setValue("endDateSlot", startDateSlot);
    } else if (isSameDay && !startDateSlot) {
      endDateSlot
        ? setValue("startDateSlot", endDateSlot)
        : setValue("endDateSlot", "");
    }
  }, [startDate, endDate, startDateSlot, endDateSlot, setValue, isSameDay]);

  return (
   
<LeaveApplicationForm
      leaveTypeLabel={leaveTypeLabel}
      leaveStats={leaveStats}
      method={method}
      onSubmit={onSubmit}
      shouldDisableDateCombined={shouldDisableDateCombined}
      isSameDay={isSameDay}
      totalLeaveDays={totalLeaveDays}
      isAdding={isAdding}
      isFetchingBalanceDetails={isFetchingBalanceDetails}
      isFetchingHoliday={isFetchingHoliday}/>

  );
};

export default LeaveFormPage;
