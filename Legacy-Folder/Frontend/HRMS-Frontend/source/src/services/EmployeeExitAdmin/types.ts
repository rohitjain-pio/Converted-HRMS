import { BranchLocation, EmployeeStatus } from "@/utils/constants";

export type ExitEmployeeListItem = {
  resignationId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  resignationDate: string;
  lastWorkingDay: string;
  earlyReleaseRequest: boolean;
  earlyReleaseDate: string | null;
  earlyReleaseApprove: boolean | null;
  resignationStatus: number;
  employeeStatus: EmployeeStatus;
  employmentStatus: number;
  ktStatus: number;
  exitInterviewStatus: boolean;
  itNoDue: boolean;
  accountsNoDue: boolean;
  reportingManagerName: string;
  branchId: BranchLocation;
};

export type ExitEmployeeList = ExitEmployeeListItem[];

export type GetExitEmployeeListResponse = {
  statusCode: number;
  message: string;
  result: {
    exitEmployeeList: ExitEmployeeList;
    totalRecords: number;
  };
};

export type ExitEmployeeSearchFilter = {
  employeeCode?: string;
  employeeName?: string;
  resignationStatus: number;
  branchId: number;
  departmentId: number;
  itNoDue: null | boolean;
  accountsNoDue: null | boolean;
  lastWorkingDayFrom: null | string;
  lastWorkingDayTo: null | string;
  resignationDate: null | string;
  employeeStatus: number;
};

export type GetExitEmployeeListArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: ExitEmployeeSearchFilter;
};

export type ExitDetails = {
  resignationId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  resignationDate: string;
  lastWorkingDay: string;
  earlyReleaseDate: string | null;
  earlyReleaseStatus: number;
  resignationStatus: number;
  employeeStatus: EmployeeStatus;
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
};

export type GetExitDetailsResponse = {
  statusCode: number;
  message: string;
  result: ExitDetails;
};

export type RejectResignationOrEarlyReleaseArgs = {
  resignationId: number;
  rejectionType: "resignation" | "earlyrelease";
  rejectReason: string | null;
};

export type RejectResignationOrEarlyReleaseResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type AcceptEarlyReleaseArgs = {
  resignationId: number;
  earlyReleaseDate: string;
};

export type AcceptEarlyReleaseResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type AcceptResignationResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type UpdateLastWorkingDayArgs = {
  resignationId: number;
  lastWorkingDay: string;
};

export type UpdateLastWorkingDayResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type ITClearanceDetails = {
  resignationId: number;
  accessRevoked: boolean;
  assetReturned: boolean;
  assetCondition: number;
  attachmentUrl: string;
  note: string;
  itClearanceCertification: boolean;
};

export type GetITClearanceDetailsResponse = {
  statusCode: number;
  message: string;
  result: ITClearanceDetails | null;
};

export type UpsertITClearanceDetailsArgs = {
  employeeId: number;
  resignationId: number;
  accessRevoked: boolean;
  assetReturned: boolean;
  assetCondition: number;
  attachmentUrl: File | string;
  note: string;
  itClearanceCertification: boolean;
};

export type UpsertITClearanceDetailsResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type GetHRClearanceByResignationIdResponse = {
  statusCode: number;
  message: string;
  result: HrClearanceDetails;
};

export type UpsertHRClearanceArgs = {
  employeeId: number;
  resignationId: number;
  advanceBonusRecoveryAmount: number;
  serviceAgreementDetails: string;
  currentEL: number;
  numberOfBuyOutDays: number;
  attachment: File | string;
  exitInterviewStatus: boolean;
  exitInterviewDetails: string;
};
export type DepartmentClearanceArgs = {
  employeeId: number;
  resignationId: number;
  ktStatus: boolean;
  ktNotes: string;
  attachment: "";
  ktUsers: string[];
};
export type HrClearanceDetails = {
  resignationId: number;
  advanceBonusRecoveryAmount: number;
  serviceAgreementDetails: string;
  currentEL: number;
  numberOfBuyOutDays: number;
  attachment: "";
  exitInterviewStatus: boolean;
  exitInterviewDetails: string;
};
export type UpsertHRClearanceResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type GetDepartmentClearanceByResignationIdResponse = {
  statusCode: number;
  message: string;
  result: GetDepartmentClearanceByResignationId;
};
export type GetDepartmentClearanceByResignationId = {
  resignationId: number;
  ktStatus: number;
  ktNotes: string;
  attachment: string;
  ktUsers: number[];
};

export type UpsertDepartmentClearanceArgs = {
  employeeId: number;
  resignationId: number;
  ktStatus: number;
  ktNotes: string;
  attachment: File | string;
  ktUsers: number[];
};

export type UpsertDepartmentClearanceResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type AccountClearanceDetails = {
  resignationId: number;
  fnFStatus: boolean;
  fnFAmount: number | null;
  issueNoDueCertificate: boolean;
  note: string;
  accountAttachment: string | null;
};

export type GetAccountClearanceDetailsResponse = {
  statusCode: number;
  message: string;
  result: AccountClearanceDetails | null;
};

export type UpsertAccountClearanceDetailsArgs = {
  employeeId: number;
  resignationId: number;
  fnFStatus: boolean;
  fnFAmount: number | null;
  issueNoDueCertificate: boolean;
  note: string;
  accountAttachment: File | null | string;
};

export type UpsertAccountClearanceDetailsResponse = {
  statusCode: number;
  message: string;
  result: string;
};
