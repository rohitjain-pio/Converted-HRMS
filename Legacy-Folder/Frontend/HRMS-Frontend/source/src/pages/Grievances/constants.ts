import { AdminReportGrievanceFilter, GetEmployeeGrievanceFilter } from "@/services/Grievances";

export const DEFAULT_EMPLOYEE_GRIEVANCE_FILTERS: GetEmployeeGrievanceFilter = {
  grievanceTypeId: null,
  status: null,
};
export const DEFAULT_ADMIN_REPORT_GRIEVANCE_FILTERS:AdminReportGrievanceFilter={
  grievanceTypeId:null,
  status:null,
  resolvedBy:null,
  createdOnFrom:null,
  createdOnTo:null,
  resolvedDate:null,
  level:null
}