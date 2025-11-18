import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  AddEmploymentDetailArgs,
  AddOrUpdateEmploymentDetailResponse,
  DownloadDocumentApiResponse,
  GetCityListResponse,
  GetCountryListResponse,
  GetDesignationListResponse,
  GetEmploymentDetailByIdResponse,
  GetLatestEmployeeCodeResponse,
  GetRoleIDListResponse,
  GetStateListResponse,
  GetUserProfileResponse,
  GetUserProfileSummaryResponse,
  PersonalDetailsType,
  RemoveProfilePictureResponse,
  UpdateEmploymentDetailArgs,
  UpdateUserProfileResponse,
  UploadProfilePictureResponse,
} from "@/services/User/types";

const baseRoute = "/UserProfile";
const rolePermissionRoute = "/RolePermission";

export const getUserProfile = async (userId: string) => {
  return httpInstance.get(
    `${baseRoute}/GetPersonalDetailsById/${userId}`
  ) as Promise<GetUserProfileResponse>;
};

export const updateUserProfile = async (payload: PersonalDetailsType) => {
  return httpInstance.post(
    `${baseRoute}/UpdatePersonalDetail`,
    payload
  ) as Promise<UpdateUserProfileResponse>;
};

export const getCountryList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetCountryList`
  ) as Promise<GetCountryListResponse>;
};

export const getStateList = async (countryId: string) => {
  return httpInstance.get(
    `${baseRoute}/GetStateList/${countryId}`
  ) as Promise<GetStateListResponse>;
};

export const getCityList = async (stateId: string) => {
  return httpInstance.get(
    `${baseRoute}/GetCityList/${stateId}`
  ) as Promise<GetCityListResponse>;
};

export const getDesignationList = async () => {
  return httpInstance.get(
    `${baseRoute}/GetDesignationList`
  ) as Promise<GetDesignationListResponse>;
};

export const getEmploymentDetailById = async (userId: string) => {
  return httpInstance.get(
    `${baseRoute}/GetEmploymentDetailById?id=${userId}`
  ) as Promise<GetEmploymentDetailByIdResponse>;
};

export const addEmploymentDetail = async (payload: AddEmploymentDetailArgs) => {
  return httpInstance.post(
    `${baseRoute}/AddEmploymentDetail`,
    payload
  ) as Promise<AddOrUpdateEmploymentDetailResponse>;
};

export const updateEmploymentDetail = async (
  payload: UpdateEmploymentDetailArgs
) => {
  return httpInstance.post(
    `${baseRoute}/UpdateEmploymentDetail`,
    payload
  ) as Promise<AddOrUpdateEmploymentDetailResponse>;
};

export const getRoleIDList = async () => {
  return httpInstance.get(
    `${rolePermissionRoute}/GetRolesList`
  ) as Promise<GetRoleIDListResponse>;
};

export const removeProfilePicture = async (userId: string) => {
  return httpInstance.get(
    `${baseRoute}/RemoveProfilePicture/${userId}`
  ) as Promise<RemoveProfilePictureResponse>;
};

export const uploadProfilePicture = async (userId: string, file: File) => {
  const payload = objectToFormData({ file });
  return httpInstance.post(
    `${baseRoute}/UploadUserProfileImage?userId=${userId}`,
    payload
  ) as Promise<UploadProfilePictureResponse>;
};

export const getLatestEmployeeCode = async () => {
  return httpInstance.get(
    `${baseRoute}/GetLatestEmployeeCode`
  ) as Promise<GetLatestEmployeeCodeResponse>;
};

export const getUserProfileSummary = async (userId: string) => {
  return httpInstance.get(
    `${baseRoute}/GetPersonalProfileByIdAsync/${userId}`
  ) as Promise<GetUserProfileSummaryResponse>;
};
export const getDocumnentUrl = async (
  containerType: number,
  filename: string
) => {
  return httpInstance.get(`${baseRoute}/GetUserDocumentUrl`, {
    params: {
      containerType,
      filename,
    },
  }) as Promise<DownloadDocumentApiResponse>;
};
