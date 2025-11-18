export type CompanyPolicyType = {
  id: number;
  name: string;
  description?: string;
  versionNo: number;
  documentCategory: string;
  createdBy: string;
  createdOn: string;
  modifiedBy?: string | null;
  modifiedOn?: string | null;
  documentCategoryId?: string;
  statusId?: string;
  statusName?: string;
  accessibility?: boolean;
  fileName?: string;
  fileOriginalName?: string;
};

export interface PolicyCategoryType {
  id: number;
  categoryName: string;
}

export interface GetCategoriesApiResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: PolicyCategoryType[];
}

export interface GetCompanyPolicyListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    companyPolicyList: CompanyPolicyType[];
    totalRecords: number;
  };
}

export interface CompanyPolicyListSearchFilter {
  name?: string;
  documentCategoryId?: number | string;
  statusId?: number | string;
}

export interface GetCompanyPolicyListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: CompanyPolicyListSearchFilter;
}

export interface GetCompanyPolicyResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: CompanyPolicyType;
}

export interface PolicyStatusType {
  id: number;
  statusValue: string;
}

export interface GetCompanyPolicyStatusResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: PolicyStatusType[];
}
export interface GetCompanyPolicyHistoryArgs {
  startIndex: number;
  pageSize: number;
  filters: {
    policyId: number | string;
  };
}

export interface GetCompanyPolicyHistoryResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    companyPolicyHistoryResponseDto: CompanyPolicyType[];
    totalRecords: number;
  };
}

export type CreateCompanyPolicyArgs = {
  Name: string;
  DocumentCategoryId: number;
  StatusId: number;
  Description: string;
  Accessibility: boolean;
  FileContent: File | string;
  EmailRequest: boolean;
};

export interface CreateCompanyPolicyResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetCompanyPolicyListByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: CompanyPolicyType;
}

export type UpdateCompanyPolicyArgs = {
  Id: number;
  Name: string;
  DocumentCategoryId: number;
  StatusId: number;
  Description: string;
  Accessibility: boolean;
  FileContent: File | string;
  EmailRequest: boolean;
};

export interface DownloadPolicyDocumentArgs {
  companyPolicyId: number | string;
  employeeId: number;
  fileName: string;
}

export interface DownloadPolicyDocumentResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    fileContent: string;
  };
}
