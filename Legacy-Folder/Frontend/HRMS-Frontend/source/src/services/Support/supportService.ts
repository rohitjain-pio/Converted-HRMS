import { httpInstance } from "@/api/httpInstance";
import { AddFeedBackRequestArgs, AddFeedBackResponse, GetEmployeeFeedBackList, GetEmployeeFeedbackListArgs, GetFeedbackById, GetFeedBackList, GetFeedbackListArgs, UpdateStatusFeedBack, UpdateStatusFeedBackArgs } from "./types";
import { objectToFormData } from "@/utils/formData";

const baseRoute = "/Feedback";
export const addFeedBack = async (args: AddFeedBackRequestArgs) => {
   const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/AddFeedBack`,
    formData
  ) as Promise<AddFeedBackResponse>;
};
export const getFeedBackDetails = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetFeedbackById/${id}`,
  ) as Promise<GetFeedbackById>;
};
export const getFeedBackList = async (args: GetFeedbackListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetFeedbackList`,args
  ) as Promise<GetFeedBackList>;
};
export const getEmployeeFeedBackList = async (args: GetEmployeeFeedbackListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetFeedbackByEmployee`,args
  ) as Promise<GetEmployeeFeedBackList>;
};
export const updateFeedBackStatus = async (args: UpdateStatusFeedBackArgs) => {
  return httpInstance.post(
    `${baseRoute}/ModifyFeedbackStatus`,args
  ) as Promise<UpdateStatusFeedBack>;
};
