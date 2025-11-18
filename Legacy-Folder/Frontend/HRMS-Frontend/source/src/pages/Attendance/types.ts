import { BranchLocation } from "@/utils/constants";
import moment from "moment";
import { UseFormReturn } from "react-hook-form";

export interface AttendanceAudit {
  action: string;
  time: string;
  comment: string;
  reason?: string;
}

export interface AttendanceRow {
  id: number;
  date: string;
  startTime: string;
  endTime: string | null;
  day: string;
  location: string;
  totalHours: string;
  audit: AttendanceAudit[];
  createdBy: string;
  modifiedBy: string | null;
  attendanceType: string;
}
export interface TimeInFormData {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  note: string;
  reason: string;
}

export interface AttendanceParams {
  pageIndex: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
}
export interface AttendanceResponse {
  attendaceReport: AttendanceRow[];
  dates: string[];
  isManualAttendance: boolean;
  totalRecords: number;
  isTimedIn: boolean;
}
export interface AttendanceConfig {
  attendanceConfigList: AttendanceConfigResponse[];
  totalRecords: number;
}
export interface AttendanceConfigResponse {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  branch: BranchLocation;
  country: string;
  isManualAttendance: boolean;
  timeDoctorUserId: string | null;
  joiningDate: string | null;
}
export interface AttendanceConfigFilterPayload {
  StartIndex: number;
  PageSize: number;
  Filters: {
    employeeName?: string;
    employeeId?: number;
  };
}

export interface EmployeeReport {
  employeeCode: number;
  employeeName: string;
  totalHour: string;
  branch:number,
  department:string,
  workedHoursByDate: Record<string, string>; 
}

export interface EmployeeReportResult {
  totalRecords: number;
  employeeReports: EmployeeReport[];
}

export interface EmployeeReportApiResponse {
  data: {
    result: EmployeeReportResult;
  };
}
export interface EmployeeReportTableRow {
  employeeCode: number;
  employeeName: string;
  totalHour: string;
  branch:number,
  department:string,
  timeEntries: Record<string, number | undefined>; 
}
export interface GetEmployeeListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: EmployeeReportApiResponse;
}
export interface AllEmployeeOptionType {
  id: string;
  name: string;
}

export interface EditDetails {
  id: number;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  note?: string;
  reason?: string;
  totalHours:string|null
}
export interface EmployeeReportPayload {
  startIndex: number;
  pageSize: number;
  filters: {
    EmployeeName?: string;
    dateFrom?: string | null;
    dateTo?: string | null;
    employeeCode?: string;
    branchId?: string | number | null | undefined;
    departmentId?: string | number | null;
  };
}

export type EmployeeReportSearchFilter = {
  employeeCode?: string;
   dateFrom: moment.Moment | null;
  dateTo: moment.Moment | null;
  branchId: number;
  departmentId: number;
 
};
export interface TimeInProps {
  open: boolean;
  onClose: () => void;
  getDateStatus: (date: string) => string;
  onSubmit: (data: TimeInFormData) => void;
  isLoading: boolean;
  editDetails: EditDetails;
  filledDates: string[];
}
export interface TimeInDialogProps {
  open: boolean;
  onClose: () => void;
  getDateStatus: (date: string) => string;
  onSubmit: (data: TimeInFormData) => void;
  methods:UseFormReturn<TimeInDialogFormValues,  undefined>
  isLoading: boolean;
  editDetails: EditDetails;
  filledDates: string[];
  internalSubmit: (data: TimeInDialogFormValues) => void
  getTotalHours: (startTime: string, endTime: string) => string
}
export interface TimeInDialogFormValues {
  date: moment.Moment;
  startTime?: string;
  endTime?: string;
  location: string;
  note?: string;
  reason?: string;
  totalHours?: string | null;
}
