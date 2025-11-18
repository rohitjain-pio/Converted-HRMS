import { httpInstance } from "@/api/httpInstance";
import {
  AddorUpdateNotificationTemplateRequest,
  AddorUpdateNotificationTemplateResponse,
  deleteTemplateResponse,
  GetDefaultNotFicationTemplateById,
  GetNotFicationTemplateById,
  getNotifcationArgs,
  GetNotificationListResponse,
  getTemplateNameList,
  ToggleEmailStatus,
} from "@/services/Notification/type";

const baseRoute = "/NotificationTemplate";
export const getNotifictionTemplateList = async (
  payload: getNotifcationArgs
) => {
  return httpInstance.post(
    `${baseRoute}/GetEmailTemplates`,
    payload
  ) as Promise<GetNotificationListResponse>;
};
export const getNotifictionTemplateById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/${id}`
  ) as Promise<GetNotFicationTemplateById>;
};
export const addNotificationTemplate = async (
  args: AddorUpdateNotificationTemplateRequest
) => {
  return httpInstance.post(
    `${baseRoute}/AddEmailTemplate`,
    args
  ) as Promise<AddorUpdateNotificationTemplateResponse>;
};
export const updateNotificationTemplate = async (
  args: AddorUpdateNotificationTemplateRequest
) => {
  return httpInstance.post(
    `${baseRoute}/UpdateEmailTemplate`,
    args
  ) as Promise<AddorUpdateNotificationTemplateResponse>;
};

export const toggleNotificationTemplateStatus = async (id: number) => {
  return httpInstance.post(`${baseRoute}/ToggleEmailTemplateStatus?id=${id}`)as Promise<ToggleEmailStatus>;
};
export const getDefaultTemplate = async (type: number) => {
  return httpInstance.get(`${baseRoute}/GetDefaultTemplate?type=${type}`)as Promise<GetDefaultNotFicationTemplateById>;
};
export const getTemplateName = async () => {
  return httpInstance.get(`${baseRoute}/GetEmailTemplateNameList`)as Promise<getTemplateNameList>;
};
export const deleteTemplate = async (id:number) => {
  return httpInstance.post(`${baseRoute}/deleteTemplate/${id}`)as Promise<deleteTemplateResponse>;
};
