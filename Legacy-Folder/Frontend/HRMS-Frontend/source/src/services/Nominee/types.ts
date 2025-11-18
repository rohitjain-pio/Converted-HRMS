export type NomineeType = {
  id: number;
  employeeId: number;
  nomineeName: string;
  dob: string;
  age: number;
  careOf: string;
  relationshipName: string;
  others: string;
  percentage: number;
  isNomineeMinor: boolean;
  relationshipId?: string;
  idProofDocType?: string;
  fileName?: string;
  fileOriginalName?: string;
};

export interface NomineeSearchFilter {
  nomineeName?: string;
  relationshipId?: number | string;
  employeeId?: number;
  others?: string;
}

export interface GetNomineeListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    nomineeList: NomineeType[];
    totalRecords: number;
    totalPercentage: number;
  };
}
export interface GetNomineeListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: NomineeSearchFilter;
}

export interface NomineeRelationshipType {
  id: number;
  name: string;
}

export interface GetNomineeRelationshipApiResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: NomineeRelationshipType[];
}

export type AddNomineeArgs = {
  NomineeName: string;
  EmployeeId: number;
  DOB: string;
  Age: number;
  CareOf: string;
  Relationship: number;
  Others: string;
  Percentage: number;
  File?: File | null;
  IdProofDocType: number;
};

export interface AddNomineeResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetNomineeByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: NomineeType;
}

export type UpdateNomineeArgs = {
  Id: number;
  NomineeName: string;
  EmployeeId: number;
  DOB: string;
  Age: number;
  CareOf: string;
  Relationship: number;
  Others: string;
  Percentage: number;
  File?: File | string;
  IdProofDocType: number;
};

export interface DownloadNomineeDocumentResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: string;
}

export type DeleteNomineeApiResponse = {
  statusCode: number;
  message: string;
  result: null;
};
