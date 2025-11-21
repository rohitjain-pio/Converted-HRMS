import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Employee,
  Address,
  BankDetails,
  UserDocument,
  Qualification,
  Certificate,
  Nominee,
  EmployeeFilters,
  ProfileCompleteness,
  Department,
  Designation,
  Team,
  Country,
  State,
  City,
  DocumentType,
  QualificationMaster,
  University,
  Relationship
} from '@/types/employee';
import { employeeService } from '@/services/employeeService';

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref<Employee[]>([]);
  const currentEmployee = ref<Employee | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Master Data
  const departments = ref<Department[]>([]);
  const designations = ref<Designation[]>([]);
  const teams = ref<Team[]>([]);
  const countries = ref<Country[]>([]);
  const states = ref<State[]>([]);
  const cities = ref<City[]>([]);
  const documentTypes = ref<DocumentType[]>([]);
  const qualifications = ref<QualificationMaster[]>([]);
  const universities = ref<University[]>([]);
  const relationships = ref<Relationship[]>([]);

  // Computed
  const activeEmployees = computed(() => 
    employees.value.filter(emp => {
      // Check employment_status in both root level (legacy) and employment_detail (current)
      const status = emp.employment_detail?.employment_status || emp.employment_status;
      return status === 'Active';
    })
  );

  const totalEmployees = computed(() => employees.value.length);

  // Actions
  async function fetchEmployees(filters?: EmployeeFilters) {
    loading.value = true;
    error.value = null;
    try {
      // Request all employees by setting a high per_page value
      // The frontend does client-side pagination, so we need all records
      const filtersWithAllRecords = {
        ...filters,
        per_page: 10000 // Request all employees
      };
      const response = await employeeService.getEmployees(filtersWithAllRecords);
      console.log('Employees API response:', response.data);
      // Backend returns: { success: true, data: { data: [...], current_page, total, etc } }
      // So we need response.data.data.data to get the actual employees array
      const responseData = response.data;
      if (responseData.data && Array.isArray(responseData.data.data)) {
        employees.value = responseData.data.data;
      } else if (Array.isArray(responseData.data)) {
        employees.value = responseData.data;
      } else if (Array.isArray(responseData)) {
        employees.value = responseData;
      } else {
        employees.value = [];
      }
      console.log('Employees stored:', employees.value.length, 'employees');
      console.log('Active employees:', activeEmployees.value.length, 'active');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch employees';
      console.error('Fetch employees error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEmployeesForDropdown(search?: string) {
    try {
      const response = await employeeService.getEmployeesForDropdown(search);
      console.log('Employees for dropdown:', response.data);
      // This endpoint returns { success: true, data: [...] } directly
      employees.value = response.data.data || [];
      console.log('Dropdown employees stored:', employees.value.length);
    } catch (err: any) {
      console.error('Fetch dropdown employees error:', err);
      throw err;
    }
  }

  // Legacy API: Get reporting managers (matches React implementation)
  async function fetchReportingManagers(name?: string) {
    try {
      const response = await employeeService.getReportingManagers(name);
      console.log('Reporting managers response:', response.data);
      // Legacy API returns: { statusCode, message, result: [...] }
      const managers = response.data.result || [];
      // Transform to match employee structure
      employees.value = managers.map((m: any) => ({
        id: m.id,
        employee_code: '',
        first_name: m.firstName,
        middle_name: m.middleName,
        last_name: m.lastName,
        email: m.email
      }));
      console.log('Reporting managers stored:', employees.value.length);
      return employees.value;
    } catch (err: any) {
      console.error('Fetch reporting managers error:', err);
      throw err;
    }
  }

  /**
   * Transform API response to form-compatible structure
   * Maps nested employment_detail and field name mismatches
   */
  function transformEmployeeForForm(apiEmployee: any): any {
    // ✅ NO TRANSFORMATION - Use database field names directly throughout the app
    const transformed: any = {
      // Copy all fields as-is from API response
      ...apiEmployee,
      
      // Only transform date fields for HTML date inputs (YYYY-MM-DD format)
      dob: apiEmployee.dob ? (apiEmployee.dob.toString().includes('T') ? apiEmployee.dob.split('T')[0] : apiEmployee.dob) : '',
    };
    
    // Flatten employment_detail into main object if it exists
    if (apiEmployee.employment_detail) {
      const empDetail = apiEmployee.employment_detail;
      transformed.email = empDetail.email;
      
      // Format joining_date for date input
      if (empDetail.joining_date) {
        const dateStr = empDetail.joining_date.toString();
        transformed.joining_date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      
      transformed.designation_id = empDetail.designation_id;
      transformed.department_id = empDetail.department_id;
      transformed.team_id = empDetail.team_id;
      transformed.reporting_manager_id = empDetail.reporting_manger_id;
      transformed.employment_status = empDetail.employment_status;
      transformed.job_type = empDetail.job_type;
      transformed.branch_id = empDetail.branch_id;
      transformed.time_doctor_user_id = empDetail.time_doctor_user_id;
      transformed.background_verificationstatus = empDetail.background_verificationstatus;
      
      // Convert criminal_verification from boolean to numeric dropdown value
      if (empDetail.criminal_verification === null || empDetail.criminal_verification === undefined) {
        transformed.criminal_verification = undefined;
      } else if (empDetail.criminal_verification === true) {
        transformed.criminal_verification = 2; // Completed
      } else {
        transformed.criminal_verification = 1; // Pending
      }
      
      transformed.total_experience_year = empDetail.total_experience_year || 0;
      transformed.total_experience_month = empDetail.total_experience_month || 0;
      transformed.relevant_experience_year = empDetail.relevant_experience_year || 0;
      transformed.relevant_experience_month = empDetail.relevant_experience_month || 0;
      transformed.probation_months = empDetail.probation_months || 0;
      
      // Keep employment_detail for reference
      transformed.employment_detail = empDetail;
    }
    
    return transformed;
  }

  async function fetchEmployeeById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await employeeService.getEmployeeById(id);
      const rawEmployee = response.data.data;
      
      console.log('[EmployeeStore] Raw API response:', rawEmployee);
      console.log('[EmployeeStore] Has employment_detail:', !!rawEmployee.employment_detail);
      
      // Transform the data for form compatibility
      const transformedEmployee = transformEmployeeForForm(rawEmployee);
      
      console.log('[EmployeeStore] Transformed employee:', transformedEmployee);
      console.log('[EmployeeStore] Checking transformations:');
      console.log('  ✅ DOB:', rawEmployee.dob, '->', transformedEmployee.dob);
      console.log('  ✅ phone -> mobile_number:', rawEmployee.phone, '->', transformedEmployee.mobile_number);
      console.log('  ✅ pan_number -> pan_no:', rawEmployee.pan_number, '->', transformedEmployee.pan_no);
      console.log('  ✅ adhar_number -> aadhaar_no:', rawEmployee.adhar_number, '->', transformedEmployee.aadhaar_no);
      console.log('  ✅ uan_no:', rawEmployee.uan_no, '->', transformedEmployee.uan_no);
      console.log('  ✅ emergency_contact_person -> emergency_contact_name:', rawEmployee.emergency_contact_person, '->', transformedEmployee.emergency_contact_name);
      console.log('  ✅ emergency_contact_no -> emergency_contact_number:', rawEmployee.emergency_contact_no, '->', transformedEmployee.emergency_contact_number);
      if (rawEmployee.employment_detail) {
        console.log('  ✅ employment_detail.email -> email:', rawEmployee.employment_detail.email, '->', transformedEmployee.email);
        console.log('  ✅ employment_detail.joining_date:', rawEmployee.employment_detail.joining_date, '->', transformedEmployee.joining_date);
        console.log('  ✅ employment_detail.designation_id:', rawEmployee.employment_detail.designation_id, '->', transformedEmployee.designation_id);
        console.log('  ✅ employment_detail.department_id:', rawEmployee.employment_detail.department_id, '->', transformedEmployee.department_id);
        console.log('  ✅ employment_detail.criminal_verification (boolean):', rawEmployee.employment_detail.criminal_verification, '-> (number):', transformedEmployee.criminal_verification);
      }
      
      currentEmployee.value = transformedEmployee;
      return transformedEmployee;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch employee';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Transform form data back to API-compatible structure
   * Maps form field names to API field names
   */
  function transformFormDataForAPI(formData: any): any {
    // ✅ NO TRANSFORMATION - Send data as-is with database field names
    const apiData: any = { ...formData };
    
    // Only handle special case: criminal_verification conversion
    // Form has: 1=Pending, 2=Completed, API expects: false=Pending, true=Completed
    if (formData.criminal_verification !== undefined && formData.criminal_verification !== null) {
      apiData.criminal_verification = formData.criminal_verification === 2;
    }
    
    return apiData;
  }

  async function createEmployee(data: Partial<Employee>) {
    loading.value = true;
    error.value = null;
    try {
      // Transform form data to API format
      const apiData = transformFormDataForAPI(data);
      const response = await employeeService.createEmployee(apiData);
      employees.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to create employee';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateEmployee(id: number, data: Partial<Employee>) {
    loading.value = true;
    error.value = null;
    try {
      // Transform form data to API format
      const apiData = transformFormDataForAPI(data);
      const response = await employeeService.updateEmployee(id, apiData);
      const index = employees.value.findIndex(emp => emp.id === id);
      if (index !== -1) {
        employees.value[index] = { ...employees.value[index], ...data };
      }
      if (currentEmployee.value?.id === id) {
        currentEmployee.value = { ...currentEmployee.value, ...data };
      }
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to update employee';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteEmployee(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await employeeService.deleteEmployee(id);
      employees.value = employees.value.filter(emp => emp.id !== id);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete employee';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getProfileCompleteness(employeeId: number): Promise<ProfileCompleteness> {
    const response = await employeeService.getProfileCompleteness(employeeId);
    return response.data.data;
  }

  async function getNextEmployeeCode(): Promise<string> {
    const response = await employeeService.getNextEmployeeCode();
    return response.data.data.employee_code;
  }

  async function generateEmployeeCode() {
    const code = await getNextEmployeeCode();
    return { employee_code: code };
  }

  // Address Management
  async function fetchAddresses(employeeId: number) {
    const response = await employeeService.getAddresses(employeeId);
    return response.data.data;
  }

  async function saveCurrentAddress(data: Address) {
    return await employeeService.saveCurrentAddress(data);
  }

  async function savePermanentAddress(data: Address) {
    return await employeeService.savePermanentAddress(data);
  }

  async function copyCurrentToPermanent(employeeId: number) {
    return await employeeService.copyCurrentToPermanent(employeeId);
  }

  // Bank Details Management
  async function fetchBankDetails(employeeId: number) {
    const response = await employeeService.getBankDetails(employeeId);
    return response.data.data;
  }

  async function saveBankDetails(data: BankDetails) {
    return await employeeService.saveBankDetails(data);
  }

  async function createBankDetails(data: Partial<BankDetails>) {
    return await employeeService.saveBankDetails(data as BankDetails);
  }

  async function updateBankDetails(id: number, data: BankDetails) {
    return await employeeService.updateBankDetails(id, data);
  }

  async function deleteBankDetails(id: number) {
    return await employeeService.deleteBankDetails(id);
  }

  async function setActiveBankAccount(id: number) {
    return await employeeService.setActiveBankAccount(id);
  }

  async function setActiveBankDetails(id: number) {
    return await employeeService.setActiveBankAccount(id);
  }

  // Document Management
  async function fetchDocuments(employeeId: number) {
    const response = await employeeService.getDocuments(employeeId);
    return response.data.data;
  }

  async function uploadDocument(data: FormData) {
    return await employeeService.uploadDocument(data);
  }

  async function updateDocument(id: number, data: Partial<UserDocument>) {
    return await employeeService.updateDocument(id, data);
  }

  async function deleteDocument(id: number) {
    return await employeeService.deleteDocument(id);
  }

  async function downloadDocument(id: number) {
    return await employeeService.downloadDocument(id);
  }

  // Qualification Management
  async function fetchQualifications(employeeId: number) {
    const response = await employeeService.getQualifications(employeeId);
    return response.data.data;
  }

  async function saveQualification(data: FormData) {
    return await employeeService.saveQualification(data);
  }

  // Alias for backward compatibility
  async function createQualification(data: FormData) {
    return await saveQualification(data);
  }

  async function updateQualification(id: number, data: Partial<Qualification>) {
    return await employeeService.updateQualification(id, data);
  }

  async function deleteQualification(id: number) {
    return await employeeService.deleteQualification(id);
  }

  // Certificate Management
  async function fetchCertificates(employeeId: number) {
    const response = await employeeService.getCertificates(employeeId);
    return response.data.data;
  }

  async function saveCertificate(data: FormData) {
    return await employeeService.saveCertificate(data);
  }

  async function deleteCertificate(id: number) {
    return await employeeService.deleteCertificate(id);
  }

  // Nominee Management
  async function fetchNominees(employeeId: number) {
    const response = await employeeService.getNominees(employeeId);
    // API returns: { success: true, data: { nominees: [...], total_percentage, ... } }
    return response.data.data.nominees || [];
  }

  async function saveNominee(data: Nominee) {
    return await employeeService.saveNominee(data);
  }

  async function createNominee(data: Partial<Nominee>) {
    return await employeeService.saveNominee(data as Nominee);
  }

  async function updateNominee(id: number, data: Nominee) {
    return await employeeService.updateNominee(id, data);
  }

  async function deleteNominee(id: number) {
    return await employeeService.deleteNominee(id);
  }

  async function verifyNomineePercentage(employeeId: number, percentage?: number, excludeId?: number) {
    const response = await employeeService.verifyNomineePercentage(employeeId);
    return response.data;
  }

  // Master Data Loading
  async function loadDepartments() {
    if (departments.value.length === 0) {
      const response = await employeeService.getDepartments();
      console.log('Departments API response:', response);
      console.log('Departments data:', response.data);
      console.log('Departments array:', response.data.data);
      departments.value = response.data.data;
      console.log('Departments stored:', departments.value);
    }
  }

  async function loadDesignations() {
    if (designations.value.length === 0) {
      const response = await employeeService.getDesignations();
      console.log('Designations API response:', response.data);
      designations.value = response.data.data;
      console.log('Designations stored:', designations.value);
    }
  }

  async function loadTeams() {
    if (teams.value.length === 0) {
      const response = await employeeService.getTeams();
      console.log('Teams API response:', response.data);
      teams.value = response.data.data;
      console.log('Teams stored:', teams.value);
    }
  }

  async function loadCountries() {
    if (countries.value.length === 0) {
      const response = await employeeService.getCountries();
      countries.value = response.data.data;
    }
  }

  async function loadStates(countryId: number) {
    const response = await employeeService.getStates(countryId);
    states.value = response.data.data;
  }

  async function loadCities(stateId: number) {
    const response = await employeeService.getCities(stateId);
    cities.value = response.data.data;
  }

  async function loadDocumentTypes(idProofFor?: number) {
    const response = await employeeService.getDocumentTypes(idProofFor);
    documentTypes.value = response.data.data;
  }

  async function loadQualifications() {
    if (qualifications.value.length === 0) {
      const response = await employeeService.getQualificationMasters();
      qualifications.value = response.data.data;
    }
  }

  // Alias for backward compatibility
  async function loadQualificationMasters() {
    return await loadQualifications();
  }

  async function loadUniversities() {
    if (universities.value.length === 0) {
      const response = await employeeService.getUniversities();
      universities.value = response.data.data;
    }
  }

  async function loadRelationships() {
    if (relationships.value.length === 0) {
      const response = await employeeService.getRelationships();
      relationships.value = response.data.data;
    }
  }

  // Profile Picture Management
  async function uploadProfilePicture(employeeId: number, file: File) {
    loading.value = true;
    error.value = null;
    try {
      const response = await employeeService.uploadProfilePicture(employeeId, file);
      // Refresh employee data to get updated profile picture URL
      await fetchEmployeeById(employeeId);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to upload profile picture';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfilePicture(employeeId: number, file: File) {
    loading.value = true;
    error.value = null;
    try {
      const response = await employeeService.updateProfilePicture(employeeId, file);
      // Refresh employee data to get updated profile picture URL
      await fetchEmployeeById(employeeId);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update profile picture';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeProfilePicture(employeeId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await employeeService.removeProfilePicture(employeeId);
      // Refresh employee data to clear profile picture
      await fetchEmployeeById(employeeId);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to remove profile picture';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getProfilePictureUrl(employeeId: number) {
    try {
      const response = await employeeService.getProfilePictureUrl(employeeId);
      return response.data.data?.file_url;
    } catch (err: any) {
      console.error('Failed to get profile picture URL:', err);
      return null;
    }
  }

  return {
    // State
    employees,
    currentEmployee,
    loading,
    error,
    departments,
    designations,
    teams,
    countries,
    states,
    cities,
    documentTypes,
    qualifications,
    universities,
    relationships,
    
    // Computed
    activeEmployees,
    totalEmployees,
    
    // Actions
    fetchEmployees,
    fetchEmployeesForDropdown,
    fetchReportingManagers,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getProfileCompleteness,
    getNextEmployeeCode,
    generateEmployeeCode,
    
    // Address
    fetchAddresses,
    saveCurrentAddress,
    savePermanentAddress,
    copyCurrentToPermanent,
    
    // Bank Details
    fetchBankDetails,
    saveBankDetails,
    createBankDetails,
    updateBankDetails,
    deleteBankDetails,
    setActiveBankAccount,
    setActiveBankDetails,
    
    // Documents
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    
    // Qualifications
    fetchQualifications,
    saveQualification,
    createQualification,
    updateQualification,
    deleteQualification,
    
    // Certificates
    fetchCertificates,
    saveCertificate,
    deleteCertificate,
    
    // Nominees
    fetchNominees,
    saveNominee,
    createNominee,
    updateNominee,
    deleteNominee,
    verifyNomineePercentage,
    
    // Master Data
    loadDepartments,
    loadDesignations,
    loadTeams,
    loadCountries,
    loadStates,
    loadCities,
    loadDocumentTypes,
    loadQualifications,
    loadQualificationMasters,
    loadUniversities,
    loadRelationships,
    
    // Profile Picture
    uploadProfilePicture,
    updateProfilePicture,
    removeProfilePicture,
    getProfilePictureUrl,
  };
});
