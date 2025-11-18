import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import { AddUserDocumentArgs, AddUserDocumentResponse, DownloadUserDocumentResponse, GetUserDocumentListResponse, GetGovtDocumentApiResponse, GetUserDocumentByIdResponse, UpdateUserDocumentArgs } from "@/services/Documents/types";

const baseRoute = "/UserProfile";

export const getGovtDocumentTypes = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GovtDocumentList/${id}`
  ) as Promise<GetGovtDocumentApiResponse>;
};

export const getUserDocumentList = async (employeeId: number) => {
  return httpInstance.get(`${baseRoute}/GetUserDocumentList/${employeeId}`) as Promise<
    GetUserDocumentListResponse
  >;
};

export const addUserDocument = async (args: AddUserDocumentArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/UploadUserDocument`,
    formData
  ) as Promise<AddUserDocumentResponse>;
};

export const getUserDocumentById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetUserDocumentById/${id}`
  ) as Promise<GetUserDocumentByIdResponse>;
};

export const downloadUserDocument = async (fileName: string) => {
  return httpInstance.get(
    `${baseRoute}/DownloadUserDocument?filename=${fileName}`
  ) as Promise<DownloadUserDocumentResponse>;
};

export const updateUserDocument = async (args: UpdateUserDocumentArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/UpdateUploadUserDocument`,
    formData
  ) as Promise<AddUserDocumentResponse>;
};