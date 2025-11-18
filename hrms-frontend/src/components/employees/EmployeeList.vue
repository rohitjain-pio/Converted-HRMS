<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useRouter } from 'vue-router';
import type { Employee } from '@/types/employee';
import moment from 'moment';

const router = useRouter();
const employeeStore = useEmployeeStore();

// State
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);
const sortField = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');

// Filters
const showFilters = ref(false);
const filters = ref({
  departmentId: 0,
  designationId: 0,
  employeeStatus: 0,
  branchId: 0,
  countryId: 0,
  dojFrom: null as string | null,
  dojTo: null as string | null,
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

// Status mapping
const EMPLOYEE_STATUS_LABEL: Record<number, string> = {
  1: 'Active',
  2: 'Inactive',
  3: 'Terminated',
  4: 'Resigned',
};

// Computed
const employees = computed(() => employeeStore.employees);

// Watch for page/sort changes to fetch data
watch([currentPage, pageSize, sortField, sortDirection, filters], async () => {
  await fetchEmployees();
}, { deep: true });

onMounted(async () => {
  await fetchEmployees();
  await loadMasterData();
});

// Fetch employees with backend pagination
const fetchEmployees = async () => {
  loading.value = true;
  try {
    // Build API request payload matching legacy format
    const payload = {
      sortColumnName: sortField.value || '',
      sortDirection: sortDirection.value || '',
      startIndex: (currentPage.value - 1) * pageSize.value,
      pageSize: pageSize.value,
      filters: {
        employeeCode: searchQuery.value || '',
        departmentId: filters.value.departmentId,
        designationId: filters.value.designationId,
        roleId: 0,
        employeeStatus: filters.value.employeeStatus,
        employmentStatus: 0,
        branchId: filters.value.branchId,
        dojFrom: filters.value.dojFrom,
        dojTo: filters.value.dojTo,
        countryId: filters.value.countryId,
      },
    };

    await employeeStore.fetchEmployees(payload);
    totalRecords.value = employeeStore.totalEmployees;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  } finally {
    loading.value = false;
  }
};

// Load master data for filters
const loadMasterData = async () => {
  try {
    await Promise.all([
      employeeStore.loadDepartments(),
      employeeStore.loadDesignations(),
    ]);
  } catch (error) {
    console.error('Failed to load master data:', error);
  }
};

const handleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // Reset to first page
};

const resetFilters = () => {
  filters.value = {
    departmentId: 0,
    designationId: 0,
    employeeStatus: 0,
    branchId: 0,
    countryId: 0,
    dojFrom: null,
    dojTo: null,
  };
  searchQuery.value = '';
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
  // TODO: Implement export functionality
  console.log('Export to Excel');
};

const importFromExcel = async () => {
  // TODO: Implement import functionality
  console.log('Import from Excel');
};

const getStatusColor = (status: string | number) => {
  const statusStr = typeof status === 'number' ? EMPLOYEE_STATUS_LABEL[status] : status;
  const colors: Record<string, string> = {
    'Active': 'success',
    'Inactive': 'warning',
    'Terminated': 'error',
    'Resigned': 'info'
  };
  return colors[statusStr] || 'default';
};

const formatDate = (date: string | null) => {
  if (!date) return 'N/A';
  return moment(date).format('MMM Do, YYYY');
};

const getBranchLabel = (branchId: number) => {
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

const getEmployeeEmail = (employee: Employee) => {
  return employee.employment_detail?.email || employee.personal_email || 'N/A';
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

const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / pageSize.value);
});
</script>

<template>
  <div class="employee-list">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Employees List</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showFilters = !showFilters">
          <span class="icon">🔍</span>
          Filters
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
              <th v-if="visibleColumns.employeeCode" @click="handleSort('employeeCode')" class="sortable">
                Employee Code
                <span class="sort-icon" v-if="sortField === 'employeeCode'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th v-if="visibleColumns.employeeName" @click="handleSort('employeeName')" class="sortable">
                Employee Name
                <span class="sort-icon" v-if="sortField === 'employeeName'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th v-if="visibleColumns.joiningDate" @click="handleSort('joiningDate')" class="sortable">
                DOJ
                <span class="sort-icon" v-if="sortField === 'joiningDate'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
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
              v-for="employee in employees" 
              :key="employee.id"
              class="table-row"
            >
              <td v-if="visibleColumns.employeeCode">{{ employee.employee_code }}</td>
              <td v-if="visibleColumns.employeeName" class="employee-name">
                {{ getEmployeeName(employee) }}
              </td>
              <td v-if="visibleColumns.joiningDate">{{ formatDate(getJoiningDate(employee)) }}</td>
              <td v-if="visibleColumns.branch">{{ getBranchLabel(employee.employment_detail?.branch_id || 0) }}</td>
              <td v-if="visibleColumns.country">{{ employee.country || 'N/A' }}</td>
              <td v-if="visibleColumns.department">{{ getDepartmentName(employee) }}</td>
              <td v-if="visibleColumns.designation">{{ getDesignation(employee) }}</td>
              <td v-if="visibleColumns.phone">{{ employee.phone || 'N/A' }}</td>
              <td v-if="visibleColumns.status">
                <span 
                  class="status-badge" 
                  :class="`status-${getStatusColor(employee.employment_detail?.employment_status || 1)}`"
                >
                  {{ EMPLOYEE_STATUS_LABEL[employee.employment_detail?.employment_status || 1] || 'Active' }}
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
            <tr v-if="employees.length === 0">
              <td :colspan="Object.values(visibleColumns).filter(v => v).length" class="no-data">
                No employees found
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
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          Next
        </button>
      </div>
      
      <div class="page-size-selector">
        <label>Rows per page:</label>
        <select v-model="pageSize" @change="handlePageSizeChange(pageSize)" class="page-size-select">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-list {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.search-section {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}

.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-spinner {
  padding: 60px;
  text-align: center;
  color: #666;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f5f5f5;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  border-bottom: 2px solid #ddd;
}

.data-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.employee-name {
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #f0f0f0;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}
</style>
