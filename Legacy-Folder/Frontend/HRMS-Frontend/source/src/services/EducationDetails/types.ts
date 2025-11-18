export type EducationDetailType = {
  id: number;
  qualificationId: number;
  qualificationName: string;
  collegeUniversity: string;
  aggregatePercentage: number;
  startYear: string;
  endYear: string;
  fileName: string;
  fileOriginalName: string;
  degreeName: string;
};

export type GetEducationDetailsApiResponse = {
  statusCode: number;
  message: string;
  result: {
    eduDocResponseList: EducationDetailType[];
    totalRecords: number;
  } | null;
};

export type GetEducationDetailsArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: {
    employeeId: number;
  };
};

export type DeleteEducationDetailApiResponse = {
  statusCode: number;
  message: string;
  result: null;
};

export type QualificationType = {
  id: number;
  shortName: string;
};

export type GetQualificationListApiResponse = {
  statusCode: number;
  message: string;
  result: QualificationType[];
};

export type UniversityType = {
  id: number;
  name: string;
};

export type GetUniversityListApiResponse = {
  statusCode: number;
  message: string;
  result: UniversityType[];
};

export type AddEducationDetailApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type AddEducationDetailArgs = {
  EmployeeId: number,
  AggregatePercentage: number,
  DegreeName: string,
  CollegeUniversity: string,
  QualificationId: number,
  StartYear: string,
  EndYear: string,
  File: File | null | undefined,
};

export type GetEducationDetailByIdApiResponse = {
  statusCode: number;
  message: string;
  result: EducationDetailType;
};

export type UpdateEducationDetailArgs = {
  Id: number;
  EmployeeId: number,
  AggregatePercentage: number,
  DegreeName: string,
  CollegeUniversity: string,
  QualificationId: number,
  StartYear: string,
  EndYear: string,
  File: File | string,
};

export type DownloadEducationalDocumentApiResponse = {
  statusCode: number;
  message: string;
  result: string;
};
