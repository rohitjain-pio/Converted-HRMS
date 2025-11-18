import { EmployerDocumentTypeMap } from "@/utils/constants";

export type EmployerDocument = {
  id: number;
  documentName: string;
  fileName: string;
  fileOriginalName: string;
  employerDocumentTypeId: number;
};

export type ProfessionalReference = {
  id: number;
  fullName: string;
  designation: string;
  email: string;
  contactNumber: string;
};

export type PreviousEmployer = {
  id: number;
  employerName: string;
  designation: string;
  startDate: string;
  endDate: string;
  documents: EmployerDocument[];
  professionalReferences: ProfessionalReference[];
};

export type GetPreviousEmployersArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: {
    employeeId: number;
    employerName: string;
    documentName: string;
  };
};

export type GetPreviousEmployersApiResponse = {
  statusCode: number;
  message: string;
  result: {
    previousEmployerList: PreviousEmployer[];
    totalRecords: number;
  };
};

export type AddPreviousEmployerArgs = {
  employeeId: number;
  employerName: string;
  designation: string;
  startDate: string;
  endDate: string;
};

export type AddPreviousEmployerApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type DownloadEmployerDocumentApiResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type EmployerDocumentType = {
  id: number;
  documentName: string;
};

export type GetEmployerDocumentTypeListApiResponse = {
  statusCode: number;
  message: string;
  result: EmployerDocumentType[];
};

export type GetEmployerDocumentTypeListArgs =
  (typeof EmployerDocumentTypeMap)[keyof typeof EmployerDocumentTypeMap];

export type UploadPreviousEmployerDocumentApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type DeletePreviousEmployerApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type DeleteProfessionalReferenceApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type DeletePreviousEmployerDocumentApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetPreviousEmployerByIdApiResponse = {
  statusCode: number;
  message: string;
  result: {
    id: number;
    employeeId: number;
    employerName: string;
    designation: string;
    startDate: string;
    endDate: string;
  };
};

export type UpdatePreviousEmployerApiResponse = AddPreviousEmployerApiResponse;

export type UpdatePreviousEmployerArgs = AddPreviousEmployerArgs & {
  id: number;
};

export type GetProfessionalReferenceByIdApiResponse = {
  statusCode: number;
  message: string;
  result: {
    id: number;
    previousEmployerId: number;
    fullName: string;
    designation: string;
    email: string;
    contactNumber: string;
  };
};

export type UpdateProfessionalReferenceApiResponse =
  AddPreviousEmployerApiResponse;

export type UpdateProfessionalReferenceArgs = {
  id: number;
  previousEmployerId: number;
  fullName: string;
  designation: string;
  email: string;
  contactNumber: string;
};

export type AddProfessionalReferenceArgs = {
  // id: number;
  previousEmployerId: number;
  fullName: string;
  designation: string;
  email: string;
  contactNumber: string;
}[];

export type AddProfessionalReferenceApiResponse =
  AddPreviousEmployerApiResponse;

export type GetReportingManagerListResponse = {
  statusCode: number;
  message: string;
  result: {
    id: number;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
  }[];
};
