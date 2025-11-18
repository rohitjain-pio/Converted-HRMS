<template>
  <app-layout>
    <v-container fluid class="pa-0">
      <!-- Breadcrumbs matching legacy BreadCrumbs component -->
      <v-breadcrumbs 
        :items="breadcrumbItems" 
        class="px-4 py-2"
      >
        <template #divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
        <template #item="{ item }">
          <v-breadcrumbs-item
            :to="item.to"
            :disabled="item.disabled"
            :class="item.disabled ? 'text-grey-darken-2' : 'text-primary'"
            style="text-decoration: none;"
          >
            {{ item.title }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>
      
      <!-- Paper/Card elevation matching legacy -->
      <v-sheet elevation="3" class="mx-4 mb-4">
        <!-- Page Header matching legacy PageHeader component exactly -->
        <div class="page-header px-4 py-3">
          <h2 class="text-h5" style="color: #273A50; font-weight: 500;">
            My Attendance
          </h2>
        </div>
        
        <!-- Attendance Table directly without wrapper - matching legacy -->
        <AttendanceTable
          v-model:pagination="pagination"
          :records="attendanceRecords"
          :total-records="totalRecords"
          :loading="loading"
          :is-manual-attendance="isManualAttendance"
          :show-time-in-button="showTimeInButton"
          @edit="handleEdit"
          @time-out="handleTimeOut"
          @time-in="handleTimeIn"
          @filter="handleFilter"
        />
      </v-sheet>

      <!-- Time In Dialog -->
      <TimeInDialog
        v-model="timeInDialog.open"
        :edit-data="timeInDialog.editData"
        :loading="timeInDialog.loading"
        :filled-dates="filledDates"
        @submit="handleTimeInSubmit"
      />
      
      <!-- Time Out Dialog -->
      <TimeOutDialog
        v-model="timeOutDialog.open"
        :current-time="currentTime"
        :loading="timeOutDialog.loading"
        @confirm="handleTimeOutSubmit"
      />
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AttendanceTable from '@/components/attendance/AttendanceTable.vue'
import TimeInDialog from '@/components/attendance/TimeInDialog.vue'
import TimeOutDialog from '@/components/attendance/TimeOutDialog.vue'
import { attendanceApi } from '@/services/attendanceApi'
import { useAuthStore } from '@/stores/auth'

// Stores
const authStore = useAuthStore()

// Reactive data - Vuetify uses 1-based indexing for pages
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: []
})

const loading = ref(false)
const filterStartDate = ref('')
const filterEndDate = ref('')
const attendanceRecords = ref<any[]>([])
const totalRecords = ref(0)
const isManualAttendance = ref(true)
const showTimeInButton = ref(true)
const filledDates = ref<string[]>([])

// Dialog state
const timeInDialog = reactive({
  open: false,
  editData: null as any,
  loading: false
})

const timeOutDialog = reactive({
  open: false,
  loading: false
})

const currentTime = ref(new Date().toLocaleTimeString('en-US', { hour12: false }))

// Get current employee ID from auth store
const currentEmployeeId = computed(() => authStore.user?.id || 0)

// Computed properties
const breadcrumbItems = computed(() => [
  { title: 'Dashboard', to: '/dashboard', disabled: false },
  { title: 'My Attendance', disabled: true }
])

// Watch pagination changes
watch(() => [pagination.page, pagination.itemsPerPage], async () => {
  await fetchAttendance()
})

// Methods
const fetchAttendance = async () => {
  if (!currentEmployeeId.value) {
    console.error('No employee ID available')
    return
  }

  loading.value = true
  try {
    const response = await attendanceApi.getMyAttendance({
      employeeId: currentEmployeeId.value,
      startIndex: (pagination.page - 1) * pagination.itemsPerPage,
      pageSize: pagination.itemsPerPage,
      startDate: filterStartDate.value,
      endDate: filterEndDate.value
    })

    if (response.success && response.data) {
      // Match legacy response structure (with typo in 'attendaceReport')
      attendanceRecords.value = response.data.attendaceReport || []
      totalRecords.value = response.data.totalRecords || 0
      isManualAttendance.value = response.data.isManualAttendance ?? true
      // Legacy: isTimedIn = true means ready to time in (show time in button)
      showTimeInButton.value = response.data.isTimedIn ?? true
      filledDates.value = response.data.dates || []
    }
  } catch (error) {
    console.error('Failed to fetch attendance:', error)
    attendanceRecords.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

const handleEdit = (item: any) => {
  timeInDialog.editData = {
    id: item.id,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    location: item.location,
    reason: item.audit?.[0]?.reason || '',
    totalHours: item.totalHours || ''
  }
  timeInDialog.open = true
}

const handleTimeIn = () => {
  timeInDialog.editData = {
    id: 0,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    note: '',
    reason: '',
    totalHours: ''
  }
  timeInDialog.open = true
}

const handleTimeOut = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', { hour12: false })
  timeOutDialog.open = true
}

const handleTimeInSubmit = async (data: any) => {
  timeInDialog.loading = true
  try {
    console.log('=== Time In Submit Debug ===')
    console.log('Current Employee ID:', currentEmployeeId.value)
    console.log('Auth Store User:', authStore.user)
    console.log('Data being sent:', data)
    
    const response = data.id 
      ? await attendanceApi.updateAttendance(data.id, data, currentEmployeeId.value)
      : await attendanceApi.addAttendance(currentEmployeeId.value, data)

    console.log('API Response:', response)
    
    if (response.success) {
      timeInDialog.open = false
      await fetchAttendance()
    }
  } catch (error: any) {
    console.error('Failed to save attendance:', error)
    console.error('Error response:', error.response?.data)
  } finally {
    timeInDialog.loading = false
  }
}

const handleTimeOutSubmit = async () => {
  timeOutDialog.loading = true
  try {
    // Match legacy behavior: use update or add endpoint for time out
    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    
    // Check if attendance record exists for today
    const todayRecord = attendanceRecords.value.find(record => record.date === today)
    
    const auditEntry = {
      action: 'Time Out',
      time: currentTime
    }
    
    let response
    if (todayRecord) {
      // Update existing record
      const payload = {
        date: today,
        endTime: currentTime,
        audit: [auditEntry]
      }
      response = await attendanceApi.updateAttendance(todayRecord.id, payload, currentEmployeeId.value)
    } else {
      // Add new record
      const payload = {
        date: today,
        endTime: currentTime,
        audit: [auditEntry]
      }
      response = await attendanceApi.addAttendance(currentEmployeeId.value, payload)
    }

    if (response.success) {
      timeOutDialog.open = false
      await fetchAttendance()
    }
  } catch (error) {
    console.error('Failed to time out:', error)
  } finally {
    timeOutDialog.loading = false
  }
}

const handleFilter = async (filters: any) => {
  filterStartDate.value = filters.startDate
  filterEndDate.value = filters.endDate
  pagination.page = 1
  await fetchAttendance()
}

// Lifecycle
onMounted(async () => {
  await fetchAttendance()
})
</script>

<style scoped>
/* Legacy PageHeader styling */
.page-header {
  background: #ffffff;
}

/* Breadcrumbs styling */
:deep(.v-breadcrumbs-item) {
  font-size: 0.875rem;
}

:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.6;
}
</style>
