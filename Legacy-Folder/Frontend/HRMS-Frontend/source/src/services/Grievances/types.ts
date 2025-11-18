import {
  GrievanceLevel,
  GrievanceStatus,
  GrievanceTatStatus,
} from "@/utils/constants";

export type GrievanceData = {
  id: number;
  grievanceName: string;
  description: string;
};

export type EmployeeGrievance = {
  id: number;
  grievanceTypeId: number;
  grievanceTypeName: string;
  title: string;
  description: string | null;
  createdOn: string;
  ticketNo: string;
  level: GrievanceLevel;
  status: GrievanceStatus;
  manageBy: string;
};

export type GetEmployeeGrievanceResponse = {
  statusCode: number;
  message: string;
  result: {
    employeeGrievanceList: EmployeeGrievance[];
    totalRecords: number;
  };
};

export type GetEmployeeGrievanceFilter = {
  grievanceTypeId: number | null;
  status: GrievanceStatus | null;
};

export type GetEmployeeGrievancePayload = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: GetEmployeeGrievanceFilter;
};

export type GrievanceType = {
  id: number;
  grievanceName: string;
  description: string;
  l1TatHours: number;
  l1OwnerId: string;
  l1OwnerName: string;
  l2TatHours: number;
  l2OwnerId: string;
  l2OwnerName: string;
  l3TatDays: number;
  l3OwnerId: string;
  l3OwnerName: string;
  isAutoEscalation: boolean;
};

export type GrievanceTypeRequestArgs = {
  id: number;
  grievanceName: string;
  description: string;
  l1TatHours: number;
  l1OwnerIds: string;
  l2TatHours: number;
  l2OwnerIds: string;
  l3TatDays: number;
  l3OwnerIds: string;
  isAutoEscalation?: boolean;
};

export type AddGrievanceTypeApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type UpdateGrievanceTypeApiResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetGrievanceResponseById = {
  statusCode: number;
  message: string;
  result: GrievanceType;
};

export type DeleteGrievanceTypeApiResponse = {
  statusCode: number;
  message: string;
  result: null;
};

export type GetGrievanceTypesResponse = {
  statusCode: number;
  message: string;
  result: {
    grievanceList: GrievanceType[];
  };
};

export type SubmitGrievancePayload = {
  employeeId: number;
  grievanceTypeId: number;
  title: string;
  description: string;
  attachment: File | string;
};

export type SubmitGrievanceResponse = {
  statusCode: number;
  message: string;
  result: {
    id: number;
    ticketNo: string;
  };
};

export type EmployeeGrievanceDetail = {
  filename: string;
  ticketNo: string;
  grievanceTypeId: number;
  grievanceTypeName: string;
  level: GrievanceLevel;
  title: string;
  description: string;
  status: GrievanceStatus;
  manageBy: string; // CSV of owner names
  createdOn: string; // ISO UTC
  resolvedDate: string | null; // ISO UTC
  attachmentPath: string;
  fileOriginalName: string;
  requesterName: string;
  requesterEmail: string;
  requesterAvatar: string | null;
};

export type GetEmployeeGrievanceDetailResponse = {
  statusCode: number;
  message: string;
  result: EmployeeGrievanceDetail | null;
};

export type GrievanceTicketRemark = {
  remarkOwnerName: string;
  remarkOwnerEmail: string;
  remarkOwnerAvatar: string | null;
  remarkOwnerEmpId: number;
  remarks: string;
  attachmentPath: string;
  fileOriginalName: string;
  createdOn: string; // ISO UTC
  status: GrievanceStatus;
};

export type GetGrievanceTicketRemarksResponse = {
  statusCode: number;
  message: string;
  result: { remarksList: GrievanceTicketRemark[] } | null;
};

export type AddGrievanceRemarksPayload = {
  ticketId: number;
  remarks: string;
  attachment: File | "";
  status: GrievanceStatus;
};

export type AddGrievanceRemarksResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type AddRemarksAllowedParams = {
  grievanceTypeId: number;
  level: GrievanceLevel;
};

export type AddRemarksAllowedResponse = {
  statusCode: number;
  message: string;
  result: boolean;
};
export type EmployeeGrievanceResponse = {
  id: number;
  ticketNo: string;
  grievanceTypeId: number;
  grievanceTypeName: string;
  status: GrievanceStatus;
  createdOn: string;
  createdBy: string;
  resolvedBy: string;
  resolvedDate: string | null;
  level: GrievanceLevel;
  tatStatus: GrievanceTatStatus;
};

export type GetAdminReportGrievanceResponse = {
  statusCode: number;
  message: string;
  result: {
    employeeListGrievance: EmployeeGrievanceResponse[];
    totalRecords: number;
  };
};

export type AdminReportGrievanceFilter = {
  grievanceTypeId?: number | null;
  status?: number | null;
  createdOnFrom?: string | null;
  createdOnTo?: string | null;
  resolvedDate?: string | null;
  tatStatus?: number | null;
  createdBy?: string | null;
  resolvedBy?: number | null;
  level: number | null;
};

export type GetAdminReportArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: AdminReportGrievanceFilter;
};
export type GetAllGrievanceTypeList = {
  statusCode: number;
  message: string;
  result: {
    grievanceList: GrievancesList[];
  };
};
export type GrievancesList = {
  grievanceName: string;
  description: string;
  id: number;
};

export type GrievanceViewAllowedResponse = {
  statusCode: number;
  message: string;
  result: boolean;
};
