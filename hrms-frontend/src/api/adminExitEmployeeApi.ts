import api from '@/services/api';
import type {
  GetExitEmployeeListArgs,
  GetExitEmployeeListResponse,
  GetExitDetailsResponse,
} from '@/types/exitEmployee.types';

/**
 * Admin Exit Employee API Service
 * Maps to Laravel AdminExitEmployeeController
 * Exact replication of legacy employeeExitAdminService.ts
 */

const BASE_URL = '/AdminExitEmployee';

export interface GetResignationListRequest {
  search?: {
    EmployeeId?: number;
    DepartmentID?: number;
    Status?: number;
    FromDate?: string;
    ToDate?: string;
  };
  pageNumber?: number;
  pageSize?: number;
}

export interface AcceptEarlyReleaseRequest {
  ResignationId: number;
  EarlyReleaseDate: string;
}

export interface AdminRejectionRequest {
  ResignationId: number;
  RejectionType: 'Resignation' | 'EarlyRelease';
  RejectionReason: string;
}

export interface UpdateLastWorkingDayRequest {
  ResignationId: number;
  LastWorkingDay: string;
}

export interface UpsertHRClearanceRequest {
  ResignationId: number;
  AdvanceBonusRecoveryAmount: number;
  ServiceAgreementDetails?: string;
  CurrentEL?: number;
  NumberOfBuyOutDays: number;
  ExitInterviewStatus?: boolean;
  ExitInterviewDetails?: string;
  Attachment?: string;
  FileOriginalName?: string;
}

export interface UpsertDepartmentClearanceRequest {
  ResignationId: number;
  KTStatus?: number;
  KTNotes: string;
  Attachment: string;
  KTUsers: string;
  FileOriginalName?: string;
}

export interface UpsertITClearanceRequest {
  ResignationId: number;
  AccessRevoked: boolean;
  AssetReturned: boolean;
  AssetCondition: number;
  AttachmentUrl?: string;
  Note?: string;
  ITClearanceCertification: boolean;
  FileOriginalName?: string;
}

export interface UpsertAccountClearanceRequest {
  ResignationId: number;
  FnFStatus?: boolean;
  FnFAmount?: number;
  IssueNoDueCertificate?: boolean;
  Note?: string;
  AccountAttachment?: string;
  FileOriginalName?: string;
}

export const adminExitEmployeeApi = {
  /**
   * Get resignation list with search/filters
   */
  getResignationList: async (data: GetExitEmployeeListArgs) => {
    return await api.post<GetExitEmployeeListResponse>(`${BASE_URL}/GetResignationList`, data);
  },

  /**
   * Get resignation detail by ID
   */
  getResignationById: async (id: number) => {
    return await api.get<GetExitDetailsResponse>(`${BASE_URL}/GetResignationById/${id}`);
  },

  /**
   * Accept resignation
   */
  acceptResignation: async (id: number) => {
    return await api.post(`${BASE_URL}/AcceptResignation/${id}`);
  },

  /**
   * Accept early release
   */
  acceptEarlyRelease: async (data: AcceptEarlyReleaseRequest) => {
    return await api.post(`${BASE_URL}/AcceptEarlyRelease`, data);
  },

  /**
   * Admin rejection (resignation or early release)
   */
  adminRejection: async (data: AdminRejectionRequest) => {
    return await api.post(`${BASE_URL}/AdminRejection`, data);
  },

  /**
   * Update last working day
   */
  updateLastWorkingDay: async (data: UpdateLastWorkingDayRequest) => {
    return await api.patch(`${BASE_URL}/UpdateLastWorkingDay`, data);
  },

  /**
   * Get HR Clearance by Resignation ID
   */
  getHRClearance: async (resignationId: number) => {
    return await api.get(`${BASE_URL}/GetHRClearanceByResignationId/${resignationId}`);
  },

  /**
   * Upsert HR Clearance
   */
  upsertHRClearance: async (data: UpsertHRClearanceRequest) => {
    return await api.post(`${BASE_URL}/UpsertHRClearance`, data);
  },

  /**
   * Get Department Clearance by Resignation ID
   */
  getDepartmentClearance: async (resignationId: number) => {
    return await api.get(`${BASE_URL}/GetDepartmentClearanceDetailByResignationId/${resignationId}`);
  },

  /**
   * Upsert Department Clearance
   */
  upsertDepartmentClearance: async (data: UpsertDepartmentClearanceRequest) => {
    return await api.post(`${BASE_URL}/UpsertDepartmentClearance`, data);
  },

  /**
   * Get IT Clearance by Resignation ID
   */
  getITClearance: async (resignationId: number) => {
    return await api.get(`${BASE_URL}/GetITClearanceDetailByResignationId/${resignationId}`);
  },

  /**
   * Upsert IT Clearance
   */
  upsertITClearance: async (data: UpsertITClearanceRequest) => {
    return await api.post(`${BASE_URL}/AddUpdateITClearance`, data);
  },

  /**
   * Get Account Clearance by Resignation ID
   */
  getAccountClearance: async (resignationId: number) => {
    return await api.get(`${BASE_URL}/GetAccountClearance/${resignationId}`);
  },

  /**
   * Upsert Account Clearance
   */
  upsertAccountClearance: async (data: UpsertAccountClearanceRequest) => {
    return await api.post(`${BASE_URL}/AddUpdateAccountClearance`, data);
  },
};
