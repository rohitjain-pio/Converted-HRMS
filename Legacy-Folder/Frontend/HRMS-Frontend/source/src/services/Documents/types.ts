export type UserDocumentType = {
  id: number;
  employeeId: number;
  documentName: string;
  documentType: string;
  documentTypeId?: string;
  documentNumber: string;
  documentExpiry: string;
  location: string;
};

export interface DocumentSearchFilter {
  documentTypeId?: number | string;
  documentNumber?: string;
}

export interface GovtDocumentType {
  id: number;
  name: string;
  isExpiryDateRequired: boolean;
}

export interface GetGovtDocumentApiResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: GovtDocumentType[];
}

export interface GetUserDocumentListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: UserDocumentType[];
}

export type AddUserDocumentArgs = {
  EmployeeId: number;
  DocumentTypeId: number;
  DocumentNumber: string;
  DocumentExpiry: string;
  File: File | null | undefined;
};

export interface AddUserDocumentResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetUserDocumentByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: UserDocumentType;
}

export interface DownloadUserDocumentResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: string;
}

export type UpdateUserDocumentArgs = {
  Id: number;
  EmployeeId: number;
  DocumentTypeId: number;
  DocumentNumber: string;
  DocumentExpiry: string;
  File: File | string;
};
