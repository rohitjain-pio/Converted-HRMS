import {
  employeesGoalListFilter,
  KPIGoalRequestFilter,
} from "@/services/KPI/types";

export const DEFAULT_KPI_GOAL_FILTERS: KPIGoalRequestFilter = {
  title: null,
  departmentId: null,
  createdOnFrom: null,
  createdOnTo: null,
  createdBy: null,
};
export const DEFAULT_EMPLOYEE_GOAL_FILTERS: employeesGoalListFilter = {
  appraisalDateFrom: undefined,
  appraisalDateTo: undefined,
  reviewDateFrom: undefined,
  reviewDateTo: undefined,
  statusFilter: null
};
