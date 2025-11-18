import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  ExportEmployeesDataArgs,
  GetDepartmentListResponse,
  GetEmployeeListArgs,
  GetEmployeeListResponse,
  GetTeamListResponse,
  ImportEmployeesDataResponse,
} from "@/services/Employees/types";

const baseRoute = "/Employee";

export const getEmployeeList = async (payload: GetEmployeeListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEmployees`,
    payload
  ) as Promise<GetEmployeeListResponse>;
};

export const getDepartmentList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetDepartmentList`
  ) as Promise<GetDepartmentListResponse>;
};

export const exportEmployeesData = async (payload: ExportEmployeesDataArgs) => {
  return httpInstance.post(`${baseRoute}/export`, payload, {
    responseType: "blob",
  }) as Promise<Blob>;
};

export const importEmployeesData = async (
  file: File,
  isImportConfirmed: boolean
) => {
  const payload = objectToFormData({ excefile: file });
  return httpInstance.post(
    `${baseRoute}/ImportExcel?importConfirmed=${isImportConfirmed}`,
    payload
  ) as Promise<ImportEmployeesDataResponse>;
};

export const getTeamList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetTeamList`
  ) as Promise<GetTeamListResponse>;
};
