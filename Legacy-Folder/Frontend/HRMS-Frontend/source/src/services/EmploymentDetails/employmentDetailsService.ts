import { httpInstance } from "@/api/httpInstance";
import { AddEducationDetailApiResponse } from "@/services/EducationDetails";
import {
  AddPreviousEmployerArgs,
  AddProfessionalReferenceArgs,
  DeletePreviousEmployerApiResponse,
  DeletePreviousEmployerDocumentApiResponse,
  DeleteProfessionalReferenceApiResponse,
  DownloadEmployerDocumentApiResponse,
  GetEmployerDocumentTypeListApiResponse,
  GetEmployerDocumentTypeListArgs,
  GetPreviousEmployerByIdApiResponse,
  GetPreviousEmployersApiResponse,
  GetPreviousEmployersArgs,
  GetProfessionalReferenceByIdApiResponse,
  GetReportingManagerListResponse,
  UpdatePreviousEmployerApiResponse,
  UpdatePreviousEmployerArgs,
  UpdateProfessionalReferenceApiResponse,
  UpdateProfessionalReferenceArgs,
  UploadPreviousEmployerDocumentApiResponse,
} from "@/services/EmploymentDetails/types";

const baseRoute = "/UserProfile";

export const getPreviousEmployers = async (args: GetPreviousEmployersArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetPreviousEmployerList`,
    args
  ) as Promise<GetPreviousEmployersApiResponse>;
};

export const addPreviousEmployer = async (args: AddPreviousEmployerArgs) => {
  return httpInstance.post(
    `${baseRoute}/AddPreviousEmployer`,
    args
  ) as Promise<AddEducationDetailApiResponse>;
};

export const downloadEmployerDocument = async (fileName: string) => {
  return httpInstance.get(
    `${baseRoute}/DownloadEmploymentDetailsDocument?FileName=${fileName}`
  ) as Promise<DownloadEmployerDocumentApiResponse>;
};

export const getEmployerDocumentTypeList = (
  documentFor: GetEmployerDocumentTypeListArgs
) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployerDocumentTypeList/${documentFor}`
  ) as Promise<GetEmployerDocumentTypeListApiResponse>;
};

export const uploadPreviousEmployerDocument = (args: FormData) => {
  return httpInstance.post(
    `${baseRoute}/UploadEmployerDocument`,
    args
  ) as Promise<UploadPreviousEmployerDocumentApiResponse>;
};

export const deletePreviousEmployer = (previousEmployerId: number) => {
  return httpInstance.delete(
    `${baseRoute}/DeletePreviousEmployer/${previousEmployerId}`
  ) as Promise<DeletePreviousEmployerApiResponse>;
};

export const deleteProfessionalReference = (
  professionalReferenceId: number
) => {
  return httpInstance.delete(
    `${baseRoute}/DeleteProfessionalReference/${professionalReferenceId}`
  ) as Promise<DeleteProfessionalReferenceApiResponse>;
};

export const deletePreviousEmployerDocument = (documentId: number) => {
  return httpInstance.delete(
    `${baseRoute}/DeletePreviousEmployerDocument/${documentId}`
  ) as Promise<DeletePreviousEmployerDocumentApiResponse>;
};

export const getPreviousEmployerById = async (previousEmployerId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetPreviousEmployerById/${previousEmployerId}`
  ) as Promise<GetPreviousEmployerByIdApiResponse>;
};

export const updatePreviousEmployer = async (
  args: UpdatePreviousEmployerArgs
) => {
  return httpInstance.put(
    `${baseRoute}/UpdatePreviousEmployer`,
    args
  ) as Promise<UpdatePreviousEmployerApiResponse>;
};

export const getProfessionalReferenceById = async (
  professionalReferenceId: number
) => {
  return httpInstance.get(
    `${baseRoute}/GetProfessionalReference/${professionalReferenceId}`
  ) as Promise<GetProfessionalReferenceByIdApiResponse>;
};

export const updateProfessionalReference = async (
  args: UpdateProfessionalReferenceArgs
) => {
  return httpInstance.put(
    `${baseRoute}/UpdateProfessionalReference`,
    args
  ) as Promise<UpdateProfessionalReferenceApiResponse>;
};

export const addProfessionalReference = async (
  args: AddProfessionalReferenceArgs
) => {
  return httpInstance.post(
    `${baseRoute}/AddProfessionalReference`,
    args
  ) as Promise<AddEducationDetailApiResponse>;
};

export const getReportingManagers = async (params: { name?: string }) => {
  return httpInstance.get(`${baseRoute}/GetReportingManagerList`, {
    params,
  }) as Promise<GetReportingManagerListResponse>;
};
