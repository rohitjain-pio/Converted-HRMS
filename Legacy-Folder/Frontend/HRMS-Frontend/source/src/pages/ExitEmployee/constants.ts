import { ExitEmployeeSearchFilter } from "@/services/EmployeeExitAdmin";

export const DEFAULT_EXIT_EMPLOYEE_FILTERS: ExitEmployeeSearchFilter = {
  resignationStatus: 0,
  branchId: 0,
  departmentId: 0,
  itNoDue: null,
  accountsNoDue: null,
  lastWorkingDayFrom: null,
  lastWorkingDayTo: null,
  resignationDate: null,
  employeeStatus: 0,
};
