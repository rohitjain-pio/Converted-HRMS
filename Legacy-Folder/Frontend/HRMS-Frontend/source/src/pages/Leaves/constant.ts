import { Leave_CompOffArgs } from "@/services/LeaveManagment";
import { LeaveStatus } from "@/utils/constants";

export const DEFAULT_LEAVE_REQUEST_FILTER:Leave_CompOffArgs={
    workingDate: null,
    status: LeaveStatus.Pending,
    type: null
}

