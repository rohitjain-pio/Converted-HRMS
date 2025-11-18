import { httpInstance } from "@/api/httpInstance";
import {
  AddDepartmentArgs,
  AddDepartmentResponse,
  GetDepartmentByIdResponse,
  GetDepartmentListArgs,
  GetDepartmentListResponse,
  UpdateDepartmentArgs,
  UpdateDepartmentStatusArgs,
  UpdateDepartmentStatusResponse,
} from "@/services/Department/types";

const baseRoute = "/UserProfile";

export const getDepartmentList = async (payload: GetDepartmentListArgs) => {
  return httpInstance.post(`${baseRoute}/GetDepartments`, payload) as Promise<
    GetDepartmentListResponse
  >;
};

export const addDepartment = async (args: AddDepartmentArgs) => {
  return httpInstance.post(`${baseRoute}/AddDepartment`, args) as Promise<
    AddDepartmentResponse
  >;
};

export const getDepartmentById = async (id: number) => {
  return httpInstance.get(`${baseRoute}/GetDepartmentById?id=${id}`) as Promise<
    GetDepartmentByIdResponse
  >;
};

export const updateDepartment = async (args: UpdateDepartmentArgs) => {
  return httpInstance.post(`${baseRoute}/EditDepartment`, args) as Promise<
    AddDepartmentResponse
  >;
};

export const updateDepartmentStatus = async (
  args: UpdateDepartmentStatusArgs
) => {
  return httpInstance.delete(`${baseRoute}/ArchiveUnarchiveDepartment`, {
    data: args,
  }) as Promise<UpdateDepartmentStatusResponse>;
};
