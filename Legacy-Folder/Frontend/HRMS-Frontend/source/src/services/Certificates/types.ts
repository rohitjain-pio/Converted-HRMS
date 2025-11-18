export type CertificateType = {
  id: number;
  employeeId: number;
  certificateName: string;
  certificateExpiry: string | null;
  fileName?: string;
  originalFileName?: string;
};

export interface GetCertificateListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    userCertificateResponseList: CertificateType[];
    totalRecords: number;
  };
}
export interface GetCertificateListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: {
    employeeId: number;
  };
}

export type AddCertificateArgs = {
  CertificateName: string;
  EmployeeId: number;
  File?: File | null;
  CertificateExpiry: string;
};

export interface AddCertificateResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetCertificateByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: CertificateType;
}

export type UpdateCertificateArgs = {
  Id: number;
  CertificateName: string;
  EmployeeId: number;
  File?: File | string;
  CertificateExpiry: string;
};

export interface DownloadCertificateDocumentResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: string;
}

export type DeleteCertificateDetailApiResponse = {
  statusCode: number;
  message: string;
  result: null;
};

export interface DeleteCertificateArgs {
  id: number;
  isArchived: boolean;
}
