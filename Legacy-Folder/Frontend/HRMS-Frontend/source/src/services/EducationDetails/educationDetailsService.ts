import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  AddEducationDetailApiResponse,
  AddEducationDetailArgs,
  DeleteEducationDetailApiResponse,
  DownloadEducationalDocumentApiResponse,
  GetEducationDetailByIdApiResponse,
  GetEducationDetailsApiResponse,
  GetEducationDetailsArgs,
  GetQualificationListApiResponse,
  GetUniversityListApiResponse,
  UpdateEducationDetailArgs,
} from "@/services/EducationDetails/types";

const baseRoute = "/UserProfile";

export const getEducationDetails = async (args: GetEducationDetailsArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetEducationalDocuments`,
    args
  ) as Promise<GetEducationDetailsApiResponse>;
};

export const deleteEducationDetail = async (id: number) => {
  return httpInstance.delete(
    `${baseRoute}/DeleteEducationalDetails/${id}`
  ) as Promise<DeleteEducationDetailApiResponse>;
};

export const getQualificationList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetQualificationList`
  ) as Promise<GetQualificationListApiResponse>;
};

export const getUniversityList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetUniversitiesList`
  ) as Promise<GetUniversityListApiResponse>;
};

export const addEducationDetail = async (args: AddEducationDetailArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/AddEducationalDetails`,
    formData
  ) as Promise<AddEducationDetailApiResponse>;
};

export const getEducationDetailById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEducationalDetailsById/${id}`
  ) as Promise<GetEducationDetailByIdApiResponse>;
};

export const updateEducationDetail = async (
  args: UpdateEducationDetailArgs
) => {
  const formData = objectToFormData(args);
  return httpInstance.put(
    `${baseRoute}/EditEducationalDetails`,
    formData
  ) as Promise<AddEducationDetailApiResponse>;
};

export const downloadEducationDetailDocument = async (args: string) => {
  return httpInstance.get(
    `${baseRoute}/DownloadEducationalDocument?fileName=${args}`
  ) as Promise<DownloadEducationalDocumentApiResponse>;
};
