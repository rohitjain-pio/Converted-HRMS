import api from '@/services/api';

/**
 * Exit Employee API Service (Employee-facing)
 * Maps to Laravel ExitEmployeeController
 */

const BASE_URL = '/api/ExitEmployee';

export interface AddResignationRequest {
  EmployeeId: number;
  DepartmentID: number;
  Reason: string;
  ExitDiscussion?: boolean;
}

export interface RequestEarlyReleaseRequest {
  ResignationId: number;
  EarlyReleaseDate: string;
}

export const exitEmployeeApi = {
  /**
   * Submit new resignation
   */
  addResignation: async (data: AddResignationRequest) => {
    return await api.post(`${BASE_URL}/AddResignation`, data);
  },

  /**
   * Get resignation form by ID
   */
  getResignationForm: async (id: number) => {
    return await api.get(`${BASE_URL}/GetResignationForm/${id}`);
  },

  /**
   * Get resignation exit details with clearances
   */
  getResignationDetails: async (id: number) => {
    return await api.get(`${BASE_URL}/GetResignationDetails/${id}`);
  },

  /**
   * Revoke/Withdraw resignation
   */
  revokeResignation: async (resignationId: number) => {
    return await api.post(`${BASE_URL}/RevokeResignation/${resignationId}`);
  },

  /**
   * Request early release
   */
  requestEarlyRelease: async (data: RequestEarlyReleaseRequest) => {
    return await api.post(`${BASE_URL}/RequestEarlyRelease`, data);
  },

  /**
   * Check if resignation exists for employee
   */
  isResignationExist: async (employeeId: number) => {
    return await api.get(`${BASE_URL}/IsResignationExist/${employeeId}`);
  },
};
