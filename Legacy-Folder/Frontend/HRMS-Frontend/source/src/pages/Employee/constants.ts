import { EmployeeSearchFilter } from "@/services/Employees";

export const DEFAULT_EMPLOYEE_FILTERS: EmployeeSearchFilter = {
  departmentId: 0,
  designationId: 0,
  roleId: 0,
  employeeStatus: 0,
  employmentStatus: 0,
  branchId: 0,
  dojFrom: null,
  dojTo: null,
  countryId: 0,
};
