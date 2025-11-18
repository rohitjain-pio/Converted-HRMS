import { DaySlot, LeaveRequestType, LeaveStatus } from "@/utils/constants";

export type ApplyLeaveArgs = {
  employeeId: number;
  leaveId: number;
  startDate: string;
  startDateSlot: number;
  endDate: string;
  endDateSlot: number;
  reason: string;
  attachment: string | null;
  totalLeaveDays: number;
};

export type ApplyLeaveResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type LeaveHistoryFilter = {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  leaveType: number;
};

export type GetLeaveHistoryArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: LeaveHistoryFilter;
};

export type LeaveHistoryItem = {
  id: number;
  leaveId: number;
  leaveShortName: string;
  leaveTitle: string;
  totalDays: number;
  reason: string;
  startDate: string;
  endDate: string;
  startDateSlot: DaySlot;
  endDateSlot: DaySlot;
  status: LeaveStatus;
};

export type GetLeaveHistoryResponse = {
  statusCode: number;
  message: string;
  result: {
    leaveHistoryList: LeaveHistoryItem[];
    totalRecords: number;
  };
};

export type LeaveBalanceItem = {
  leaveId: number;
  shortName: string;
  title: string;
  closingBalance: number;
};

export type LeaveBalanceDetails = {
  employeeId: number;
  leaveId: number;
  openingBalance: number;
  closingBalance: number;
  creditedBalance: number;
  leavesTaken: number;
};

export type GetLeaveBalanceDetailsResponse = {
  statusCode: number;
  message: string;
  result: LeaveBalanceDetails;
};

export type LeaveBalanceDetailsArgs = {
  employeeId: number;
  leaveId: number;
};

export type LeaveRequestDetails = {
  leaveId: number;
  startDate: string;
  endDate: string;
  startDateSlot: DaySlot;
  endDateSlot: DaySlot;
  reason: string;
  totalLeaveDays: number;
  status: LeaveStatus;
  createdOn: string;
  shortName: string;
  rejectReason: string;
  title: string;
};

export type GetLeaveRequestDetailsResponse = {
  statusCode: number;
  message: string;
  result: LeaveRequestDetails;
};

export type LeaveManagerFilter = {
  startDate: string | null;
  endDate: string | null;
  leaveStatus: LeaveStatus | null;
};

export type GetIsReportingManager = {
  statusCode: number;
  message: string;
  result: boolean;
};

export type ApplyLeaveCompOffArgs = {
  employeeId: number;
  workingDate: string;
  reason: string;
  numberOfDays: number;
};
export type ApplyLeaveCompOffResponse = {
  statusCode: number;
  message: string;
  result: number;
};
export type ApplyLeaveSwapArgs = {
  employeeId: number;
  workingDate: string;
  leaveDate: string;
  workingDateLabel: string;
  leaveDateLabel: string;
  reason: string;
};
export type ApplyLeaveSwapResponse = {
  statusCode: number;
  message: string;
  result: number;
};
export interface GetHolidayResponse {
    statusCode: number;
    message: string;
    modelErrors: string[];
    result: {
        india: IHoliday[];
        usa: IHoliday[];
    };
}

export interface IHoliday {
    date: string,
    day: string,
    location: string,
    remarks: string
}

export interface HolidayCalendarProps {
    isLoading: boolean;
    holidays: IHoliday[];
}
export type AdjustedLeave = {
  id: number;
  workingDate: string; // YYYY-MM-DD
  leaveDate: string | null; // YYYY-MM-DD
  leaveDateLabel: string | null;
  workingDateLabel: string | null;
  reason: string;
  status: LeaveStatus;
  rejectReason: string | null;
  requestType: LeaveRequestType;
  createdOn: string;
  numberOfDays: number | null;
};

export type GetAdjustedLeavesResponse = {
  statusCode: number;
  message: string;
  result: AdjustedLeave[];
};
