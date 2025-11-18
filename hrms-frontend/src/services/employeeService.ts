import axios from 'axios';
import type {
  Employee,
  Address,
  BankDetails,
  UserDocument,
  Qualification,
  Certificate,
  Nominee,
  EmployeeFilters
} from '@/types/employee';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const employeeService = {
  // Employee CRUD
  async getEmployees(filters?: EmployeeFilters) {
    return apiClient.get('/employees', { params: filters });
  },

  async getEmployeeById(id: number) {
    return apiClient.get(`/employees/${id}`);
  },

  async createEmployee(data: Partial<Employee>) {
    return apiClient.post('/employees', data);
  },

  async updateEmployee(id: number, data: Partial<Employee>) {
    return apiClient.put(`/employees/${id}`, data);
  },

  async deleteEmployee(id: number) {
    return apiClient.delete(`/employees/${id}`);
  },

  async getNextEmployeeCode() {
    return apiClient.get('/employees/next-code/generate');
  },

  async getProfileCompleteness(employeeId: number) {
    return apiClient.get(`/employees/${employeeId}/profile-completeness`);
  },

  // Address Management
  async getAddresses(employeeId: number) {
    return apiClient.get('/employees/addresses', { params: { employee_id: employeeId } });
  },

  async saveCurrentAddress(data: Address) {
    return apiClient.post('/employees/addresses/current', data);
  },

  async savePermanentAddress(data: Address) {
    return apiClient.post('/employees/addresses/permanent', data);
  },

  async copyCurrentToPermanent(employeeId: number) {
    return apiClient.post('/employees/addresses/copy-current-to-permanent', { employee_id: employeeId });
  },

  // Bank Details Management
  async getBankDetails(employeeId: number) {
    return apiClient.get('/employees/bank-details', { params: { employee_id: employeeId } });
  },

  async saveBankDetails(data: BankDetails) {
    return apiClient.post('/employees/bank-details', data);
  },

  async updateBankDetails(id: number, data: BankDetails) {
    return apiClient.put(`/employees/bank-details/${id}`, data);
  },

  async deleteBankDetails(id: number) {
    return apiClient.delete(`/employees/bank-details/${id}`);
  },

  async setActiveBankAccount(id: number) {
    return apiClient.post(`/employees/bank-details/${id}/set-active`);
  },

  // Document Management
  async getDocuments(employeeId: number) {
    return apiClient.get('/employees/documents', { params: { employee_id: employeeId } });
  },

  async uploadDocument(formData: FormData) {
    return apiClient.post('/employees/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updateDocument(id: number, data: Partial<UserDocument>) {
    return apiClient.put(`/employees/documents/${id}`, data);
  },

  async deleteDocument(id: number) {
    return apiClient.delete(`/employees/documents/${id}`);
  },

  async downloadDocument(id: number) {
    return apiClient.get(`/employees/documents/${id}/download`, {
      responseType: 'blob',
    });
  },

  async getDocumentTypes(idProofFor?: number) {
    return apiClient.get('/employees/documents/types', { params: { id_proof_for: idProofFor } });
  },

  // Qualification Management
  async getQualifications(employeeId: number) {
    return apiClient.get('/employees/qualifications', { params: { employee_id: employeeId } });
  },

  async saveQualification(formData: FormData) {
    return apiClient.post('/employees/qualifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updateQualification(id: number, data: Partial<Qualification>) {
    return apiClient.put(`/employees/qualifications/${id}`, data);
  },

  async deleteQualification(id: number) {
    return apiClient.delete(`/employees/qualifications/${id}`);
  },

  async getQualificationMasters() {
    return apiClient.get('/employees/qualifications/masters/qualifications');
  },

  async getUniversities() {
    return apiClient.get('/employees/qualifications/masters/universities');
  },

  // Certificate Management
  async getCertificates(employeeId: number) {
    return apiClient.get('/employees/certificates', { params: { employee_id: employeeId } });
  },

  async saveCertificate(formData: FormData) {
    return apiClient.post('/employees/certificates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteCertificate(id: number) {
    return apiClient.delete(`/employees/certificates/${id}`);
  },

  // Nominee Management
  async getNominees(employeeId: number) {
    return apiClient.get('/employees/nominees', { params: { employee_id: employeeId } });
  },

  async saveNominee(data: Nominee) {
    return apiClient.post('/employees/nominees', data);
  },

  async updateNominee(id: number, data: Nominee) {
    return apiClient.put(`/employees/nominees/${id}`, data);
  },

  async deleteNominee(id: number) {
    return apiClient.delete(`/employees/nominees/${id}`);
  },

  async verifyNomineePercentage(employeeId: number) {
    return apiClient.post('/employees/nominees/verify-percentage', { employee_id: employeeId });
  },

  // Master Data APIs (would be in separate endpoints in real app)
  async getDepartments() {
    // Placeholder - these should be separate master data endpoints
    return apiClient.get('/master/departments');
  },

  async getBranches() {
    return apiClient.get('/master/branches');
  },

  async getDesignations() {
    return apiClient.get('/master/designations');
  },

  async getTeams() {
    return apiClient.get('/master/teams');
  },

  async getCountries() {
    return apiClient.get('/master/countries');
  },

  async getStates(countryId: number) {
    return apiClient.get('/master/states', { params: { country_id: countryId } });
  },

  async getCities(stateId: number) {
    return apiClient.get('/master/cities', { params: { state_id: stateId } });
  },

  async getRelationships() {
    return apiClient.get('/master/relationships');
  },

  async getEmployeesForDropdown(search?: string) {
    return apiClient.get('/master/employees', { params: { search } });
  },

  // Legacy endpoint for reporting managers (matches React implementation)
  async getReportingManagers(name?: string) {
    return apiClient.get('/UserProfile/GetReportingManagerList', { params: { name } });
  },

  // Export/Import functionality
  async exportEmployees(filters?: any) {
    return apiClient.post('/employees/export', filters || {}, {
      responseType: 'blob',
    });
  },

  async importEmployees(file: File, importConfirmed: boolean = false) {
    const formData = new FormData();
    formData.append('excefile', file);
    
    return apiClient.post(
      `/employees/import?importConfirmed=${importConfirmed}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Profile Picture Management
  // Legacy: POST /api/UserProfile/UploadUserProfileImage
  async uploadProfilePicture(employeeId: number, file: File) {
    const formData = new FormData();
    formData.append('employee_id', employeeId.toString());
    formData.append('file', file);
    
    return apiClient.post('/UserProfile/UploadUserProfileImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Legacy: POST /api/UserProfile/UpdateProfilePicture/{id}
  async updateProfilePicture(employeeId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`/UserProfile/UpdateProfilePicture/${employeeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Legacy: GET /api/UserProfile/RemoveProfilePicture/{id}
  async removeProfilePicture(employeeId: number) {
    return apiClient.get(`/UserProfile/RemoveProfilePicture/${employeeId}`);
  },

  // Get profile picture URL with SAS token
  async getProfilePictureUrl(employeeId: number) {
    return apiClient.get(`/employees/profile-picture/${employeeId}/url`);
  },
};
