import { httpInstance } from "@/api/httpInstance";
import { objectToFormData } from "@/utils/formData";
import {
  GetAssetByIdResponse,
  GetEmployeeAssetResponse,
  GetItAssetDetailsResponse,
  GetItAssetHistory,
  GetItAssetListArgs,
  ImportEmployeesDataResponse,
  UpsertITAssetPayload,
  UpsertITAssetResponse,
} from "@/services/AssetManagement/types";

const baseRoute = "/AssetManagement";

export const getItAssetList = async (args: GetItAssetListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetAssetList`,
    args
  ) as Promise<GetItAssetDetailsResponse>;
};
export const importEmployeesAsset = async (
  excefile: File,
  isImportConfirmed: boolean
) => {
  const payload = objectToFormData({ excelfile: excefile });
  return httpInstance.post(
    `${baseRoute}/ImportExcel?importConfirmed=${isImportConfirmed}`,
    payload
  ) as Promise<ImportEmployeesDataResponse>;
};

export const getItHistory = async (assetId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetAssetHistoryById/${assetId}`
  ) as Promise<GetItAssetHistory>;
};

export const getEmployeeAsset = async (employeeId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetEmployeeAsset/${employeeId}`
  ) as Promise<GetEmployeeAssetResponse>;
};

export const upsertITAsset = async (payload: UpsertITAssetPayload) => {
  const formData = objectToFormData(payload);
  return httpInstance.post(
    `${baseRoute}/UpsertITAsset`, 
    formData
  ) as Promise<UpsertITAssetResponse>;
};

export const getAssetById = async (assetId: number) => {
  return httpInstance.get(
    `${baseRoute}/GetAssetById/${assetId}`
  ) as Promise<GetAssetByIdResponse>;
};
