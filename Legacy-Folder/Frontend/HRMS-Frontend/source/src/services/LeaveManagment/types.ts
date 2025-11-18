import { DaySlot, LeaveRequestType, LeaveStatus } from "@/utils/constants";

export interface GetAccrualsUtilizedRequest {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: {
    date: string | null;
    leaveId: number;
  };
}

export interface AccrualsUtilizedItem {
  employeeId: number;
  description: string;
  closingBalance: number;
  date: string;
  accrued: number;
  utilizedOrRejected: number;
}

export interface GetAccrualsUtilizedResponse {
  statusCode: number;
  message: string;
  result: {
    result: AccrualsUtilizedItem[];
    totalCount: number;
  };
}

export interface EmployeeLeave {
  employeeId: number;
  shortName: string;
  title: string;
  openingBalance: number;
  leaveId: number;
  accruedLeave: number;
  isActive: boolean;
  closingBalance: number;
}

export interface GetEmployeeLeaveByIdResponse {
  statusCode: number;
  message: string;
  result: EmployeeLeave[];
}

export interface UpdateLeaveRequest {
  employeeId: number;
  leaveId: number;
  openingBalance: number;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateLeaveResponse {
  statusCode: number;
  message: string;
  result: number;
}

export type LeaveBalanceItem = {
  leaveId: number;
  shortName: string;
  title: string;
  closingBalance: number;
};

export type GetLeaveBalancesResponse = {
  statusCode: number;
  message: string;
  result: {
    data: LeaveBalanceItem[];
  };
};

export type UpdateLeaveArgs = {
  openingBalance: number;
  decision: LeaveStatus;
  appliedLeaveId: number;
  rejectReason?: string | null;
};
export type getEmployeeLeaveArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: {
    status?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    employeeCode: string;
  };
};
export type LeaveManagementResponse = {
  statusCode: number;
  message: string;
  result: {
    leaveRequestList: LeaveManagerItem[];
    totalCount: number;
  };
};
export type LeaveManagerItem = {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  leaveId: number;
  shortName: string;
  title: string;
  totalLeaveDays: number;
  reason: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  startDateSlot: DaySlot;
  endDateSlot: DaySlot;
  openingBalance: number;
};
export type ImportEmployeesLeaveResponse = {
  statusCode: number;
  message: string;
  result: number;
};
export interface EmployeeLeaveType {
  id: number;
  title: string;
  shortName: string;
  openingBalance: number;
}

export interface GetEmployeeLeaveTypesResponse {
  statusCode: number;
  message: string;
  result: EmployeeLeaveType[];
}

export interface GetCalendarLeavesPayload {
  employeeId: number;
  departmentId: number;
  // leaveTypeId: number;
  status: number;
  date: string;
}

export interface DailyLeaveStatusDto {
  date: string;
  pendingCount: number;
  approvedCount: number;
  employeeName: string | null;
  department: string | null;
  leaveName: string | null;
}

export interface GetLeaveCalendarResponse {
  statusCode: number;
  message: string;
  result: {
    dailyStatuses: DailyLeaveStatusDto[];
  };
}

export type LeaveCompOffDetails = {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  workingDate: string;
  leaveDate?: string;
  leaveDateLabel?: string;
  workingDateLabel?: string;
  reason?: string;
  status: LeaveStatus;
  rejectReason?: string;
  numberOfDays: number;
  requestType: LeaveRequestType;
  createdOn?: string;
  createdBy?: string;
};

export type GetLeaveCompOffResponse = {
  statusCode: number;
  message: string;
  result: {
    compOffAndSwapHolidayList: LeaveCompOffDetails[];
    totalCount: number;
  };
};

export type Leave_CompOffArgs = {
  employeeCode?: string;
  workingDate: string | null;
  status: number | null;
  type: number | null;
};
export type GetCompOffSwapHolidayArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: Leave_CompOffArgs;
};
export type ApproveOrRejectCompOffAndSwapArgs = {
  id: number;
  employeeId: number;
  workingDate: string;
  leaveDate?: string;
  leaveDateLabel?: string;
  workingDateLabel?: string;
  reason?: string;
  status: LeaveStatus;
  rejectReason?: string;
  type: LeaveRequestType;
  numberOfDays:number
};
export type ApproveOrRejectCompOffAndSwapResponse ={
  statusCode: number;
  message: string;
  result: number;
}
