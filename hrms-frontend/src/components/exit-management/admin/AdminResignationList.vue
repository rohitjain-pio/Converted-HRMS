<template>
  <div class="admin-resignation-list">
    <h2>Resignation Management</h2>

    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>Search Employee</label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Name or ID..."
            @input="handleFilterChange"
          />
        </div>
        
        <div class="filter-group">
          <label>Department</label>
          <select v-model="filters.departmentId" @change="handleFilterChange">
            <option value="">All Departments</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="handleFilterChange">
            <option value="">All Status</option>
            <option value="1">Submitted</option>
            <option value="2">Accepted</option>
            <option value="3">Rejected</option>
            <option value="4">Withdrawn</option>
            <option value="5">Completed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>From Date</label>
          <input type="date" v-model="filters.fromDate" @change="handleFilterChange" />
        </div>

        <div class="filter-group">
          <label>To Date</label>
          <input type="date" v-model="filters.toDate" @change="handleFilterChange" />
        </div>

        <div class="filter-actions">
          <button @click="resetFilters" class="btn-secondary">Reset</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading resignations...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else class="table-container">
      <table class="resignations-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Department</th>
            <th>Submission Date</th>
            <th>Last Working Day</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredResignations.length === 0">
            <td colspan="7" class="no-data">No resignations found</td>
          </tr>
          <tr v-for="resignation in paginatedResignations" :key="resignation.Id">
            <td>{{ resignation.EmployeeId }}</td>
            <td>{{ getEmployeeName(resignation.EmployeeId) }}</td>
            <td>{{ getDepartmentName(resignation.DepartmentID) }}</td>
            <td>{{ formatDate(resignation.CreatedOn) }}</td>
            <td>{{ formatDate(resignation.LastWorkingDay) }}</td>
            <td>
              <span class="status-badge" :style="{ backgroundColor: getStatusColor(resignation.Status) }">
                {{ getResignationStatusLabel(resignation.Status) }}
              </span>
            </td>
            <td>
              <button @click="viewDetails(resignation.Id)" class="btn-action">
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn-pagination">
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';
import { formatDate, getResignationStatusLabel, getStatusBadgeColor } from '@/utils/exitManagementHelpers';

const router = useRouter();

const resignations = ref<any[]>([]);
const departments = ref<any[]>([]);
const employees = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const filters = ref({
  search: '',
  departmentId: '',
  status: '',
  fromDate: '',
  toDate: '',
});

const currentPage = ref(1);
const pageSize = ref(10);

const filteredResignations = computed(() => {
  let result = resignations.value;

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(r => 
      r.EmployeeId.toString().includes(search) ||
      getEmployeeName(r.EmployeeId).toLowerCase().includes(search)
    );
  }

  if (filters.value.departmentId) {
    result = result.filter(r => r.DepartmentID === parseInt(filters.value.departmentId));
  }

  if (filters.value.status) {
    result = result.filter(r => r.Status === parseInt(filters.value.status));
  }

  if (filters.value.fromDate) {
    result = result.filter(r => new Date(r.CreatedOn) >= new Date(filters.value.fromDate));
  }

  if (filters.value.toDate) {
    result = result.filter(r => new Date(r.CreatedOn) <= new Date(filters.value.toDate));
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredResignations.value.length / pageSize.value));

const paginatedResignations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredResignations.value.slice(start, end);
});

function getStatusColor(status: number) {
  const color = getStatusBadgeColor(status);
  const colorMap: Record<string, string> = {
    'orange': '#ffc107',
    'green': '#28a745',
    'red': '#dc3545',
    'gray': '#6c757d',
    'blue': '#17a2b8',
  };
  return colorMap[color] || '#6c757d';
}

function getEmployeeName(employeeId: number): string {
  const emp = employees.value.find(e => e.id === employeeId);
  return emp ? emp.name : `Employee ${employeeId}`;
}

function getDepartmentName(deptId: number): string {
  const dept = departments.value.find(d => d.id === deptId);
  return dept ? dept.name : `Dept ${deptId}`;
}

function handleFilterChange() {
  currentPage.value = 1;
}

function resetFilters() {
  filters.value = {
    search: '',
    departmentId: '',
    status: '',
    fromDate: '',
    toDate: '',
  };
  currentPage.value = 1;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function viewDetails(resignationId: number) {
  router.push({ name: 'AdminResignationDetail', params: { id: resignationId } });
}

async function loadResignations() {
  loading.value = true;
  error.value = null;

  const result = await adminExitEmployeeApi.getResignationList({});

  loading.value = false;

  if (result.data.StatusCode === 200) {
    resignations.value = result.data.Data || [];
  } else {
    error.value = result.data.Message || 'Failed to load resignations';
  }
}

onMounted(() => {
  loadResignations();
  // Load departments and employees from your existing stores/APIs
});
</script>

<style scoped>
.admin-resignation-list {
  padding: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
}

.filters-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #555;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.btn-secondary {
  padding: 8px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-message {
  color: #dc3545;
}

.table-container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.resignations-table {
  width: 100%;
  border-collapse: collapse;
}

.resignations-table th {
  background-color: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
}

.resignations-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 40px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.btn-action {
  padding: 6px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.btn-action:hover {
  background-color: #0056b3;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.btn-pagination {
  padding: 6px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-pagination:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #555;
}
</style>
