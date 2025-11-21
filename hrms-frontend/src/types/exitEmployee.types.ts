export interface ExitEmployeeListItem {
  resignationId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  branchName: string;
  resignationDate: string;
  lastWorkingDay: string;
  earlyReleaseRequest: boolean;
  earlyReleaseDate: string | null;
  earlyReleaseApprove: boolean | null;
  resignationStatus: number;
  employeeStatus: number;
  employmentStatus: number;
  ktStatus: number;
  exitInterviewStatus: boolean;
  itNoDue: boolean;
  accountsNoDue: boolean;
  reportingManagerName: string;
}

export interface ExitEmployeeSearchFilter {
  employeeCode?: string;
  employeeName?: string;
  resignationStatus: number;
  branchId: number;
  departmentId: number;
  itNoDue: boolean | null;
  accountsNoDue: boolean | null;
  lastWorkingDayFrom: string | null;
  lastWorkingDayTo: string | null;
  resignationDate: string | null;
  employeeStatus: number;
}

export interface GetExitEmployeeListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: ExitEmployeeSearchFilter;
}

export interface GetExitEmployeeListResponse {
  statusCode: number;
  message: string;
  result: {
    exitEmployeeList: ExitEmployeeListItem[];
    totalRecords: number;
  };
}

export interface ExitDetails {
  resignationId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  branchName: string;
  resignationDate: string;
  lastWorkingDay: string;
  earlyReleaseDate: string | null;
  earlyReleaseStatus: number;
  resignationStatus: number;
  employeeStatus: number;
  employmentStatus: number;
  ktStatus: boolean;
  exitInterviewStatus: boolean;
  itNoDue: boolean;
  accountsNoDue: boolean;
  reportingManagerName: string;
  jobType: number;
  reason: string;
  rejectResignationReason: string;
  rejectEarlyReleaseReason: string;
}

export interface GetExitDetailsResponse {
  statusCode: number;
  message: string;
  result: ExitDetails;
}
