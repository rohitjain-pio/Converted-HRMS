import {
  AssetCondition,
  AssetStatus,
  AssetType,
  BranchLocation,
} from "@/utils/constants";

export type ItAsset = {
  id: number;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  assetType: AssetType;
  assetStatus: AssetStatus;
  branch: BranchLocation;
  purchaseDate: string;
  warrantyExpires: string;
  comments: string;
  custodian: string;
  allocatedBy: string;
  custodianFullName: string;
  modifiedOn: string;
};
export type EmployeeAssetList = {
  itAssetList: ItAsset[];
  totalRecords: number;
};
export type GetItAssetDetailsResponse = {
  statusCode: number;
  message: string;
  result: EmployeeAssetList;
};
export type GetItAssetListArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: ItAssetSearchFilter;
};
export type ItAssetSearchFilter = {
  deviceName: string | null;
  deviceCode: string | null;
  manufacturer: string | null;
  model: string | null;
  assetStatus: number;
  branch: number;
  assetType: number;
  employeeCodes?: string;
};
export type ImportEmployeesDataResponse = {
  statusCode: number;
  message: string;
  result: number;
};
export type ItAssetHistory = {
  id: number;
  custodian: string;
  employeeName: string;
  assetStatus: AssetStatus;
  assetCondition: AssetCondition;
  modifiedOn: string;
  modifiedBy: string;
  issueDate: string;
  returnDate: string;
  note: string;
};
export type GetItAssetHistory = {
  statusCode: number;
  message: string;
  result: ItAssetHistory[];
};
export type EmployeeAsset = {
  assetId: number;
  serialNumber: string;
  deviceCode: string;
  deviceName: string;
  manufacturer: string;
  model: string;
  assetType: AssetType;
  branch: BranchLocation;
  assignedBy: string;
  assignedOn: string;
  returnDate: string;
  assetStatus: AssetStatus;
  assetCondition: AssetCondition;
};

export type GetEmployeeAssetResponse = {
  statusCode: number;
  message: string;
  result: EmployeeAsset[];
};

export type UpsertITAssetPayload = {
  id?: number;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  invoiceNumber: string;
  manufacturer: string;
  model: string;
  assetType: AssetType;
  assetStatus: AssetStatus;
  assetCondition: AssetCondition;
  branch: BranchLocation;
  purchaseDate: string;
  warrantyExpires: string;
  specification: string;
  comments: string;
  employeeId: number | "";
  isAllocated: boolean | "";
  note: string | "";
  productFileOriginalName: File | "";
  signatureFileOriginalName: File | "";
};

export type UpsertITAssetResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type Custodian = {
  employeeId: number;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
};

export type AssetData = {
  id: number;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  invoiceNumber: string;
  manufacturer: string;
  model: string;
  assetType: AssetType;
  assetStatus: AssetStatus;
  assetCondition: AssetCondition;
  branch: BranchLocation;
  purchaseDate: string;
  warrantyExpires: string;
  comments: string;
  modifiedOn: string;
  specification: string;
  custodian: Custodian | null;
  employeeId: number | null;
  note: string | null;
  productFileOriginalName: string | null;
  productFileName: string | null;
  signatureFileOriginalName: string | null;
  signatureFileName: string | null;
};

export type GetAssetByIdResponse = {
  statusCode: number;
  message: string;
  result: AssetData | null;
};
