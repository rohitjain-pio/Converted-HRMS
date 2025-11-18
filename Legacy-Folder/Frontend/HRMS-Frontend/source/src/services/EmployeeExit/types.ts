import { ResignationStatusCode } from "@/utils/constants";

export type ResignationDetails = {
  id: number;
  employeeName: string;
  departmentId: number;
  department: string;
  reportingManagerId: number;
  reportingManagerName: string;
  jobType: number;
};

export type GetResignationFormResponse = {
  statusCode: number;
  message: string;
  result: ResignationDetails;
};

export type AddResignationArgs = {
  employeeId: number;
  departmentId: number;
  reason: string;
  reportingManagerId: number;
  jobType: number;
};

export type AddResignationResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetResignationExitDetails = {
  id: number;
  employeeId: number;
  employeeName: string;
  reason: string;
  department: string;
  reportingManager: string;
  lastWorkingDay: string;
  isActive: boolean;
  status: number;
  earlyReleaseDate: string | null;
  earlyReleaseStatus: number;
  rejectResignationReason: string;
  rejectEarlyReleaseReason: string;
  resignationDate: string;
};

export type GetResignationExitDetailsResponse = {
  statusCode: number;
  message: string;
  result: GetResignationExitDetails;
};

export type RevokeResignationResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type ResignationActiveStatusResponse = {
  statusCode: number;
  message: string;
  result: {
    resignationId: number;
    resignationStatus: ResignationStatusCode;
  } | null;
};

export type RequestEarlyReleaseArgs = {
  resignationId: number;
  earlyReleaseDate: string; // YYYY-MM-DD
};

export type RequestEarlyReleaseResponse = {
  statusCode: number;
  message: string;
  result: number;
};
