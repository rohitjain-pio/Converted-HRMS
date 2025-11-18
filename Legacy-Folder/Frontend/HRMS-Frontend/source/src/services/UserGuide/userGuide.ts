import { httpInstance } from "@/api/httpInstance";
import {
  AddUserGuidePayload,
  AddUserGuideResponse,
  DeleteUserGuideResponse,
  GetMenusResponse,
  GetUserGuideByIdResponse,
  GetUserGuideListPayload,
  GetUserGuideListResponse,
  UpdateUserGuidePayload,
  UpdateUserGuideResponse,
} from "./types";

const baseRoute = "/UserGuide";

export const getMenus = async () => {
  return httpInstance.get(
    `${baseRoute}/GetAllMenu`
  ) as Promise<GetMenusResponse>;
};

export const getUserGuideById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetUserGuideById/${id}`
  ) as Promise<GetUserGuideByIdResponse>;
};

export const addUserGuide = async (payload: AddUserGuidePayload) => {
  return httpInstance.post(
    `${baseRoute}/AddUserGuide`,
    payload
  ) as Promise<AddUserGuideResponse>;
};

export const updateUserGuide = async (payload: UpdateUserGuidePayload) => {
  return httpInstance.post(
    `${baseRoute}/UpdateUserGuide`,
    payload
  ) as Promise<UpdateUserGuideResponse>;
};

export const getUserGuideList = async (payload: GetUserGuideListPayload) => {
  return httpInstance.post(
    `${baseRoute}/GetAllUserGuide`,
    payload
  ) as Promise<GetUserGuideListResponse>;
};

export const deleteUserGuideById = async (userGuideId: number) => {
  return httpInstance.post(
    `${baseRoute}/DeleteUserGuideById?UserGuideId=${userGuideId}`
  ) as Promise<DeleteUserGuideResponse>;
};
