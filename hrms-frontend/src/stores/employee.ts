import { defineStore } from 'pinia';
import axios from 'axios';

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  status: number;
  profile_completeness?: number;
}

export interface MasterData {
  departments: Array<{ id: number; name: string }>;
  designations: Array<{ id: number; name: string }>;
  teams: Array<{ id: number; name: string }>;
  countries: Array<{ id: number; name: string; code: string }>;
  blood_groups: Array<{ id: number; name: string }>;
  marital_statuses: Array<{ id: number; name: string; code: string }>;
  genders: Array<{ id: number; name: string; code: string }>;
  employment_statuses: Array<{ id: number; name: string; code: string }>;
  nominee_types: Array<{ id: number; name: string; code: string }>;
}

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [] as Employee[],
    currentEmployee: null as Employee | null,
    masterData: null as MasterData | null,
    loading: false,
    error: null as string | null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
  }),

  actions: {
    // Fetch all master data in one call
    async fetchMasterData() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('/api/master/all');
        this.masterData = response.data.data;
        return this.masterData;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch master data';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch departments
    async fetchDepartments() {
      try {
        const response = await axios.get('/api/master/departments');
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch departments';
        throw error;
      }
    },

    // Fetch designations
    async fetchDesignations() {
      try {
        const response = await axios.get('/api/master/designations');
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch designations';
        throw error;
      }
    },

    // Fetch countries
    async fetchCountries() {
      try {
        const response = await axios.get('/api/master/countries');
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch countries';
        throw error;
      }
    },

    // Fetch states by country
    async fetchStates(countryId: number) {
      try {
        const response = await axios.get(`/api/master/states?country_id=${countryId}`);
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch states';
        throw error;
      }
    },

    // Fetch cities by state
    async fetchCities(stateId: number) {
      try {
        const response = await axios.get(`/api/master/cities?state_id=${stateId}`);
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch cities';
        throw error;
      }
    },

    // Generate next employee code
    async generateEmployeeCode() {
      try {
        const response = await axios.get('/api/employees/next-code/generate');
        return response.data.data.employee_code;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to generate employee code';
        throw error;
      }
    },

    // Fetch employees with pagination
    async fetchEmployees(params: any = {}) {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get('/api/employees', { params });
        this.employees = response.data.data.data;
        this.pagination = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
        };
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch employees';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Fetch single employee
    async fetchEmployee(id: number) {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get(`/api/employees/${id}`);
        this.currentEmployee = response.data.data;
        return this.currentEmployee;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch employee';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Create employee
    async createEmployee(employeeData: any) {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.post('/api/employees', employeeData);
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create employee';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Update employee
    async updateEmployee(id: number, employeeData: any) {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.put(`/api/employees/${id}`, employeeData);
        this.currentEmployee = response.data.data;
        return this.currentEmployee;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update employee';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Delete employee
    async deleteEmployee(id: number) {
      try {
        this.loading = true;
        this.error = null;
        await axios.delete(`/api/employees/${id}`);
        this.employees = this.employees.filter(emp => emp.id !== id);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to delete employee';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Get profile completeness
    async getProfileCompleteness(id: number) {
      try {
        const response = await axios.get(`/api/employees/${id}/profile-completeness`);
        return response.data.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch profile completeness';
        throw error;
      }
    },
  },
});
