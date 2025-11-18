import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import { AddNomineeArgs, AddNomineeResponse, DeleteNomineeApiResponse, DownloadNomineeDocumentResponse, GetNomineeByIdResponse, GetNomineeListArgs, GetNomineeListResponse, GetNomineeRelationshipApiResponse, UpdateNomineeArgs } from "@/services/Nominee/types";

const baseRoute = "/UserProfile";

export const getNomineeList = async (payload: GetNomineeListArgs) => {
  return httpInstance.post(`${baseRoute}/GetNomineeList`, payload) as Promise<
    GetNomineeListResponse
  >;
};

export const getNomineeRelationship = async () => {
  return httpInstance.get(
    `${baseRoute}/GetRelationshipList`
  ) as Promise<GetNomineeRelationshipApiResponse>;
};

export const addNominee = async (args: AddNomineeArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/AddNominee`,
    formData
  ) as Promise<AddNomineeResponse>;
};

export const getNomineeById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/GetNomineeById/${id}`
  ) as Promise<GetNomineeByIdResponse>;
};

export const updateNominee = async (args: UpdateNomineeArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.put(
    `${baseRoute}/UpdateNominee`,
    formData
  ) as Promise<AddNomineeResponse>;
};

export const downloadNomineeDocument = async (fileName: string) => {
  return httpInstance.get(
    `${baseRoute}/DownloadNomineeDocument?filename=${fileName}`
  ) as Promise<DownloadNomineeDocumentResponse>;
};

export const deleteNominee = async (id: number) => {
  return httpInstance.delete(
    `${baseRoute}/DeleteNominee/${id}`
  ) as Promise<DeleteNomineeApiResponse>;
};