import { httpInstance } from "@/api/httpInstance";
import {
  CreateEventResponse,
  DeleteEventResponse,
  GetEventCategoryListResponse,
  GetEventListArgs,
  GetEventListResponse,
  GetEventStatusListResponse,
  GetEventResponse,
  DeleteEventDocumentResponse,
  UpdateEventStatusResponse,
} from "@/services/Events/types";

const baseRoute = "/Event";

export const getEventList = async (args: GetEventListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEvents`,
    args
  ) as Promise<GetEventListResponse>;
};

export const getEvent = async (id: number) => {
  return httpInstance.get(`${baseRoute}/${id}`) as Promise<GetEventResponse>;
};

export const deleteEvent = async (eventId: number) => {
  return httpInstance.delete(
    `${baseRoute}/${eventId}`
  ) as Promise<DeleteEventResponse>;
};

export const getEventCategoryList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetEventCategoryList`
  ) as Promise<GetEventCategoryListResponse>;
};

export const getEventStatusList = async () => {
  return httpInstance.get(
    `/Survey/GetSurveyStatusList`
  ) as Promise<GetEventStatusListResponse>;
};

export const createEvent = async (args: FormData) => {
  return httpInstance.post(
    `${baseRoute}/CreateEvent`,
    args
  ) as Promise<CreateEventResponse>;
};

export const updateEvent = async (args: FormData) => {
  return httpInstance.post(
    `${baseRoute}/UpdateEvent`,
    args
  ) as Promise<CreateEventResponse>;
};

export const deleteEventDocument = async (documentId: number) => {
  return httpInstance.delete(
    `${baseRoute}/DeleteEventDocument/${documentId}`
  ) as Promise<DeleteEventDocumentResponse>;
};

export const updateEventStatus = async (eventId: number, args: FormData) => {
  return httpInstance.post(
    `${baseRoute}/UpdateEventStatus/${eventId}`,
    args
  ) as Promise<UpdateEventStatusResponse>;
};
