<template>
  <app-layout>
    <v-container fluid class="pa-4">
      <v-card elevation="3">
        <v-card-title class="pa-4 text-h5">
          Employee Exit
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Search Bar -->
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                label="Search by Employee Code or Name"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                clearable
                @update:model-value="handleSearchInput"
                placeholder="Enter employee code or name..."
              />
            </v-col>
          </v-row>

          <!-- Filters Section -->
          <v-expand-transition>
            <div v-if="showFilters" class="mb-4">
              <v-row>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.resignationStatus"
                    label="Resignation Status"
                    :items="resignationStatusOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.departmentId"
                    label="Department"
                    :items="departmentOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                    :loading="loadingDepartments"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.branchId"
                    label="Branch"
                    :items="branchOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                    :loading="loadingBranches"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.itNoDue"
                    label="IT No Due"
                    :items="booleanOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.accountsNoDue"
                    label="Accounts No Due"
                    :items="booleanOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="lastWorkingDayRange"
                    label="Last Working Day Range"
                    :items="dateRangeOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                    @update:model-value="handleDateRangeChange"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filters.resignationDate"
                    label="Resignation Date"
                    type="date"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.employeeStatus"
                    label="Employee Status"
                    :items="employeeStatusOptions"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    clearable
                  />
                </v-col>
              </v-row>
              <v-row v-if="lastWorkingDayRange === 'custom'">
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filters.lastWorkingDayFrom"
                    label="Last Working From"
                    type="date"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filters.lastWorkingDayTo"
                    label="Last Working To"
                    type="date"
                    density="compact"
                    clearable
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-btn color="primary" @click="handleSearch" class="mr-2">
                    <v-icon start>mdi-magnify</v-icon>
                    Search
                  </v-btn>
                  <v-btn @click="handleReset">
                    <v-icon start>mdi-refresh</v-icon>
                    Reset
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <!-- Toolbar -->
          <div class="d-flex align-center mb-4">
            <v-btn
              variant="text"
              @click="showFilters = !showFilters"
              :color="showFilters ? 'primary' : undefined"
            >
              <v-icon start>mdi-filter</v-icon>
              {{ showFilters ? 'Hide' : 'Show' }} Filters
            </v-btn>
            <v-spacer />
            <v-btn
              variant="text"
              :loading="loading"
              @click="fetchData"
            >
              <v-icon start>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </div>

          <!-- Data Table -->
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            v-model:sort-by="sortBy"
            :headers="headers"
            :items="exitEmployeeList"
            :items-length="totalRecords"
            :loading="loading"
            class="elevation-1"
            item-value="resignationId"
            @update:options="loadItems"
          >
            <template #item.resignationDate="{ item }">
              {{ formatDate(item.resignationDate) }}
            </template>

            <template #item.lastWorkingDay="{ item }">
              {{ formatDate(item.lastWorkingDay) }}
            </template>

            <template #item.resignationStatus="{ item }">
              <v-chip
                :color="getResignationStatusColor(item.resignationStatus)"
                size="small"
              >
                {{ getResignationStatusLabel(item.resignationStatus) }}
              </v-chip>
            </template>

            <template #item.employeeStatus="{ item }">
              <v-chip
                :color="getEmployeeStatusColor(item.employeeStatus)"
                size="small"
              >
                {{ getEmployeeStatusLabel(item.employeeStatus) }}
              </v-chip>
            </template>

            <template #item.ktStatus="{ item }">
              {{ getKTStatusLabel(item.ktStatus) }}
            </template>

            <template #item.exitInterviewStatus="{ item }">
              <v-chip
                :color="item.exitInterviewStatus ? 'success' : 'warning'"
                size="small"
              >
                {{ item.exitInterviewStatus ? 'Completed' : 'Pending' }}
              </v-chip>
            </template>

            <template #item.itNoDue="{ item }">
              <v-icon :color="item.itNoDue ? 'success' : 'error'" size="small">
                {{ item.itNoDue ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </template>

            <template #item.accountsNoDue="{ item }">
              <v-icon :color="item.accountsNoDue ? 'success' : 'error'" size="small">
                {{ item.accountsNoDue ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                :to="`/employees/employee-exit/${item.resignationId}`"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>

            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey">mdi-database-off</v-icon>
                <p class="text-h6 mt-2">No resignation records found</p>
              </div>
            </template>
          </v-data-table-server>
        </v-card-text>
      </v-card>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';
import { employeeService } from '@/services/employeeService';
import type { ExitEmployeeListItem } from '@/types/exitEmployee.types';

const router = useRouter();

// State
const exitEmployeeList = ref<ExitEmployeeListItem[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const showFilters = ref(false);
const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<any[]>([]);
const lastWorkingDayRange = ref<string>('');
const searchQuery = ref<string>('');

// Department and Branch state
const departmentOptions = ref<Array<{ label: string; value: number }>>([]);
const branchOptions = ref<Array<{ label: string; value: number }>>([]);
const loadingDepartments = ref(false);
const loadingBranches = ref(false);

// Filters
const filters = reactive({
  employeeCode: '',
  employeeName: '',
  resignationStatus: 0,
  branchId: 0,
  departmentId: 0,
  itNoDue: null as boolean | null,
  accountsNoDue: null as boolean | null,
  lastWorkingDayFrom: null as string | null,
  lastWorkingDayTo: null as string | null,
  resignationDate: null as string | null,
  employeeStatus: 0,
});

// Table headers
const headers = [
  { title: 'Employee Code', key: 'employeeCode', sortable: true },
  { title: 'Employee Name', key: 'employeeName', sortable: true },
  { title: 'Department', key: 'departmentName', sortable: true },
  { title: 'Branch', key: 'branchName', sortable: true },
  { title: 'Resignation Date', key: 'resignationDate', sortable: true },
  { title: 'Last Working Day', key: 'lastWorkingDay', sortable: true },
  { title: 'Resignation Status', key: 'resignationStatus', sortable: true },
  { title: 'Employee Status', key: 'employeeStatus', sortable: true },
  { title: 'KT Status', key: 'ktStatus', sortable: false },
  { title: 'Exit Interview', key: 'exitInterviewStatus', sortable: false },
  { title: 'IT No Due', key: 'itNoDue', sortable: false },
  { title: 'Accounts No Due', key: 'accountsNoDue', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
];

// Options
const resignationStatusOptions = [
  { label: 'All', value: 0 },
  { label: 'Pending', value: 1 },
  { label: 'Revoked', value: 2 },
  { label: 'Accepted', value: 3 },
  { label: 'Cancelled', value: 4 },
  { label: 'Completed', value: 5 },
];

const employeeStatusOptions = [
  { label: 'All', value: 0 },
  { label: 'Active', value: 1 },
  { label: 'F&F Pending', value: 2 },
  { label: 'On Notice', value: 3 },
  { label: 'Ex Employee', value: 4 },
];

const booleanOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const dateRangeOptions = [
  { label: 'Next 15 Days', value: 'next15Days' },
  { label: 'Next 30 Days', value: 'next30Days' },
  { label: 'Next 90 Days', value: 'next90Days' },
  { label: 'Custom', value: 'custom' },
];

// Methods
const fetchDepartments = async () => {
  loadingDepartments.value = true;
  try {
    const response = await employeeService.getDepartments();
    if (response.data.statusCode === 200) {
      departmentOptions.value = [
        { label: 'All', value: 0 },
        ...response.data.result.map((dept: any) => ({
          label: dept.departmentName,
          value: dept.departmentId,
        })),
      ];
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
  } finally {
    loadingDepartments.value = false;
  }
};

const fetchBranches = async () => {
  loadingBranches.value = true;
  try {
    const response = await employeeService.getBranches();
    if (response.data.statusCode === 200) {
      branchOptions.value = [
        { label: 'All', value: 0 },
        ...response.data.result.map((branch: any) => ({
          label: branch.branchName,
          value: branch.branchId,
        })),
      ];
    }
  } catch (error) {
    console.error('Error fetching branches:', error);
  } finally {
    loadingBranches.value = false;
  }
};

const handleDateRangeChange = (value: string) => {
  const today = new Date();
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  switch (value) {
    case 'next15Days':
      fromDate = new Date(today);
      toDate = new Date(today.setDate(today.getDate() + 15));
      break;
    case 'next30Days':
      fromDate = new Date(today);
      toDate = new Date(today.setDate(today.getDate() + 30));
      break;
    case 'next90Days':
      fromDate = new Date(today);
      toDate = new Date(today.setDate(today.getDate() + 90));
      break;
    case 'custom':
      filters.lastWorkingDayFrom = null;
      filters.lastWorkingDayTo = null;
      return;
  }

  if (fromDate && toDate) {
    filters.lastWorkingDayFrom = fromDate.toISOString().split('T')[0];
    filters.lastWorkingDayTo = toDate.toISOString().split('T')[0];
  }
};

let searchTimeout: NodeJS.Timeout;
const handleSearchInput = (value: string | null) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // Update filters based on search query
    if (value && value.trim()) {
      // Check if it looks like an employee code (alphanumeric) or name (mostly letters)
      const trimmedValue = value.trim();
      if (/^\d+$/.test(trimmedValue) || /^[A-Z0-9-]+$/i.test(trimmedValue)) {
        // Likely an employee code
        filters.employeeCode = trimmedValue;
        filters.employeeName = '';
      } else {
        // Likely a name
        filters.employeeCode = '';
        filters.employeeName = trimmedValue;
      }
    } else {
      filters.employeeCode = '';
      filters.employeeName = '';
    }
    page.value = 1;
    fetchData();
  }, 600); // Debounce for 600ms like legacy
};

const fetchData = async () => {
  loading.value = true;
  try {
    const sortColumnName = sortBy.value[0]?.key || 'resignationDate';
    const sortDirection = sortBy.value[0]?.order === 'desc' ? 'DESC' : 'ASC';

    const response = await adminExitEmployeeApi.getResignationList({
      sortColumnName,
      sortDirection,
      startIndex: (page.value - 1) * itemsPerPage.value,
      pageSize: itemsPerPage.value,
      filters: filters,
    });

    if (response.data.statusCode === 200) {
      exitEmployeeList.value = response.data.result.exitEmployeeList;
      totalRecords.value = response.data.result.totalRecords;
    }
  } catch (error: any) {
    console.error('Error fetching exit employee list:', error);
  } finally {
    loading.value = false;
  }
};

const loadItems = () => {
  fetchData();
};

const handleSearch = () => {
  page.value = 1;
  fetchData();
};

const handleReset = () => {
  searchQuery.value = '';
  Object.assign(filters, {
    employeeCode: '',
    employeeName: '',
    resignationStatus: 0,
    branchId: 0,
    departmentId: 0,
    itNoDue: null,
    accountsNoDue: null,
    lastWorkingDayFrom: null,
    lastWorkingDayTo: null,
    resignationDate: null,
    employeeStatus: 0,
  });
  lastWorkingDayRange.value = '';
  page.value = 1;
  fetchData();
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getResignationStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    1: 'Pending',
    2: 'Revoked',
    3: 'Accepted',
    4: 'Cancelled',
    5: 'Completed',
  };
  return labels[status] || 'Unknown';
};

const getResignationStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    1: 'warning',
    2: 'grey',
    3: 'success',
    4: 'error',
    5: 'info',
  };
  return colors[status] || 'default';
};

const getEmployeeStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    1: 'Active',
    2: 'F&F Pending',
    3: 'On Notice',
    4: 'Ex Employee',
  };
  return labels[status] || 'Unknown';
};

const getEmployeeStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'grey',
  };
  return colors[status] || 'default';
};

const getKTStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    0: 'Pending',
    1: 'In Progress',
    2: 'Completed',
  };
  return labels[status] || 'Pending';
};

// Lifecycle
onMounted(() => {
  fetchDepartments();
  fetchBranches();
  fetchData();
});
</script>
