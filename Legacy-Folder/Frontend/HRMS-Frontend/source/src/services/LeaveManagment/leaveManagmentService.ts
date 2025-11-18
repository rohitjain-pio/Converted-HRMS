import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  ApproveOrRejectCompOffAndSwapArgs,
  ApproveOrRejectCompOffAndSwapResponse,
  GetAccrualsUtilizedRequest,
  GetAccrualsUtilizedResponse,
  GetCalendarLeavesPayload,
  GetCompOffSwapHolidayArgs,
  getEmployeeLeaveArgs,
  GetEmployeeLeaveByIdResponse,
  GetEmployeeLeaveTypesResponse,
  GetLeaveBalancesResponse,
  GetLeaveCalendarResponse,
  GetLeaveCompOffResponse,
  ImportEmployeesLeaveResponse,
  LeaveManagementResponse,
  UpdateLeaveArgs,
  UpdateLeaveRequest,
  UpdateLeaveResponse,
} from "@/services/LeaveManagment/types";

const baseRoute = "/LeaveManagement";

export const getAccrualsUtilized = async (
  id: string,
  payload: GetAccrualsUtilizedRequest
): Promise<GetAccrualsUtilizedResponse> => {
  return httpInstance.post(
    `${baseRoute}/GetAccrualsUtilized/${id}`,
    payload
  ) as Promise<GetAccrualsUtilizedResponse>;
};

export const getEmployeeLeaveById = async (
  employeeId: number
): Promise<GetEmployeeLeaveByIdResponse> => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeLeaveById/${employeeId}`
  ) as Promise<GetEmployeeLeaveByIdResponse>;
};

export const updateLeaves = async (
  payload: UpdateLeaveRequest
): Promise<UpdateLeaveResponse> => {
  return httpInstance.post(
    `${baseRoute}/UpdateLeaves`,
    payload
  ) as Promise<UpdateLeaveResponse>;
};

export const getLeaveBalances = async (employeeId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeLeaveBalanceById/${employeeId}`
  ) as Promise<GetLeaveBalancesResponse>;
};
export const acceptOrRejectLeave = async (args: UpdateLeaveArgs) => {
  return httpInstance.post(
    `${baseRoute}/ApproveOrRejectLeave`,
    args
  ) as Promise<UpdateLeaveResponse>;
};
export const getEmployeeLeaves = async (args: getEmployeeLeaveArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEmployeeLeaveRequest`,
    args
  ) as Promise<LeaveManagementResponse>;
};
export const importEmployeesLeaveData = async (
  file: File,
  isImportConfirmed: boolean
) => {
  const payload = objectToFormData({ leaveExcelFile: file });
  return httpInstance.post(
    `${baseRoute}/ImportLeaveExcel?importConfirmed=${isImportConfirmed}`,
    payload
  ) as Promise<ImportEmployeesLeaveResponse>;
};

export const getEmployeeLeaveTypes = async () => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeLeaveTypes`
  ) as Promise<GetEmployeeLeaveTypesResponse>;
};

export const getCalendarLeaves = async (payload: GetCalendarLeavesPayload) => {
  return httpInstance.post(
    "/LeaveManagement/GetCalendarLeaves",
    payload
  ) as Promise<GetLeaveCalendarResponse>;
};
export const getCompOffAndSwapHolidayList = async (
  args: GetCompOffSwapHolidayArgs
) => {
  return httpInstance.post(
    `${baseRoute}/GetCompOffAndSwapHolidayDetails`,
    args
  ) as Promise<GetLeaveCompOffResponse>;
};
export const approveOrRejectCompOffAndSwap = async (
  args: ApproveOrRejectCompOffAndSwapArgs
) => {
  return httpInstance.post(
    `${baseRoute}/ApproveOrRejectCompOffSwapHoliday`,
    args
  ) as Promise<ApproveOrRejectCompOffAndSwapResponse>;
};
