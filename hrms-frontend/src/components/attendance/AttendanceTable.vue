<template>
  <div class="attendance-table-container">
    <!-- Toolbar matching legacy structure exactly: Buttons LEFT, Filters RIGHT -->
    <div class="d-flex align-center justify-space-between pa-4" style="gap: 8px;">
      <!-- Left side: Time In/Out buttons -->
      <div class="d-flex" style="gap: 8px;">
        <v-btn
          v-if="isManualAttendance && showTimeInButton"
          color="primary"
          variant="elevated"
          :loading="loading"
          @click="$emit('time-in')"
        >
          Time In
        </v-btn>
        <v-btn
          v-else-if="isManualAttendance && !showTimeInButton"
          color="grey-darken-1"
          variant="elevated"
          :loading="loading"
          @click="$emit('time-out')"
        >
          Time Out
        </v-btn>
      </div>
      
      <!-- Right side: Filter icons -->
      <div class="d-flex align-center" style="gap: 4px;">
        <v-tooltip text="Filters" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :color="hasActiveFilters ? 'primary' : 'default'"
              icon
              variant="text"
              size="small"
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
        
        <v-tooltip v-if="hasActiveFilters" text="Remove Filters" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="error"
              icon
              variant="text"
              size="small"
              @click="handleFilterReset"
            >
              <v-icon>mdi-filter-off</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Collapsible Filter Panel matching legacy -->
    <v-expand-transition>
      <div v-if="showFilters" class="px-4 pb-4" style="margin-right: -2.75rem;">
        <div class="pa-4 border rounded">
          <AttendanceFilter
            ref="filterFormRef"
            @search="handleFilterSearch"
          />
        </div>
      </div>
    </v-expand-transition>

    <!-- Data Table matching MaterialReactTable styling -->
    <v-data-table-server
      :headers="tableHeaders"
      :items="records"
      :items-length="totalRecords"
      v-model:page="localPagination.page"
      v-model:items-per-page="localPagination.itemsPerPage"
      :loading="loading"
      class="attendance-data-table"
      density="comfortable"
      hover
      :items-per-page-options="[
        { value: 10, title: '10' },
        { value: 25, title: '25' },
        { value: 50, title: '50' }
      ]"
    >
      <!-- Row number (S.No) -->
      <template #item.sno="{ index }">
        <span>{{ (localPagination.page - 1) * localPagination.itemsPerPage + index + 1 }}</span>
      </template>

      <!-- Date column -->
      <template #item.date="{ item }">
        <span>{{ formatDate(item.date) }}</span>
      </template>

      <!-- Start time column -->
      <template #item.startTime="{ item }">
        <span>{{ item.startTime || '' }}</span>
      </template>

      <!-- End time column -->
      <template #item.endTime="{ item }">
        <span>{{ item.endTime || '' }}</span>
      </template>

      <!-- Day column -->
      <template #item.day="{ item }">
        <span>{{ item.day || '' }}</span>
      </template>

      <!-- Attendance Type column -->
      <template #item.attendanceType="{ item }">
        <span>{{ item.attendanceType || 'Manual' }}</span>
      </template>

      <!-- Total hours column - format like legacy (remove leading zero) -->
      <template #item.totalHours="{ item }">
        <span v-if="item.totalHours && item.totalHours !== ''">
          {{ formatTotalHours(item.totalHours) }}
        </span>
        <span v-else></span>
      </template>

      <!-- Actions column -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center" style="gap: 4px;">
          <!-- Audit Trail Tooltip - Match legacy exactly -->
          <v-tooltip location="top" max-width="400">
            <template #activator="{ props }">
              <v-btn
                icon
                size="medium"
                variant="text"
                v-bind="props"
                style="color: rgb(30, 117, 187);"
              >
                <v-icon size="medium">mdi-eye</v-icon>
              </v-btn>
            </template>
            <div style="min-width: 140px; padding: 8px;">
              <div class="text-body-2 font-weight-bold mb-2">Audit Trail:</div>
              <div style="max-height: 140px; overflow-y: auto; scrollbar-width: thin; overflow-x: auto;">
                <template v-if="item.audit && Array.isArray(item.audit)">
                  <div v-for="(auditItem, idx) in item.audit" :key="idx" style="margin-bottom: 8px;">
                    <div>
                      <strong>{{ auditItem.action }}</strong> at - {{ auditItem.time ? auditItem.time.slice(0, 5) : 'N/A' }}
                    </div>
                    <div v-if="auditItem.comment" style="margin-top: 4px;">
                      <span>Note:</span>
                      <span style="color: gray;"> — {{ auditItem.comment }}</span>
                    </div>
                    <div v-if="auditItem.reason" style="margin-top: 4px;">
                      <span>Reason For Past entry:</span>
                      <span style="color: gray;"> — {{ auditItem.reason }}</span>
                    </div>
                  </div>
                </template>
                <div v-else class="text-caption text-grey">
                  No audit trail available
                </div>
              </div>
            </div>
          </v-tooltip>

          <!-- Edit button (only for past dates and manual attendance) -->
          <v-btn
            v-if="isManualAttendance && !isToday(item.date)"
            icon
            size="medium"
            variant="text"
            style="color: rgb(30, 117, 187);"
            @click="$emit('edit', item)"
          >
            <v-icon size="medium">mdi-pencil</v-icon>
          </v-btn>
        </div>
      </template>

      <!-- Empty state -->
      <template #no-data>
        <div class="text-center py-8">
          <div class="text-body-1 text-grey">
            No Data Found
          </div>
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { format, isToday as checkIsToday } from 'date-fns'
import AttendanceFilter from './AttendanceFilter.vue'

// Props
interface Props {
  records: any[]
  totalRecords: number
  loading: boolean
  isManualAttendance: boolean
  showTimeInButton: boolean
  pagination: {
    page: number
    itemsPerPage: number
    sortBy: any[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  records: () => [],
  totalRecords: 0,
  loading: false,
  isManualAttendance: true,
  showTimeInButton: false
})

// Emits
const emit = defineEmits<{
  'update:pagination': [value: any]
  'filter': [value: any]
  'edit': [item: any]
  'time-out': [item?: any]
  'time-in': []
}>()

// Refs
const showFilters = ref(false)
const hasActiveFilters = ref(false)
const filterFormRef = ref<any>(null)

// Local pagination state
const localPagination = reactive({
  page: props.pagination.page,
  itemsPerPage: props.pagination.itemsPerPage
})

// Watch for pagination changes and emit to parent
watch(() => localPagination, (newVal) => {
  emit('update:pagination', {
    page: newVal.page,
    itemsPerPage: newVal.itemsPerPage,
    sortBy: props.pagination.sortBy
  })
}, { deep: true })

// Watch for external pagination changes
watch(() => props.pagination, (newVal) => {
  localPagination.page = newVal.page
  localPagination.itemsPerPage = newVal.itemsPerPage
}, { deep: true })

// Computed - Matching legacy MaterialReactTable column structure
const tableHeaders = computed(() => [
  {
    title: 'S.No',
    align: 'start' as const,
    sortable: false,
    key: 'sno',
    width: '60px'
  },
  {
    title: 'Date',
    align: 'start' as const,
    sortable: false,
    key: 'date',
    width: '120px'
  },
  {
    title: 'Start Time',
    align: 'start' as const,
    sortable: false,
    key: 'startTime',
    width: '90px'
  },
  {
    title: 'End Time',
    align: 'start' as const,
    sortable: false,
    key: 'endTime',
    width: '90px'
  },
  {
    title: 'Day',
    align: 'start' as const,
    sortable: false,
    key: 'day',
    width: '100px'
  },
  {
    title: 'Attendance Type',
    align: 'start' as const,
    sortable: false,
    key: 'attendanceType',
    width: '120px'
  },
  {
    title: 'Total Hours',
    align: 'start' as const,
    sortable: false,
    key: 'totalHours',
    width: '100px'
  },
  {
    title: 'Actions',
    align: 'start' as const,
    sortable: false,
    key: 'actions',
    width: '100px'
  }
])

// Methods
const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch {
    return date
  }
}

const isToday = (date: string) => {
  try {
    return checkIsToday(new Date(date))
  } catch {
    return false
  }
}

const formatTotalHours = (hours: string) => {
  // Format like legacy: remove leading zero from hours
  // "08:30" becomes "8:30"
  if (hours && hours !== '') {
    const [h, m] = hours.split(':')
    return `${parseInt(h, 10)}:${m}`
  }
  return ''
}

const handleFilterSearch = (filters: any) => {
  hasActiveFilters.value = filters.startDate !== '' || filters.endDate !== ''
  emit('filter', filters)
}

const handleFilterReset = () => {
  if (filterFormRef.value) {
    filterFormRef.value.handleReset()
  }
  hasActiveFilters.value = false
}
</script>

<style scoped lang="scss">
.attendance-table-container {
  width: 100%;
}

/* Matching legacy MaterialReactTable styling */
:deep(.attendance-data-table) {
  /* Header styling matching MRT with blue background */
  .v-data-table-header {
    background-color: #1E75BB;
    
    th {
      color: #ffffff !important;
      font-weight: 500;
      font-size: 0.875rem;
      text-transform: inherit;
      letter-spacing: 0.01071em;
      background-color: #1E75BB !important;
    }
    
    .v-icon {
      color: #ffffff !important;
    }
  }

  /* Table cell styling */
  .v-data-table__td {
    border-bottom: 1px solid rgba(224, 224, 224, 1) !important;
    padding: 12px 10px !important;
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.87);
    height: 52px;
    min-height: 52px;
    white-space: nowrap;
  }

  /* Row hover effect */
  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }
  
  /* Pagination styling */
  .v-data-table-footer {
    padding: 8px 16px;
    
    .v-btn {
      text-transform: none;
    }
  }
}

/* Buttons styling to match MUI */
:deep(.v-btn) {
  text-transform: uppercase;
  letter-spacing: 0.02857em;
  font-weight: 500;
}

/* Icon button sizing */
:deep(.v-btn--icon) {
  width: 40px;
  height: 40px;
}

/* Audit trail tooltip styling */
.audit-trail-tooltip {
  min-width: 140px;
  line-height: 1.4;
}

.audit-entries {
  max-height: 140px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.audit-entry {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* Filter panel border styling */
.border {
  border: 1px solid rgba(224, 224, 224, 1);
}

.rounded {
  border-radius: 4px;
}
</style>
