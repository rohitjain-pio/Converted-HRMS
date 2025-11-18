export interface AttendanceAudit {
  action: string;
  time: string;
  comment: string;
  response?: string;
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
}

export type AttendanceConfigFilter = {
  employeeCode?: string;
  // employeeEmail?: string;
  departmentId?: number;
  designationId?: number;
  branchId?: number;
  countryId?: number;
  isManualAttendance?: boolean | null;
  dojFrom?: string | null;
  dojTo?: string | null;
};
export interface AttendanceConfigFilterPayload {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: AttendanceConfigFilter;
}
export interface EmployeeReportFilter {
  startIndex: number;
  pageSize: number;
  filters: {
    dateTo?: string | null;
    dateFrom?: string | null;
    employeeName?: string | null;
    employeeCode?: string | null;
    employeeCodes?: string[] | null;
    branchId?: number | null;
    departmentId?: number | null;
  };
}
