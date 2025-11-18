import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  AddGrievanceTypeApiResponse,
  GrievanceTypeRequestArgs,
  DeleteGrievanceTypeApiResponse,
  GetGrievanceResponseById,
  UpdateGrievanceTypeApiResponse,
  GetEmployeeGrievanceDetailResponse,
  GetEmployeeGrievancePayload,
  GetEmployeeGrievanceResponse,
  GetGrievanceTypesResponse,
  SubmitGrievancePayload,
  SubmitGrievanceResponse,
  GetGrievanceTicketRemarksResponse,
  AddGrievanceRemarksPayload,
  AddGrievanceRemarksResponse,
  AddRemarksAllowedParams,
  AddRemarksAllowedResponse,
  GetAdminReportArgs,
  GetAdminReportGrievanceResponse,
  GetAllGrievanceTypeList,
  GrievanceViewAllowedResponse,
} from "@/services/Grievances/types";

const baseRoute = "/Grievance";

export const getGrievanceData = async () => {
  return httpInstance.get(
    `${baseRoute}/GetAllGrievancesList`
  ) as Promise<GetGrievanceTypesResponse>;
};
export const addGrievanceType = async (args: GrievanceTypeRequestArgs) => {
  return httpInstance.post(
    `${baseRoute}/AddGrievance`,
    args
  ) as Promise<AddGrievanceTypeApiResponse>;
};
export const updateGrievanceType = async (args: GrievanceTypeRequestArgs) => {
  return httpInstance.post(
    `${baseRoute}/UpdateGrievance`,
    args
  ) as Promise<UpdateGrievanceTypeApiResponse>;
};
export const getGrievanceTypeById = async (grievanceId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetGrievanceTypeById/${grievanceId}`
  ) as Promise<GetGrievanceResponseById>;
};
export const deleteGrievance = async (id: number) => {
  return httpInstance.post(
    `${baseRoute}/DeleteGrievance/${id}`
  ) as Promise<DeleteGrievanceTypeApiResponse>;
};

export const getEmployeeGrievance = async (
  employeeId: number,
  payload: GetEmployeeGrievancePayload
) => {
  return httpInstance.post(
    `${baseRoute}/GetEmployeeGrievancesById/${employeeId}`,
    payload
  ) as Promise<GetEmployeeGrievanceResponse>;
};

export const getGrievanceTypes = async () => {
  return httpInstance.get(
    `${baseRoute}/GetAllGrievancesList`
  ) as Promise<GetGrievanceTypesResponse>;
};

export const submitGrievance = async (payload: SubmitGrievancePayload) => {
  const formData = objectToFormData(payload);
  return httpInstance.post(
    `${baseRoute}/SubmitGrievance`,
    formData
  ) as Promise<SubmitGrievanceResponse>;
};

export const getEmployeeGrievanceDetail = async (grievanceId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeGrievancesDetail/${grievanceId}`
  ) as Promise<GetEmployeeGrievanceDetailResponse>;
};

export const getGrievanceTicketRemarks = async (ticketId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeGrievanceRemarksDetail/${ticketId}`
  ) as Promise<GetGrievanceTicketRemarksResponse>;
};

export const addGrievanceTicketRemarks = async (
  payload: AddGrievanceRemarksPayload
) => {
  const formData = objectToFormData(payload);

  return httpInstance.post(
    `${baseRoute}/UpdateEmployeeGrievanceRemarks`,
    formData
  ) as Promise<AddGrievanceRemarksResponse>;
};

export const addRemarksAllowed = async (params: AddRemarksAllowedParams) => {
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    urlSearchParams.append(key, String(value));
  }

  const queryStr = urlSearchParams.toString();

  return httpInstance.get(
    `${baseRoute}/UpdateRemarksAllowed?${queryStr}`
  ) as Promise<AddRemarksAllowedResponse>;
};
export const getAdminReport = async (args: GetAdminReportArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetAllEmployeeGrievances`,
    args
  ) as Promise<GetAdminReportGrievanceResponse>;
};
export const ExportGrievanceReport = async (args: GetAdminReportArgs) => {
  return httpInstance.post(`${baseRoute}/ExportGrievanceReport`, args, {
    responseType: "blob",
  }) as Promise<Blob>;
};

export const getGrievanceTypeList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetAllGrievanceTypeList`
  ) as Promise<GetAllGrievanceTypeList>;
};

export const getGrievanceViewAllowed = async (grievanceId: number) => {
  return httpInstance.get(
    `${baseRoute}/GrievanceViewAllowed/${grievanceId}`
  ) as Promise<GrievanceViewAllowedResponse>;
};
