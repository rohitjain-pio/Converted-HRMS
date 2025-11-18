import { httpInstance } from "@/api/httpInstance";
import {
  AddDesignationArgs,
  AddDesignationResponse,
  GetDesignationByIdResponse,
  GetDesignationListArgs,
  GetDesignationListResponse,
  UpdateDesignationArgs,
  UpdateDesignationStatusArgs,
  UpdateDesignationStatusResponse,
} from "@/services/Designation/types";

const baseRoute = "/UserProfile";

export const getDesignationList = async (payload: GetDesignationListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetDesignation`,
    payload
  ) as Promise<GetDesignationListResponse>;
};

export const addDesignation = async (args: AddDesignationArgs) => {
  return httpInstance.post(`${baseRoute}/AddDesignation`, args) as Promise<
    AddDesignationResponse
  >;
};

export const getDesignationById = async (id: number) => {
  return httpInstance.get(`${baseRoute}/GetDesignationById?id=${id}`) as Promise<
    GetDesignationByIdResponse
  >;
};

export const updateDesignation = async (args: UpdateDesignationArgs) => {
  return httpInstance.post(`${baseRoute}/EditDesignation`, args) as Promise<
    AddDesignationResponse
  >;
};

export const updateDesignationStatus = async (args: UpdateDesignationStatusArgs) => {
  return httpInstance.delete(`${baseRoute}/ArchiveUnarchiveDesignation`, {data: args}) as Promise<
    UpdateDesignationStatusResponse
  >;
};
