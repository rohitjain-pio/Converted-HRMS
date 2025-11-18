import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  AcceptEarlyReleaseArgs,
  AcceptEarlyReleaseResponse,
  AcceptResignationResponse,
  GetAccountClearanceDetailsResponse,
  GetExitDetailsResponse,
  GetExitEmployeeListArgs,
  GetExitEmployeeListResponse,
  GetITClearanceDetailsResponse,
  GetHRClearanceByResignationIdResponse,
  RejectResignationOrEarlyReleaseArgs,
  RejectResignationOrEarlyReleaseResponse,
  UpdateLastWorkingDayArgs,
  UpdateLastWorkingDayResponse,
  UpsertAccountClearanceDetailsArgs,
  UpsertAccountClearanceDetailsResponse,
  UpsertITClearanceDetailsArgs,
  UpsertITClearanceDetailsResponse,
  UpsertHRClearanceArgs,
  UpsertHRClearanceResponse,
  GetDepartmentClearanceByResignationIdResponse,
  UpsertDepartmentClearanceArgs,
  UpsertDepartmentClearanceResponse,
} from "@/services/EmployeeExitAdmin/types"

const baseRoute = "/AdminExitEmployee";

export const getExitEmployeeList = async (args: GetExitEmployeeListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetResignationList`,
    args
  ) as Promise<GetExitEmployeeListResponse>;
};

export const getExitDetails = async (resignationId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetResignationById/${resignationId}`
  ) as Promise<GetExitDetailsResponse>;
};

export const rejectResignationOrEarlyRelease = async (
  args: RejectResignationOrEarlyReleaseArgs
) => {
  return httpInstance.post(
    `${baseRoute}/AdminRejection`,
    args
  ) as Promise<RejectResignationOrEarlyReleaseResponse>;
};

export const acceptEarlyRelease = async (args: AcceptEarlyReleaseArgs) => {
  return httpInstance.post(
    `${baseRoute}/AcceptEarlyRelease`,
    args
  ) as Promise<AcceptEarlyReleaseResponse>;
};

export const acceptResignation = async (resignationId: number) => {
  return httpInstance.post(
    `${baseRoute}/AcceptResignation/${resignationId}`
  ) as Promise<AcceptResignationResponse>;
};

export const updateLastWorkingDay = async (args: UpdateLastWorkingDayArgs) => {
  return httpInstance.patch(
    `${baseRoute}/UpdateLastWorkingDay`,
    args
  ) as Promise<UpdateLastWorkingDayResponse>;
};

export const getITClearanceDetails = async (resignationId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetITClearanceDetailByResignationId/${resignationId}`
  ) as Promise<GetITClearanceDetailsResponse>;
};

export const upsertITClearanceDetails = async (
  args: UpsertITClearanceDetailsArgs
) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/AddUpdateITClearance`,
    formData
  ) as Promise<UpsertITClearanceDetailsResponse>;
};

export const getHRClearanceByResignationId = async (resignationId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetHRClearanceByResignationId/${resignationId}`
  ) as Promise<GetHRClearanceByResignationIdResponse>;
};

export const upsertHRClearance = async (args: UpsertHRClearanceArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/UpsertHRClearance`,
    formData
  ) as Promise<UpsertHRClearanceResponse>;
};
export const getDepartmentClearanceByResignationId = async (
  resignationId: number
) => {
  return httpInstance.get(
    `${baseRoute}/GetDepartmentClearanceDetailByResignationId/${resignationId}`
  ) as Promise<GetDepartmentClearanceByResignationIdResponse>;
};
export const upsertDepartmentClearance = async (
  args: UpsertDepartmentClearanceArgs
) => {
  const { ktUsers, ...rest } = args ;
  const formData = objectToFormData(rest);
  if (Array.isArray(ktUsers)) {
    ktUsers.forEach((userId: number) => {
      formData.append('ktUsers', userId.toString());
    });
  }
  return httpInstance.post(
    `${baseRoute}/UpsertDepartmentClearance`,
    formData
  ) as Promise<UpsertDepartmentClearanceResponse>;
};

export const getAccountClearanceDetails = async (resignationId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetAccountClearance/${resignationId}`
  ) as Promise<GetAccountClearanceDetailsResponse>;
};

export const upsertAccountClearanceDetails = async (
  args: UpsertAccountClearanceDetailsArgs
) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/AddUpdateAccountClearance`,
    formData
  ) as Promise<UpsertAccountClearanceDetailsResponse>;
};
