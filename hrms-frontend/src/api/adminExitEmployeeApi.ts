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
  Attachment?: string | File;
  FileOriginalName?: string;
}

export interface UpsertDepartmentClearanceRequest {
  ResignationId: number;
  KTStatus?: number;
  KTNotes: string;
  Attachment: string | File;
  KTUsers: string;
  FileOriginalName?: string;
}

export interface UpsertITClearanceRequest {
  ResignationId: number;
  AccessRevoked: boolean;
  AssetReturned: boolean;
  AssetCondition: number;
  AttachmentUrl?: string | File;
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
  AccountAttachment?: string | File;
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
    const formData = new FormData();
    formData.append('ResignationId', data.ResignationId.toString());
    formData.append('AdvanceBonusRecoveryAmount', data.AdvanceBonusRecoveryAmount.toString());
    formData.append('NumberOfBuyOutDays', data.NumberOfBuyOutDays.toString());
    
    if (data.ServiceAgreementDetails) formData.append('ServiceAgreementDetails', data.ServiceAgreementDetails);
    if (data.CurrentEL !== undefined) formData.append('CurrentEL', data.CurrentEL.toString());
    if (data.ExitInterviewStatus !== undefined) formData.append('ExitInterviewStatus', data.ExitInterviewStatus ? '1' : '0');
    if (data.ExitInterviewDetails) formData.append('ExitInterviewDetails', data.ExitInterviewDetails);
    if (data.FileOriginalName) formData.append('FileOriginalName', data.FileOriginalName);
    
    if (data.Attachment instanceof File) {
      formData.append('AttachmentFile', data.Attachment);
    } else if (data.Attachment) {
      formData.append('Attachment', data.Attachment);
    }
    
    return await api.post(`${BASE_URL}/UpsertHRClearance`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    const formData = new FormData();
    formData.append('ResignationId', data.ResignationId.toString());
    formData.append('KTNotes', data.KTNotes);
    formData.append('KTUsers', data.KTUsers);
    
    if (data.KTStatus !== undefined) formData.append('KTStatus', data.KTStatus.toString());
    if (data.FileOriginalName) formData.append('FileOriginalName', data.FileOriginalName);
    
    if (data.Attachment instanceof File) {
      formData.append('AttachmentFile', data.Attachment);
    } else if (data.Attachment) {
      formData.append('Attachment', data.Attachment);
    }
    
    return await api.post(`${BASE_URL}/UpsertDepartmentClearance`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    const formData = new FormData();
    formData.append('ResignationId', data.ResignationId.toString());
    formData.append('AccessRevoked', data.AccessRevoked ? '1' : '0');
    formData.append('AssetReturned', data.AssetReturned ? '1' : '0');
    formData.append('AssetCondition', data.AssetCondition.toString());
    formData.append('ITClearanceCertification', data.ITClearanceCertification ? '1' : '0');
    
    if (data.Note) formData.append('Note', data.Note);
    if (data.FileOriginalName) formData.append('FileOriginalName', data.FileOriginalName);
    
    if (data.AttachmentUrl instanceof File) {
      formData.append('AttachmentFile', data.AttachmentUrl);
    } else if (data.AttachmentUrl) {
      formData.append('AttachmentUrl', data.AttachmentUrl);
    }
    
    return await api.post(`${BASE_URL}/AddUpdateITClearance`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    const formData = new FormData();
    formData.append('ResignationId', data.ResignationId.toString());
    
    if (data.FnFStatus !== undefined) formData.append('FnFStatus', data.FnFStatus ? '1' : '0');
    if (data.FnFAmount !== undefined) formData.append('FnFAmount', data.FnFAmount.toString());
    if (data.IssueNoDueCertificate !== undefined) formData.append('IssueNoDueCertificate', data.IssueNoDueCertificate ? '1' : '0');
    if (data.Note) formData.append('Note', data.Note);
    if (data.FileOriginalName) formData.append('FileOriginalName', data.FileOriginalName);
    
    if (data.AccountAttachment instanceof File) {
      formData.append('AttachmentFile', data.AccountAttachment);
    } else if (data.AccountAttachment) {
      formData.append('AccountAttachment', data.AccountAttachment);
    }
    
    return await api.post(`${BASE_URL}/AddUpdateAccountClearance`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Get document SAS URL for viewing/downloading
   */
  getDocumentUrl: async (containerName: string, filename: string) => {
    return await api.post<{ data: { url: string } }>(`${BASE_URL}/GetDocumentUrl`, {
      ContainerName: containerName,
      FileName: filename
    });
  },
};
