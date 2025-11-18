import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  CreateCompanyPolicyArgs,
  CreateCompanyPolicyResponse,
  DownloadPolicyDocumentArgs,
  DownloadPolicyDocumentResponse,
  GetCategoriesApiResponse,
  GetCompanyPolicyHistoryArgs,
  GetCompanyPolicyHistoryResponse,
  GetCompanyPolicyListArgs,
  GetCompanyPolicyListByIdResponse,
  GetCompanyPolicyListResponse,
  GetCompanyPolicyResponse,
  GetCompanyPolicyStatusResponse,
  UpdateCompanyPolicyArgs,
} from "@/services/CompanyPolicies/types";

const baseRoute = "/CompanyPolicy";

export const getDocumentCategories = async () => {
  return httpInstance.get(
    `${baseRoute}/GetDocumentCategoryList`
  ) as Promise<GetCategoriesApiResponse>;
};

export const getCompanyPolicyList = async (
  payload: GetCompanyPolicyListArgs
) => {
  return httpInstance.post(
    `${baseRoute}/GetCompanyPolicies`,
    payload
  ) as Promise<GetCompanyPolicyListResponse>;
};

export const getCompanyPolicy = async (id: string) => {
  return httpInstance.get(
    `${baseRoute}/${id}`
  ) as Promise<GetCompanyPolicyResponse>;
};

export const getCompanyPolicyStatusList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetPolicyStatusList`
  ) as Promise<GetCompanyPolicyStatusResponse>;
};
export const getCompanyPolicyHistory = async (
  payload: GetCompanyPolicyHistoryArgs
) => {
  return httpInstance.post(
    `${baseRoute}/GetCompanyPolicyHistoryList`,
    payload
  ) as Promise<GetCompanyPolicyHistoryResponse>;
};

export const createCompanyPolicy = async (args: CreateCompanyPolicyArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.post(
    `${baseRoute}/CreateCompanyPolicy`,
    formData
  ) as Promise<CreateCompanyPolicyResponse>;
};

export const getCompanyPolicyById = async (id: number) => {
  return httpInstance.get(
    `${baseRoute}/${id}`
  ) as Promise<GetCompanyPolicyListByIdResponse>;
};

export const updateCompanyPolicy = async (args: UpdateCompanyPolicyArgs) => {
  const formData = objectToFormData(args);
  return httpInstance.put(
    `${baseRoute}/UpdateCompanyPolicy`,
    formData
  ) as Promise<CreateCompanyPolicyResponse>;
};

export const downloadPolicyDocument = async (payload: DownloadPolicyDocumentArgs) => {
  return httpInstance.post(
    `${baseRoute}/DownloadPolicyDocument`,
    payload
  ) as Promise<DownloadPolicyDocumentResponse>;
};
