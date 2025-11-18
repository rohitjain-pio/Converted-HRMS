<template>
  <app-layout>
    <v-container fluid>
      <v-breadcrumbs :items="breadcrumbItems" class="px-0 pb-4" />
      
      <v-card elevation="3">
        <v-card-title class="pa-4" style="border-bottom: none;">
          <span class="text-h5">Employee Report</span>
        </v-card-title>
      
        <v-card-text class="pa-4">
          <!-- Top Toolbar - Matching legacy exactly -->
          <div class="d-flex align-center mb-4" style="gap: 4px;">
            <!-- Export Button (left side) -->
            <v-tooltip text="Export" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="text"
                  :loading="exporting"
                  :disabled="loading || reportData.length === 0"
                  @click="handleExport"
                >
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

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
              <attendance-report-filter
                :filters="filters"
                @search="handleFilterSearch"
                @reset="handleResetFilters"
              />
            </div>
          </v-expand-transition>

          <!-- Summary Cards -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card color="primary" variant="tonal">
              <v-card-text class="py-3">
                <div class="text-caption text-medium-emphasis">Total Employees</div>
                <div class="text-h5 font-weight-bold">{{ totalRecords }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card color="success" variant="tonal">
              <v-card-text class="py-3">
                <div class="text-caption text-medium-emphasis">Date Range</div>
                <div class="text-body-1 font-weight-medium">
                  {{ formatDateRange }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card color="info" variant="tonal">
              <v-card-text class="py-3">
                <div class="text-caption text-medium-emphasis">Total Days</div>
                <div class="text-h5 font-weight-bold">{{ dateColumns.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card color="warning" variant="tonal">
              <v-card-text class="py-3">
                <div class="text-caption text-medium-emphasis">Avg Hours/Day</div>
                <div class="text-h5 font-weight-bold">{{ averageHoursPerDay }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Data Table with MaterialReactTable styling -->
        <v-data-table-server
          v-model:items-per-page="pagination.itemsPerPage"
          v-model:page="pagination.page"
          :headers="dynamicHeaders"
          :items="reportData"
          :items-length="totalRecords"
          :loading="loading"
          class="attendance-report-table"
          item-value="employeeCode"
          fixed-header
          height="600"
          :items-per-page-options="[
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' }
          ]"
        >
          <!-- Serial Number -->
          <template #item.sNo="{ index }">
            {{ (pagination.page - 1) * pagination.itemsPerPage + index + 1 }}
          </template>
          
          <!-- Total Hours with Chip -->
          <template #item.totalHours="{ item }">
            <v-chip 
              :color="getTotalHoursColor(item.totalHours)" 
              size="small"
              class="font-weight-bold"
            >
              {{ formatHours(item.totalHours) }}
            </v-chip>
          </template>

          <!-- Branch -->
          <template #item.branch="{ item }">
            {{ getBranchLabel(item.branch) }}
          </template>
          
          <!-- Dynamic date columns with progress bars -->
          <template
            v-for="date in dateColumns"
            :key="date"
            #[`item.${date}`]="{ item }"
          >
            <div class="date-cell">
              <div :class="getHoursClass(item.timeEntries?.[date])">
                {{ formatDailyHours(item.timeEntries?.[date]) }}
              </div>
              <v-progress-linear
                :model-value="getProgressValue(item.timeEntries?.[date])"
                :color="getProgressColor(item.timeEntries?.[date])"
                height="4"
                class="mt-1"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

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
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AttendanceReportFilter from '@/components/attendance/AttendanceReportFilter.vue'
import { attendanceApi } from '@/services/attendanceApi'
import moment from 'moment'

// Types
interface EmployeeReport {
  employeeCode: string
  employeeName: string
  department: string
  branch: string
  totalHours: string
  timeEntries: { [date: string]: number }
}

interface ReportFilters {
  employeeCode?: string
  employeeName?: string
  departmentId?: number | null
  branchId?: number | null
  dateFrom?: string | null
  dateTo?: string | null
  isManualAttendance?: boolean | null
}

// State
const loading = ref(false)
const exporting = ref(false)
const reportData = ref<EmployeeReport[]>([])
const totalRecords = ref(0)
const showFilters = ref(false)
const searchEmployee = ref('')

// Employee search state
const selectedEmployees = ref<string[]>([])
const employeeSearch = ref('')
const employeeOptions = ref<Array<{ title: string; value: string }>>([])
const searchLoading = ref(false)
const employeeSearchCache = new Map<string, Array<{ title: string; value: string }>>()

const pagination = reactive({
  page: 1,
  itemsPerPage: 10
})

// Initialize with last 7 days
const today = moment().format('YYYY-MM-DD')
const lastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD')

const filters = reactive<ReportFilters>({
  dateFrom: lastWeek,
  dateTo: today
})

const appliedFilters = reactive<ReportFilters>({
  dateFrom: lastWeek,
  dateTo: today
})

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// Branch mapping
const BRANCH_LOCATION: Record<string, string> = {
  'Mumbai': 'Mumbai',
  'Bangalore': 'Bangalore',
  'Delhi': 'Delhi',
  'Hyderabad': 'Hyderabad',
  'Pune': 'Pune'
}

// Computed
const breadcrumbItems = computed(() => [
  { title: 'Dashboard', to: '/dashboard', disabled: false },
  { title: 'Attendance', disabled: true },
  { title: 'Employee Report', disabled: true }
])

const hasActiveFilters = computed(() => {
  return Object.entries(appliedFilters).some(([key, value]) => {
    if (key === 'dateFrom' || key === 'dateTo') return false
    return value !== null && value !== undefined && value !== ''
  })
})

const formatDateRange = computed(() => {
  if (!appliedFilters.dateFrom || !appliedFilters.dateTo) return 'N/A'
  return `${moment(appliedFilters.dateFrom).format('MMM DD')} - ${moment(appliedFilters.dateTo).format('MMM DD, YYYY')}`
})

// Generate date columns based on date range
const dateColumns = computed(() => {
  if (!appliedFilters.dateFrom || !appliedFilters.dateTo) return []
  
  const startDate = moment(appliedFilters.dateFrom)
  const endDate = moment(appliedFilters.dateTo)
  const dates: string[] = []
  
  let currentDate = startDate.clone()
  while (currentDate.isSameOrBefore(endDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'))
    currentDate.add(1, 'day')
  }
  
  return dates
})

// Dynamic headers including date columns with fixed base columns (column pinning)
const dynamicHeaders = computed(() => {
  const baseHeaders = [
    { title: 'S.No', key: 'sNo', sortable: false, width: 70, fixed: true },
    { title: 'Employee Code', key: 'employeeCode', sortable: true, width: 140, fixed: true },
    { title: 'Employee Name', key: 'employeeName', sortable: true, width: 200, fixed: true },
    { title: 'Department', key: 'department', sortable: true, width: 150, fixed: true },
    { title: 'Branch', key: 'branch', sortable: true, width: 120, fixed: true },
    { title: 'Total Hours', key: 'totalHours', sortable: true, width: 120, fixed: true }
  ]
  
  const dateHeaders = dateColumns.value.map(date => ({
    title: moment(date).format('ddd MMM D'),
    key: date,
    sortable: false,
    width: 130,
    align: 'center' as const
  }))
  
  return [...baseHeaders, ...dateHeaders]
})

const averageHoursPerDay = computed(() => {
  if (reportData.value.length === 0 || dateColumns.value.length === 0) return '0h'
  
  let totalHours = 0
  let totalDays = 0
  
  reportData.value.forEach(emp => {
    Object.values(emp.timeEntries || {}).forEach(hours => {
      if (hours > 0) {
        totalHours += hours
        totalDays++
      }
    })
  })
  
  if (totalDays === 0) return '0h'
  
  const avgHours = totalHours / totalDays
  const hours = Math.floor(avgHours)
  const minutes = Math.round((avgHours - hours) * 60)
  
  return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`
})

// Methods
// Debounced search for employee autocomplete
let searchDebounceTimer: NodeJS.Timeout | null = null
const debouncedSearch = (value: string) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  
  searchDebounceTimer = setTimeout(() => {
    if (value && value.length >= 2) {
      searchEmployees(value)
    }
  }, 600)
}

// Search employees for autocomplete
const searchEmployees = async (searchTerm: string) => {
  if (!searchTerm || searchTerm.length < 2) {
    employeeOptions.value = []
    return
  }

  // Check cache first
  if (employeeSearchCache.has(searchTerm)) {
    employeeOptions.value = employeeSearchCache.get(searchTerm) || []
    return
  }

  searchLoading.value = true
  try {
    const response = await attendanceApi.getAttendanceConfigList({
      startIndex: 0,
      pageSize: 20,
      filters: {
        employeeName: searchTerm
      }
    })
    
    const options = response.data.attendanceConfigList.map((emp: any) => ({
      title: `${emp.employeeName} (${emp.employeeCode})`,
      value: emp.employeeCode
    }))
    
    employeeOptions.value = options
    employeeSearchCache.set(searchTerm, options)
  } catch (error) {
    console.error('Error searching employees:', error)
    employeeOptions.value = []
  } finally {
    searchLoading.value = false
  }
}

const getBranchLabel = (branch: string): string => {
  return BRANCH_LOCATION[branch] || branch
}

const formatHours = (hoursStr: string): string => {
  if (!hoursStr) return '0h 0m'
  const [h, m] = hoursStr.split(':').map(Number)
  return `${h}h${m > 0 ? ' ' + m + 'm' : ''}`
}

const formatDailyHours = (decimalHours: number | undefined): string => {
  if (decimalHours === undefined || isNaN(decimalHours) || decimalHours === 0) {
    return '-'
  }
  
  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)
  return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`
}

const getTotalHoursColor = (hoursStr: string): string => {
  if (!hoursStr) return 'grey'
  const [h] = hoursStr.split(':').map(Number)
  const totalDays = dateColumns.value.length || 1
  const avgPerDay = h / totalDays
  
  if (avgPerDay >= 8) return 'success'
  if (avgPerDay >= 6) return 'warning'
  return 'error'
}

const getHoursClass = (decimalHours: number | undefined): string => {
  if (!decimalHours || decimalHours === 0) return 'text-grey'
  if (decimalHours >= 8) return 'text-success font-weight-bold'
  if (decimalHours >= 6) return 'text-warning font-weight-medium'
  return 'text-error'
}

const getProgressValue = (decimalHours: number | undefined): number => {
  if (!decimalHours) return 0
  return Math.min((decimalHours / 10) * 100, 100)
}

const getProgressColor = (decimalHours: number | undefined): string => {
  if (!decimalHours || decimalHours === 0) return 'grey'
  if (decimalHours >= 8) return 'success'
  if (decimalHours >= 6) return 'warning'
  return 'error'
}

const fetchReport = async () => {
  loading.value = true
  
  try {
    const params = {
      pageIndex: pagination.page - 1,
      pageSize: pagination.itemsPerPage,
      ...appliedFilters,
      // Add selected employee codes if any
      ...(selectedEmployees.value.length > 0 && { 
        employeeCode: selectedEmployees.value.join(',') 
      })
    }

    const response = await attendanceApi.getEmployeeReport(params)
    
    if (response.success && response.data) {
      const currentDatesInHeader = new Set(dateColumns.value)
      
      // Transform the data
      const mappedRows = (response.data.employeeReports || []).map((emp: any) => {
        const timeEntriesForEmployee: { [key: string]: number } = {}
        
        currentDatesInHeader.forEach(date => {
          timeEntriesForEmployee[date] = 0
        })
        
        Object.entries(emp.workedHoursByDate || {}).forEach(([date, hhmm]) => {
          if (hhmm && typeof hhmm === 'string' && hhmm.trim() !== '') {
            const [h, m] = hhmm.split(':').map(Number)
            timeEntriesForEmployee[date] = h + (m ? m / 60 : 0)
          }
        })
        
        return {
          employeeCode: emp.employeeCode,
          employeeName: emp.employeeName,
          department: emp.department,
          branch: emp.branch,
          totalHours: emp.totalHour || '0:00',
          timeEntries: timeEntriesForEmployee
        }
      })
      
      reportData.value = mappedRows
      totalRecords.value = response.data.totalRecords || 0
    }
  } catch (error: any) {
    console.error('Failed to fetch attendance report:', error)
    showSnackbar('Failed to fetch attendance report', 'error')
    reportData.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  exporting.value = true
  
  try {
    const blob = await attendanceApi.exportEmployeeReportExcel({
      ...appliedFilters,
      pageIndex: 0,
      pageSize: 10000 // Export all records
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `attendance_report_${moment().format('YYYYMMDD_HHmmss')}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    showSnackbar('Report exported successfully', 'success')
  } catch (error: any) {
    console.error('Failed to export report:', error)
    showSnackbar('Failed to export report', 'error')
  } finally {
    exporting.value = false
  }
}

const handleFilterSearch = (newFilters: ReportFilters) => {
  Object.assign(appliedFilters, newFilters)
  pagination.page = 1
  fetchReport()
}

const handleResetFilters = () => {
  searchEmployee.value = ''
  selectedEmployees.value = []
  Object.keys(filters).forEach(key => {
    delete filters[key as keyof ReportFilters]
  })
  filters.dateFrom = lastWeek
  filters.dateTo = today
  
  Object.keys(appliedFilters).forEach(key => {
    delete appliedFilters[key as keyof ReportFilters]
  })
  appliedFilters.dateFrom = lastWeek
  appliedFilters.dateTo = today
  
  pagination.page = 1
  fetchReport()
}

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

// Watchers
watch(() => pagination.page, fetchReport)
watch(() => pagination.itemsPerPage, () => {
  pagination.page = 1
  fetchReport()
})
watch(() => selectedEmployees.value, () => {
  pagination.page = 1
  fetchReport()
}, { deep: true })

// Lifecycle
onMounted(() => {
  fetchReport()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.date-cell {
  min-width: 100px;
  padding: 4px;
}

/* MaterialReactTable exact styling match */
.attendance-report-table :deep(.v-data-table__th) {
  background-color: #1E75BB !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  text-transform: none !important;
  letter-spacing: 0.17px !important;
  padding: 16px 12px !important;
  border: none !important;
}

.attendance-report-table :deep(.v-data-table__td) {
  padding: 12px !important;
  font-size: 14px !important;
  border-bottom: 1px solid rgba(224, 224, 224, 1) !important;
}

.attendance-report-table :deep(tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.attendance-report-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(224, 224, 224, 1);
  padding: 8px 16px;
}

/* Match legacy toolbar styling */
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 500 !important;
  line-height: 1.6 !important;
  letter-spacing: 0.0075em !important;
}

/* Filter panel styling */
.border {
  border: 1px solid rgba(224, 224, 224, 1);
}

.rounded {
  border-radius: 4px;
}
</style>
