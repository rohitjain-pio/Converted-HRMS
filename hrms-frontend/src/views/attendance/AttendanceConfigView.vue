<template>
  <app-layout>
    <v-container fluid>
      <v-breadcrumbs :items="breadcrumbItems" class="px-0 pb-4" />
      
      <v-card elevation="3">
        <v-card-title class="pa-4" style="border-bottom: none;">
          <span class="text-h5">Attendance Configuration</span>
        </v-card-title>
      
        <v-card-text class="pa-4">
          <!-- Top Toolbar - Exactly matching legacy -->
          <div class="d-flex align-center mb-4" style="gap: 4px;">
            <v-spacer />

            <!-- Employee Search (on right side) -->
            <v-autocomplete
              v-model="selectedEmployees"
              v-model:search="employeeSearch"
              :items="employeeOptions"
              label="Search Employee"
              multiple
              chips
              closable-chips
              density="compact"
              variant="outlined"
              hide-details
              :loading="searchLoading"
              style="max-width: 300px;"
              @update:search="debouncedSearch"
            >
              <template #prepend-inner>
                <span v-if="selectedEmployees.length" class="text-primary text-caption">
                  ({{ selectedEmployees.length }})
                </span>
              </template>
              <template #chip="{ item, index }">
                <v-chip
                  v-if="index === 0"
                  size="small"
                  closable
                  @click:close="selectedEmployees.splice(index, 1)"
                >
                  {{ item.title }}
                </v-chip>
                <span v-else-if="index === 1" class="text-caption ml-1">
                  +{{ selectedEmployees.length - 1 }}
                </span>
              </template>
            </v-autocomplete>

            <!-- Filter Icon Button -->
            <v-tooltip text="Filters" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  :color="hasActiveFilters ? 'primary' : 'default'"
                  variant="text"
                  @click="showFilters = !showFilters"
                >
                  <v-badge
                    :model-value="hasActiveFilters"
                    color="primary"
                    dot
                  >
                    <v-icon>mdi-filter-variant</v-icon>
                  </v-badge>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Remove Filters Button -->
            <v-tooltip v-if="hasActiveFilters" text="Remove Filters" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  color="error"
                  variant="text"
                  @click="handleResetFilters"
                >
                  <v-icon>mdi-filter-off</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>

          <!-- Collapsible Filters -->
          <v-expand-transition>
            <div v-if="showFilters" class="mb-4 pa-4 border rounded">
              <attendance-config-filter
                :filters="filters"
                @search="handleFilterSearch"
                @reset="handleResetFilters"
              />
            </div>
          </v-expand-transition>

        <!-- Data Table - Matching legacy MaterialReactTable styling -->
        <v-data-table-server
          v-model:items-per-page="pagination.itemsPerPage"
          v-model:page="pagination.page"
          :headers="headers"
          :items="employees"
          :items-length="totalRecords"
          :loading="loading"
          class="attendance-config-table"
          item-value="employeeId"
          :items-per-page-options="[
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' }
          ]"
        >
          <!-- S.No Column -->
          <template #item.sNo="{ index }">
            {{ (pagination.page - 1) * pagination.itemsPerPage + index + 1 }}
          </template>

          <!-- Attendance Method Column -->
          <template #item.attendanceMethod="{ item }">
            <v-tooltip
              :text="getAttendanceMethodTooltip(item)"
              location="top"
            >
              <template #activator="{ props }">
                <span
                  v-bind="props"
                  :class="{ 'text-error': !item.isManualAttendance && !item.timeDoctorUserId }"
                >
                  {{ item.isManualAttendance ? 'Manual' : 'Time Doctor' }}
                </span>
              </template>
            </v-tooltip>
          </template>

          <!-- Branch Column -->
          <template #item.branch="{ item }">
            {{ getBranchLabel(item.branch) }}
          </template>

          <!-- DOJ Column -->
          <template #item.joiningDate="{ item }">
            {{ formatDate(item.joiningDate) }}
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-center" style="gap: 4px;">
              <!-- Toggle Switch -->
              <v-tooltip
                :text="getToggleTooltip(item)"
                location="top"
                :disabled="!(item.isManualAttendance && !item.timeDoctorUserId)"
              >
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-switch
                      :model-value="item.isManualAttendance"
                      :color="item.isManualAttendance ? 'info' : 'default'"
                      :loading="item.employeeId === toggleLoading"
                      :disabled="item.isManualAttendance && !item.timeDoctorUserId"
                      @update:model-value="handleToggle(item.employeeId)"
                      hide-details
                      inset
                      density="compact"
                      class="flex-shrink-0"
                      style="max-width: 50px;"
                    />
                  </span>
                </template>
              </v-tooltip>

              <!-- Edit Button -->
              <v-tooltip text="Edit Employee" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil"
                    size="x-small"
                    variant="text"
                    color="primary"
                    @click="navigateToEdit(item.employeeId)"
                    class="flex-shrink-0"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
    </v-container>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AttendanceConfigFilter from '@/components/attendance/AttendanceConfigFilter.vue'
import { attendanceApi } from '@/services/attendanceApi'
import moment from 'moment'

// Types
interface Employee {
  employeeId: number
  employeeCode: string
  employeeName: string
  department: string
  designation: string
  branch: string
  joiningDate: string
  country: string
  isManualAttendance: boolean
  timeDoctorUserId: string | null
}

interface ConfigFilters {
  employeeCode?: string
  employeeName?: string
  departmentId?: number | null
  designationId?: number | null
  branchId?: number | null
  countryId?: number | null
  dojFrom?: string | null
  dojTo?: string | null
  isManualAttendance?: boolean | null
}

// Router
const router = useRouter()

// State
const loading = ref(false)
const toggleLoading = ref<number | null>(null)
const employees = ref<Employee[]>([])
const totalRecords = ref(0)
const showFilters = ref(false)

// Employee Search
const selectedEmployees = ref<string[]>([])
const employeeSearch = ref('')
const employeeOptions = ref<string[]>([])
const searchLoading = ref(false)
const searchCache = new Map<string, string[]>()

const pagination = reactive({
  page: 1,
  itemsPerPage: 10
})

const filters = reactive<ConfigFilters>({})

const appliedFilters = reactive<ConfigFilters>({})

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// Computed
const breadcrumbItems = computed(() => [
  { title: 'Dashboard', to: '/dashboard', disabled: false },
  { title: 'Attendance', disabled: true },
  { title: 'Configuration', disabled: true }
])

const hasActiveFilters = computed(() => {
  return Object.values(appliedFilters).some(v => v !== null && v !== undefined && v !== '')
})

const activeFilterCount = computed(() => {
  return Object.values(appliedFilters).filter(v => v !== null && v !== undefined && v !== '').length
})

const headers = [
  { title: 'S.No', key: 'sNo', sortable: false, width: 80, align: 'start' },
  { title: 'Employee Code', key: 'employeeCode', sortable: true, width: 140 },
  { title: 'Employee Name', key: 'employeeName', sortable: true, width: 200 },
  { title: 'Attendance Method', key: 'attendanceMethod', sortable: false, width: 180 },
  { title: 'Department', key: 'department', sortable: true, width: 150 },
  { title: 'Designation', key: 'designation', sortable: true, width: 150 },
  { title: 'Branch', key: 'branch', sortable: true, width: 150 },
  { title: 'DOJ', key: 'joiningDate', sortable: true, width: 150 },
  { title: 'Country', key: 'country', sortable: true, width: 120 },
  { title: 'Actions', key: 'actions', sortable: false, width: 180, align: 'center' }
]

// Branch mapping
const BRANCH_LOCATION: Record<string, string> = {
  'Mumbai': 'Mumbai',
  'Bangalore': 'Bangalore',
  'Delhi': 'Delhi',
  'Hyderabad': 'Hyderabad',
  'Pune': 'Pune'
}

// Methods
const getBranchLabel = (branch: string): string => {
  return BRANCH_LOCATION[branch] || branch
}

const formatDate = (date: string): string => {
  if (!date) return ''
  return moment(date).format('MMM DD, YYYY')
}

const getAttendanceMethodTooltip = (item: Employee): string => {
  if (!item.isManualAttendance && !item.timeDoctorUserId) {
    return 'Time Doctor user ID not found'
  }
  return ''
}

const getToggleTooltip = (item: Employee): string => {
  if (item.isManualAttendance && !item.timeDoctorUserId) {
    return 'Time Doctor user ID is required to update the attendance method'
  }
  return 'Toggle attendance method'
}

// Debounced search function
const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return (value: string) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (value && value.length >= 3) {
        searchEmployees(value)
      }
    }, 600)
  }
})()

const searchEmployees = async (searchTerm: string) => {
  if (searchCache.has(searchTerm)) {
    employeeOptions.value = searchCache.get(searchTerm)!
    return
  }

  searchLoading.value = true
  try {
    const response = await attendanceApi.getAttendanceConfigList({
      sortColumnName: '',
      sortDirection: 'asc',
      startIndex: 0,
      pageSize: 50,
      filters: {
        employeeName: searchTerm
      }
    })

    if (response.success && response.data) {
      const options = response.data.attendanceConfigList.map(
        emp => `${emp.employeeCode} - ${emp.employeeName}`
      )
      employeeOptions.value = options
      searchCache.set(searchTerm, options)
    }
  } catch (error) {
    console.error('Failed to search employees:', error)
  } finally {
    searchLoading.value = false
  }
}

const fetchEmployees = async () => {
  loading.value = true
  
  try {
    const employeeCodes = selectedEmployees.value
      .map(emp => emp.split(' - ')[0])
      .join(',')

    // Build filters object
    const filters: any = {}
    
    if (employeeCodes) {
      filters.employeeCode = employeeCodes
    }
    if (appliedFilters.employeeName) {
      filters.employeeName = appliedFilters.employeeName
    }
    if (appliedFilters.departmentId) {
      filters.departmentId = appliedFilters.departmentId
    }
    if (appliedFilters.designationId) {
      filters.designationId = appliedFilters.designationId
    }
    if (appliedFilters.branchId) {
      filters.branchId = appliedFilters.branchId
    }
    if (appliedFilters.countryId) {
      filters.countryId = appliedFilters.countryId
    }
    if (appliedFilters.dojFrom) {
      filters.dojFrom = appliedFilters.dojFrom
    }
    if (appliedFilters.dojTo) {
      filters.dojTo = appliedFilters.dojTo
    }
    if (appliedFilters.isManualAttendance !== null && appliedFilters.isManualAttendance !== undefined) {
      filters.isManualAttendance = appliedFilters.isManualAttendance
    }

    // Build request matching legacy structure
    const params = {
      sortColumnName: '',
      sortDirection: 'asc',
      startIndex: (pagination.page - 1) * pagination.itemsPerPage,
      pageSize: pagination.itemsPerPage || 10,
      filters: filters
    }

    const response = await attendanceApi.getAttendanceConfigList(params)
    
    if (response.success && response.data) {
      employees.value = response.data.attendanceConfigList || []
      totalRecords.value = response.data.totalRecords || 0
    }
  } catch (error: any) {
    console.error('Failed to fetch attendance configuration:', error)
    showSnackbar('Failed to fetch attendance configuration', 'error')
    employees.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

const handleToggle = async (employeeId: number) => {
  toggleLoading.value = employeeId
  
  try {
    const response = await attendanceApi.updateConfig(employeeId)
    
    if (response.success) {
      const employee = employees.value.find(e => e.employeeId === employeeId)
      if (employee) {
        employee.isManualAttendance = !employee.isManualAttendance
      }
      showSnackbar('Attendance configuration updated successfully', 'success')
    }
  } catch (error: any) {
    console.error('Failed to update attendance configuration:', error)
    const message = error.response?.data?.message || 'Failed to update attendance configuration'
    showSnackbar(message, 'error')
  } finally {
    toggleLoading.value = null
  }
}

const handleFilterSearch = (newFilters: ConfigFilters) => {
  Object.assign(appliedFilters, newFilters)
  pagination.page = 1
  fetchEmployees()
}

const handleResetFilters = () => {
  selectedEmployees.value = []
  Object.keys(filters).forEach(key => {
    delete filters[key as keyof ConfigFilters]
  })
  Object.keys(appliedFilters).forEach(key => {
    delete appliedFilters[key as keyof ConfigFilters]
  })
  pagination.page = 1
  fetchEmployees()
}

const navigateToEdit = (employeeId: number) => {
  router.push({
    name: 'EmployeeEdit',
    params: { id: employeeId },
    query: { fromAttendanceConfig: 'true' }
  })
}

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

// Watchers
watch(() => pagination.page, fetchEmployees)
watch(() => pagination.itemsPerPage, () => {
  pagination.page = 1
  fetchEmployees()
})
watch(selectedEmployees, () => {
  pagination.page = 1
  fetchEmployees()
})

// Lifecycle
onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

/* Matching legacy MaterialReactTable styling */
.attendance-config-table :deep(.v-data-table__th) {
  background-color: #1E75BB !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: inherit !important;
}

.attendance-config-table :deep(.v-data-table__th .v-icon) {
  color: white !important;
}

.attendance-config-table :deep(.v-data-table-header__content) {
  color: white !important;
}

.attendance-config-table :deep(.v-data-table__td) {
  padding: 12px 16px !important;
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.rounded {
  border-radius: 4px;
}
</style>
