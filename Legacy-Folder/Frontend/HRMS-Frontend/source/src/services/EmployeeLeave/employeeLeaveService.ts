import { httpInstance } from "@/api/httpInstance";
import {
  ApplyLeaveArgs,
  ApplyLeaveSwapArgs,
  ApplyLeaveSwapResponse,
  ApplyLeaveResponse,
  GetAdjustedLeavesResponse,
  GetIsReportingManager,
  GetLeaveBalanceDetailsResponse,
  GetLeaveHistoryArgs,
  GetLeaveHistoryResponse,
  GetLeaveRequestDetailsResponse,
  LeaveBalanceDetailsArgs,
  ApplyLeaveCompOffArgs,
  GetHolidayResponse,
} from "@/services/EmployeeLeave/types";

const baseRoute = "/EmployeeLeave";

export const applyLeave = async (args: ApplyLeaveArgs) => {
  return httpInstance.post(
    `${baseRoute}/ApplyLeave`,
    args
  ) as Promise<ApplyLeaveResponse>;
};

export const getLeaveHistory = async (
  employeeId: number,
  args: GetLeaveHistoryArgs
) => {
  return httpInstance.post(
    `${baseRoute}/GetLeaveHistoryByEmployeeId/${employeeId}`,
    args
  ) as Promise<GetLeaveHistoryResponse>;
};

export const getLeaveBalanceDetails = async (args: LeaveBalanceDetailsArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEmployeeLeaveBalanceByType`,
    args
  ) as Promise<GetLeaveBalanceDetailsResponse>;
};

export const getLeaveRequestDetails = async (requestId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeLeaveDetail/${requestId}`
  ) as Promise<GetLeaveRequestDetailsResponse>;
};

export const isReportingManger = async (empId: number) => {
  return httpInstance.get(
    `${baseRoute}/IsReportingManagerExist/${empId}`
  ) as Promise<GetIsReportingManager>;
};
export const applyLeaveSwap = async (args: ApplyLeaveSwapArgs) => {
  return httpInstance.post(
    `${baseRoute}/ApplySwapHoliday`,args
  ) as Promise<ApplyLeaveSwapResponse>;
};
export const applyCompOff = async (args: ApplyLeaveCompOffArgs) => {
  return httpInstance.post(
    `${baseRoute}/ApplyCompOff`,args
  ) as Promise<ApplyLeaveCompOffArgs>;
};
export const getPersonalizedHolidayList = async (empId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetPersonalizedHolidayList/${empId}`
  ) as Promise<GetHolidayResponse>;
}
export const getAdjustedLeavesByEmployee = async (employeeId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetAllAdjustedLeaveByEmployee/${employeeId}`
  ) as Promise<GetAdjustedLeavesResponse>;
};
