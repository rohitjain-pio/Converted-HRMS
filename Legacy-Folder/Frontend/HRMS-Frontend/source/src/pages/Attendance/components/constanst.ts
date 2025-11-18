import moment from "moment";
import { EmployeeReportSearchFilter } from "@/pages/Attendance/types";

export const DEFAULT_EMPLOYEE_ATTENDANCE_REPORT_FILTER: EmployeeReportSearchFilter = {
  branchId: 0,
  departmentId: 0,
  dateFrom:moment().subtract(7, "days"),
  dateTo:moment()
};