import { httpInstance } from "@/api/httpInstance";
import {
  AddResignationArgs,
  AddResignationResponse,
  GetResignationExitDetailsResponse,
  GetResignationFormResponse,
  RequestEarlyReleaseArgs,
  RequestEarlyReleaseResponse,
  ResignationActiveStatusResponse,
  RevokeResignationResponse,
} from "@/services/EmployeeExit/types";

const baseRoute = "/ExitEmployee";

export const getResignationForm = async (employeeId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetResignationForm/${employeeId}`
  ) as Promise<GetResignationFormResponse>;
};

export const addResignation = async (args: AddResignationArgs) => {
  return httpInstance.post(
    `${baseRoute}/AddResignation`,
    args
  ) as Promise<AddResignationResponse>;
};

export const getResignationExitDetails = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetResignationDetails/${id}`
  ) as Promise<GetResignationExitDetailsResponse>;
};

export const revokeResignation = async (resignationId: number) => {
  return httpInstance.post(
    `${baseRoute}/RevokeResignation/${resignationId}`
  ) as Promise<RevokeResignationResponse>;
};

export const getResignationActiveStatus = async (employeeId: number) => {
  return httpInstance.get(
    `${baseRoute}/IsResignationExist/${employeeId}`
  ) as Promise<ResignationActiveStatusResponse>;
};

export const requestEarlyRelease = async (args: RequestEarlyReleaseArgs) => {
  return httpInstance.post(
    `${baseRoute}/RequestEarlyRelease`,
    args
  ) as Promise<RequestEarlyReleaseResponse>;
};
