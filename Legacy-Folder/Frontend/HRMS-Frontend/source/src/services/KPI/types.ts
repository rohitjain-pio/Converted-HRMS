import { Quarter } from "@/utils/constants";

export type GoalRating = {
  employeeCode: string;
  employeeId: number;
  planId: number;
  goalId: number;
  goalTitle: string;
  lastAppraisal: string | null;
  nextAppraisal: string | null;
  q1_Rating: number | null;
  q2_Rating: number | null;
  q3_Rating: number | null;
  q4_Rating: number | null;
  q1_Note: string | null;
  q2_Note: string | null;
  q3_Note: string | null;
  q4_Note: string | null;
  managerRating: number | null;
  managerNote: string | null;
  targetExpected: number | null;
  status: null | boolean;
  allowedQuarter: string;
};

export type GetEmployeeSelfRatingResponse = {
  statusCode: number;
  message: string;
  result: [
    {
      employeeCode: string;
      employeeId: number;
      employeeName: string;
      isReviewed: boolean | null;
      email: string;
      joiningDate: string;
      planId: number;
      reviewDate:string|null;
      lastReviewDate: string | null;
      nextAppraisal: string | null;
      ratings: GoalRating[];
    },
  ];
};

export type UpdateSelfRatingPayload = {
  goalId: number;
  planId: number;
  note: string | null;
  quarter: Quarter;
  rating: number;
};

export type UpdateSelfRatingResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type SubmitKPIPlanResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type UpsertRequestGoal = {
  title: string;
  description: string;
  departmentId: number;
  employeeId: number;
  id: number;
  employeeIds: string;
};

export type UpsertGoalResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetGoalByIdResponse = {
  statusCode: number;
  message: string;
  result: goalData;
};

export type goalData = {
  title: string;
  description: string;
  departmentId: number;
  employeeId: number;
  goalId: number;
  employeeIds: string;
};

export type goalList = {
  id: string;
  title: string;
  description: string;
  department: string;
  createdOn: Date;
  createdBy: string;
};

export type GetGoalListResponse = {
  statusCode: number;
  message: string;
  result: {
    totalRecords: number;
    goalList: goalList[];
  };
};

export type GetGoalListArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: KPIGoalRequestFilter;
};

export interface KPIGoalRequestFilter {
  title?: string | null;
  departmentId?: number | null;
  createdOnFrom?: string | null;
  createdOnTo?: string | null;
  createdBy?: string | null;
}
export type DeleteGoalResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type getEmployeesGoalResponse = {
  statusCode: number;
  message: string;
  result: {
    totalRecords: number;
    goalList: employeesGoalList[];
  };
};

export type employeesGoalList = {
  employeeId: number;
  employeeName: string;
  email: string;
  reviewDate: string | null;
  isReviewed: boolean | null;
  joiningDate: string;
  lastReviewDate?: string;
  nextAppraisal?: string;
  planId: number;
  employeeCode: string;
};
export type employeesGoalListFilter = {
  appraisalDateFrom?: string;
  appraisalDateTo?: string;
  reviewDateFrom?: string;
  reviewDateTo?: string;
  employeeCode?: string;
  statusFilter: number | null;
};

export type GetEmployeesGoalArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: employeesGoalListFilter;
};

export type GetEmployeesByManagerResponse = {
  statusCode: number;
  message: string;
  result: {
    id: number;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    employeeCode: string;
  }[];
};

export type updateManagerRating = {
  planId: number;
  goalId: number;
  managerRating: number;
  managerNote: string | null;
};

export interface UpdateManagerRatingResponse {
  statusCode: number;
  message: string;
  result: number;
}

export interface KPIGoalRequestFilter {
  title?: string | null;
  departmentId?: number | null;
  createdOnFrom?: string | null;
  createdOnTo?: string | null;
  createdBy?: string | null;
}
export interface AssignGoalByManagerResponse {
  statusCode: number;
  message: string;
  result: number;
}

export interface AssignGoalByManagerRequest {
  goalId: number;
  employeeId: number;
  allowedQuarter?: string;
  targetExpected?: string;
  planId?: number | null;
}
export type SubmitManagerReviewResponse = {
  statusCode: number;
  message: string;
  result: number;
};
export type ManagerRatingHistoryRequest = {
  planId:number
  goalId:number
};
export type GetManagerRatingHistoryResponse = {
  statusCode: number;
  message: string;
  result: ManagerRatingHistory[];
};

export type ManagerRatingHistory= {
  managerId: number;
  managerName?: string;
  managerRating?: number;
  managerComment?: string;
  createdOn: string; 
}

export type GetEmployeeRatingByManager = {
  employeeCode: string;
  employeeName: string;
  joiningDate: string;
  email: string;
  employeeId: number;
  ratings: PlanRating[];
};

export type PlanRating = {
  planId: number;
  reviewDate: string;
  isReviewed: boolean;
  joiningDate: string;
  lastAppraisal: string;
  nextAppraisal: string;
  goals: GoalRating[];
};
export type GetEmployeeRatingByManagerResponse = {
  statusCode: number;
  message: string;
  result: GetEmployeeRatingByManager[];
};
