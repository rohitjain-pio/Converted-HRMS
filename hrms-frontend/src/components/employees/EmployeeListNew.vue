<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useRouter } from 'vue-router';
import { employeeService } from '@/services/employeeService';
import type { Employee } from '@/types/employee';

const router = useRouter();
const employeeStore = useEmployeeStore();

// State
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showFilters = ref(false);

// Filters
const filters = ref({
  departmentId: 0,
  designationId: 0,
  employeeStatus: 0,
  branchId: 0,
});

// Column visibility
const visibleColumns = ref({
  employeeCode: true,
  employeeName: true,
  joiningDate: true,
  branch: true,
  country: true,
  department: true,
  designation: true,
  phone: true,
  status: true,
  actions: true,
});

// Branch mapping (from legacy BRANCH_LOCATION_LABEL)
const BRANCH_LOCATION_LABEL: Record<number, string> = {
  1: 'Hyderabad',
  2: 'Jaipur',
  3: 'Pune',
};

// Status mapping (matches legacy EmployeeStatusType enum - using employment_status field)
const EMPLOYMENT_STATUS_LABEL: Record<number, string> = {
  1: 'Active',
  2: 'Inactive',
  3: 'Terminated',
  4: 'Resigned',
};

// Computed
const filteredEmployees = computed(() => {
  let result = employeeStore.employees || [];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((emp: Employee) => 
      emp.first_name?.toLowerCase().includes(query) ||
      emp.last_name?.toLowerCase().includes(query) ||
      emp.employee_code?.toLowerCase().includes(query)
    );
  }
  
  // Apply department filter
  if (filters.value.departmentId > 0) {
    result = result.filter((emp: Employee) => 
      emp.employment_detail?.department_id === filters.value.departmentId
    );
  }
  
  // Apply designation filter
  if (filters.value.designationId > 0) {
    result = result.filter((emp: Employee) => 
      emp.employment_detail?.designation_id === filters.value.designationId
    );
  }
  
  // Apply branch filter
  if (filters.value.branchId > 0) {
    result = result.filter((emp: Employee) => 
      emp.employment_detail?.branch_id === filters.value.branchId
    );
  }
  
  // Apply status filter
  if (filters.value.employeeStatus > 0) {
    const statusMap: Record<number, string> = {
      1: 'Active',
      2: 'Inactive',
      3: 'Terminated',
      4: 'Resigned',
    };
    const targetStatus = statusMap[filters.value.employeeStatus];
    result = result.filter((emp: Employee) => 
      emp.employment_detail?.employment_status === targetStatus ||
      emp.employment_status === targetStatus
    );
  }
  
  return result;
});

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredEmployees.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredEmployees.value.length / pageSize.value);
});

const totalRecords = computed(() => filteredEmployees.value.length);

onMounted(async () => {
  loading.value = true;
  try {
    await employeeStore.fetchEmployees();
    await employeeStore.loadDepartments();
    await employeeStore.loadDesignations();
  } catch (error) {
    console.error('Failed to load employee data:', error);
  } finally {
    loading.value = false;
  }
});

const resetFilters = () => {
  filters.value = {
    departmentId: 0,
    designationId: 0,
    employeeStatus: 0,
    branchId: 0,
  };
  searchQuery.value = '';
  currentPage.value = 1;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handlePageSizeChange = () => {
  currentPage.value = 1;
};

const viewEmployee = (id: number) => {
  router.push({ name: 'EmployeeDetails', params: { id } });
};

const editEmployee = (id: number) => {
  router.push({ name: 'EmployeeEdit', params: { id } });
};

const addEmployee = () => {
  router.push({ name: 'EmployeeAdd' });
};

const exportToExcel = async () => {
  try {
    loading.value = true;
    
    // Pass current filters to export
    const filterParams = {
      search: searchQuery.value || undefined,
      department_id: filters.value.departmentId > 0 ? filters.value.departmentId : undefined,
      designation_id: filters.value.designationId > 0 ? filters.value.designationId : undefined,
      branch_id: filters.value.branchId > 0 ? filters.value.branchId : undefined,
      status: filters.value.employeeStatus > 0 ? filters.value.employeeStatus : undefined,
    };

    const response = await employeeService.exportEmployees(filterParams);
    
    // Create download link
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5).replace('T', '_');
    link.download = `EmployeeList_${timestamp}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Export completed successfully');
  } catch (error: any) {
    console.error('Export failed:', error);
    alert('Export failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

const fileInputRef = ref<HTMLInputElement | null>(null);
const showImportDialog = ref(false);
const importValidationResult = ref<any>(null);

const importFromExcel = () => {
  // Trigger file input click
  fileInputRef.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    loading.value = true;
    
    // First, validate the file without importing (importConfirmed=false)
    const validationResponse = await employeeService.importEmployees(file, false);
    
    if (validationResponse.data.status_code === 200) {
      // Parse validation results
      const results = JSON.parse(validationResponse.data.message);
      importValidationResult.value = results;
      
      // Check if there are any valid records
      if (results.validRecordsCount > 0) {
        // Show confirmation dialog
        showImportDialog.value = true;
      } else {
        alert(`No valid records to import.\n\nDuplicates: ${results.duplicateCount}\nInvalid: ${results.invalidCount}`);
      }
    }
  } catch (error: any) {
    console.error('Import validation failed:', error);
    alert('Import validation failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
  } finally {
    loading.value = false;
    if (target) target.value = ''; // Reset file input
  }
};

const confirmImport = async () => {
  if (!fileInputRef.value?.files?.[0]) return;
  
  const file = fileInputRef.value.files[0];
  
  try {
    loading.value = true;
    showImportDialog.value = false;
    
    // Actually import the data (importConfirmed=true)
    const response = await employeeService.importEmployees(file, true);
    
    if (response.data.status_code === 200) {
      alert(response.data.message);
      // Refresh employee list
      await employeeStore.fetchEmployees();
      currentPage.value = 1; // Reset to first page
    } else {
      alert('Import failed: ' + response.data.message);
    }
  } catch (error: any) {
    console.error('Import failed:', error);
    alert('Import failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
  } finally {
    loading.value = false;
    importValidationResult.value = null;
  }
};

const cancelImport = () => {
  showImportDialog.value = false;
  importValidationResult.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const getStatusColor = (empStatus?: number) => {
  // Map numeric status to color
  if (!empStatus) return 'success'; // Default to Active
  
  const colorMap: Record<number, string> = {
    1: 'success',    // Active
    2: 'warning',    // Inactive
    3: 'info',       // On Notice / Terminated
    4: 'error',      // Ex-Employee / Resigned
  };
  return colorMap[empStatus] || 'success';
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const relevantDigit = day % 10;
  const suffix = (relevantDigit <= 3 && (day < 11 || day > 13)) ? suffixes[relevantDigit] : suffixes[0];
  return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
};

const getBranchLabel = (branchId: number | undefined) => {
  if (!branchId) return 'N/A';
  return BRANCH_LOCATION_LABEL[branchId] || 'N/A';
};

const getEmployeeName = (employee: Employee) => {
  const parts = [
    employee.first_name,
    employee.middle_name,
    employee.last_name
  ].filter(Boolean);
  return parts.join(' ');
};

const getDepartmentName = (employee: Employee) => {
  return employee.employment_detail?.department_name || 
         employee.employment_detail?.department?.department || 
         'N/A';
};

const getDesignation = (employee: Employee) => {
  return employee.employment_detail?.designation || 
         employee.employment_detail?.designation_model?.designation || 
         'N/A';
};

const getJoiningDate = (employee: Employee) => {
  return employee.employment_detail?.joining_date || null;
};

const getEmployeeStatusCode = (employee: Employee): number => {
  // Try employment_status first
  if (employee.employment_detail?.employment_status) {
    const status = employee.employment_detail.employment_status;
    return typeof status === 'number' ? status : parseInt(String(status)) || 1;
  }
  // Try employee_status
  if (employee.employment_detail?.employee_status) {
    const status = employee.employment_detail.employee_status;
    return typeof status === 'number' ? status : parseInt(String(status)) || 1;
  }
  // Try status from employee_data table
  if (employee.status) {
    return typeof employee.status === 'number' ? employee.status : parseInt(String(employee.status)) || 1;
  }
  return 1; // Default to Active
};

const getEmployeeStatus = (employee: Employee) => {
  const statusCode = getEmployeeStatusCode(employee);
  return EMPLOYMENT_STATUS_LABEL[statusCode] || 'Active';
};

const getCountry = (_employee: Employee) => {
  // TODO: Get country from employee.currentAddress.country when API returns it
  return 'India'; // Default for now
};
</script>

<template>
  <div class="employee-list">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Employees List</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showFilters = !showFilters">
          <span class="icon">🔍</span>
          {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
        </button>
        <button class="btn btn-secondary" @click="exportToExcel">
          <span class="icon">📊</span>
          Export
        </button>
        <button class="btn btn-secondary" @click="importFromExcel">
          <span class="icon">📥</span>
          Import
        </button>
        <button class="btn btn-primary" @click="addEmployee">
          <span class="icon">+</span>
          Add Employee
        </button>
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div v-if="showFilters" class="filters-panel">
      <div class="filter-grid">
        <div class="filter-item">
          <label>Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Employee code, name..."
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <label>Department</label>
          <select v-model="filters.departmentId" class="filter-input">
            <option :value="0">All Departments</option>
            <option 
              v-for="dept in employeeStore.departments" 
              :key="dept.id" 
              :value="dept.id"
            >
              {{ dept.department || dept.name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>Designation</label>
          <select v-model="filters.designationId" class="filter-input">
            <option :value="0">All Designations</option>
            <option 
              v-for="desig in employeeStore.designations" 
              :key="desig.id" 
              :value="desig.id"
            >
              {{ desig.designation || desig.name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>Status</label>
          <select v-model="filters.employeeStatus" class="filter-input">
            <option :value="0">All Status</option>
            <option :value="1">Active</option>
            <option :value="2">Inactive</option>
            <option :value="3">Terminated</option>
            <option :value="4">Resigned</option>
          </select>
        </div>
        <div class="filter-item">
          <label>Branch</label>
          <select v-model="filters.branchId" class="filter-input">
            <option :value="0">All Branches</option>
            <option :value="1">Hyderabad</option>
            <option :value="2">Jaipur</option>
            <option :value="3">Pune</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-sm btn-secondary" @click="resetFilters">
          Reset Filters
        </button>
        <span class="filter-count">{{ totalRecords }} employees found</span>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-wrapper">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        Loading employees...
      </div>

      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th v-if="visibleColumns.employeeCode">Employee Code</th>
              <th v-if="visibleColumns.employeeName">Employee Name</th>
              <th v-if="visibleColumns.joiningDate">DOJ</th>
              <th v-if="visibleColumns.branch">Branch</th>
              <th v-if="visibleColumns.country">Country</th>
              <th v-if="visibleColumns.department">Department</th>
              <th v-if="visibleColumns.designation">Designation</th>
              <th v-if="visibleColumns.phone">Mobile No</th>
              <th v-if="visibleColumns.status">Employee Status</th>
              <th v-if="visibleColumns.actions" class="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="employee in paginatedEmployees" 
              :key="employee.id"
              class="table-row"
            >
              <td v-if="visibleColumns.employeeCode">{{ employee.employee_code }}</td>
              <td v-if="visibleColumns.employeeName" class="employee-name">
                {{ getEmployeeName(employee) }}
              </td>
              <td v-if="visibleColumns.joiningDate">{{ formatDate(getJoiningDate(employee)) }}</td>
              <td v-if="visibleColumns.branch">{{ getBranchLabel(employee.employment_detail?.branch_id) }}</td>
              <td v-if="visibleColumns.country">{{ getCountry(employee) }}</td>
              <td v-if="visibleColumns.department">{{ getDepartmentName(employee) }}</td>
              <td v-if="visibleColumns.designation">{{ getDesignation(employee) }}</td>
              <td v-if="visibleColumns.phone">{{ employee.phone || 'N/A' }}</td>
              <td v-if="visibleColumns.status">
                <span 
                  class="status-badge" 
                  :class="`status-${getStatusColor(getEmployeeStatusCode(employee))}`"
                >
                  {{ getEmployeeStatus(employee) }}
                </span>
              </td>
              <td v-if="visibleColumns.actions" class="actions-cell">
                <button 
                  class="btn-icon" 
                  @click="viewEmployee(employee.id)"
                  title="View Details"
                  aria-label="View Employee Details"
                >
                  👁️
                </button>
                <button 
                  class="btn-icon" 
                  @click="editEmployee(employee.id)"
                  title="Edit"
                  aria-label="Edit Employee"
                >
                  ✏️
                </button>
              </td>
            </tr>
            <tr v-if="paginatedEmployees.length === 0">
              <td :colspan="Object.values(visibleColumns).filter(v => v).length" class="no-data">
                <div class="no-data-content">
                  <span class="no-data-icon">📭</span>
                  <p>No employees found</p>
                  <p class="no-data-hint">Try adjusting your filters or search criteria</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="totalRecords > 0">
      <div class="pagination-info-left">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }} employees
      </div>
      
      <div class="pagination-controls">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          ← Previous
        </button>
        
        <span class="pagination-pages">
          <button
            v-for="page in Math.min(totalPages, 5)"
            :key="page"
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
          <span v-if="totalPages > 5">...</span>
        </span>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          Next →
        </button>
      </div>
      
      <div class="page-size-selector">
        <label>Rows:</label>
        <select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Hidden File Input for Import -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xls,.xlsx"
      style="display: none"
      @change="handleFileUpload"
    />

    <!-- Import Confirmation Dialog -->
    <div v-if="showImportDialog" class="dialog-overlay" @click="cancelImport">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>Confirm Import</h3>
          <button class="close-btn" @click="cancelImport">×</button>
        </div>
        <div class="dialog-body">
          <div v-if="importValidationResult" class="validation-summary">
            <p><strong>Import Summary:</strong></p>
            <ul>
              <li class="success">✓ Valid Records: {{ importValidationResult.validRecordsCount }}</li>
              <li v-if="importValidationResult.duplicateCount > 0" class="warning">
                ⚠ Duplicate Records: {{ importValidationResult.duplicateCount }}
              </li>
              <li v-if="importValidationResult.invalidCount > 0" class="error">
                ✗ Invalid Records: {{ importValidationResult.invalidCount }}
              </li>
            </ul>

            <div v-if="importValidationResult.duplicateCount > 0" class="details-section">
              <p><strong>Duplicate Records:</strong></p>
              <div class="records-list">
                <div v-for="(dup, index) in importValidationResult.duplicateRecords.slice(0, 5)" :key="index" class="record-item">
                  Code: {{ dup.code }}, Email: {{ dup.email }}
                </div>
                <p v-if="importValidationResult.duplicateRecords.length > 5">
                  ... and {{ importValidationResult.duplicateRecords.length - 5 }} more
                </p>
              </div>
            </div>

            <div v-if="importValidationResult.invalidCount > 0" class="details-section">
              <p><strong>Invalid Records:</strong></p>
              <div class="records-list">
                <div v-for="(inv, index) in importValidationResult.invalidRecords.slice(0, 5)" :key="index" class="record-item">
                  Row {{ inv.row }}: {{ inv.reason }}
                </div>
                <p v-if="importValidationResult.invalidRecords.length > 5">
                  ... and {{ importValidationResult.invalidRecords.length - 5 }} more
                </p>
              </div>
            </div>

            <p class="confirm-message">
              Do you want to import {{ importValidationResult.validRecordsCount }} valid record(s)?
            </p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="cancelImport">Cancel</button>
          <button class="btn btn-primary" @click="confirmImport">Import</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-list {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.icon {
  font-size: 16px;
}

/* Filters Panel */
.filters-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.filter-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-input:focus {
  outline: none;
  border-color: #1976d2;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.filter-count {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* Table */
.data-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.data-table-container {
  overflow-x: auto; /* CRITICAL: Enables horizontal scroll */
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px; /* Ensures scroll is needed for all columns */
}

.data-table thead {
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  border-bottom: 2px solid #ddd;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:hover {
  background-color: #f9fafb;
}

.employee-name {
  font-weight: 500;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-warning {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-error {
  background-color: #ffebee;
  color: #c62828;
}

.status-info {
  background-color: #e3f2fd;
  color: #1565c0;
}

.status-default {
  background-color: #f5f5f5;
  color: #666;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.actions-header {
  position: sticky;
  right: 0;
  background: #f8f9fa;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #e8e8e8;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-data-icon {
  font-size: 48px;
  opacity: 0.3;
}

.no-data-hint {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-info-left {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #1976d2;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-number {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-number:hover {
  background-color: #f5f5f5;
}

.page-number.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-selector label {
  font-size: 14px;
  color: #666;
}

.page-size-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #1976d2;
}

/* Responsive */
@media (max-width: 1024px) {
  .pagination-container {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .page-size-selector {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

/* Import Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.validation-summary {
  font-size: 14px;
}

.validation-summary ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.validation-summary li {
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 4px;
}

.validation-summary li.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.validation-summary li.warning {
  background: #fff3e0;
  color: #e65100;
}

.validation-summary li.error {
  background: #ffebee;
  color: #c62828;
}

.details-section {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.details-section p {
  margin: 5px 0;
  font-weight: 500;
}

.records-list {
  max-height: 150px;
  overflow-y: auto;
  margin-top: 5px;
}

.record-item {
  padding: 5px;
  font-size: 13px;
  color: #666;
}

.confirm-message {
  margin-top: 20px;
  font-weight: 500;
  color: #333;
}
</style>
