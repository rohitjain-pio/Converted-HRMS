<template>
  <v-form @submit.prevent="handleSearch">
    <v-row>
      <!-- Department Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-select
          v-model="localFilters.departmentId"
          label="Department"
          :items="departments"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>

      <!-- Branch Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-select
          v-model="localFilters.branchId"
          label="Branch"
          :items="branches"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>

      <!-- Date Range Selector -->
      <v-col cols="12" md="4" lg="3">
        <v-select
          v-model="selectedDateRange"
          label="Select Date Range"
          :items="dateRangeOptions"
          item-title="label"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          @update:model-value="handleDateRangeChange"
        />
      </v-col>

      <!-- Custom Date From (when custom is selected) -->
      <v-col v-if="selectedDateRange === 'custom'" cols="12" md="4" lg="3">
        <v-text-field
          v-model="localFilters.dateFrom"
          label="Start Date"
          type="date"
          :max="localFilters.dateTo || today"
          density="compact"
          variant="outlined"
          :rules="[validateDateRange]"
        />
      </v-col>

      <!-- Custom Date To (when custom is selected) -->
      <v-col v-if="selectedDateRange === 'custom'" cols="12" md="4" lg="3">
        <v-text-field
          v-model="localFilters.dateTo"
          label="End Date"
          type="date"
          :min="localFilters.dateFrom"
          :max="today"
          density="compact"
          variant="outlined"
          :rules="[validateDateRange, validate90DaysLimit]"
        />
      </v-col>
    </v-row>

    <!-- Action Buttons -->
    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-center gap-3">
        <v-btn
          type="submit"
          color="primary"
          prepend-icon="mdi-magnify"
          :disabled="!isValidDateRange"
        >
          Search
        </v-btn>
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="handleReset"
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import moment from 'moment'
import axios from 'axios'

// Props and Emits
interface ReportFilters {
  employeeCode?: string
  employeeName?: string
  departmentId?: number | null
  branchId?: number | null
  dateFrom?: string | null
  dateTo?: string | null
  isManualAttendance?: boolean | null
}

interface Props {
  filters: ReportFilters
}

defineProps<Props>()

const emit = defineEmits<{
  search: [filters: ReportFilters]
  reset: []
}>()

// Local state
const localFilters = reactive<ReportFilters>({
  departmentId: null,
  branchId: null,
  dateFrom: moment().subtract(7, 'days').format('YYYY-MM-DD'),
  dateTo: moment().format('YYYY-MM-DD')
})

const selectedDateRange = ref<string>('past7Days')
const today = moment().format('YYYY-MM-DD')

// Options data - will be fetched from API
const departments = ref<Array<{ id: number; name: string }>>([])
const branches = ref<Array<{ id: number; name: string }>>([])
const loadingDepartments = ref(false)
const loadingBranches = ref(false)

const dateRangeOptions = [
  { id: 'past7Days', label: 'Past 7 Days' },
  { id: 'past15Days', label: 'Past 15 Days' },
  { id: 'past30Days', label: 'Past 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'previousMonth', label: 'Previous Month' },
  { id: 'custom', label: 'Custom' }
]

// Validation
const isValidDateRange = computed(() => {
  if (!localFilters.dateFrom || !localFilters.dateTo) return false
  const from = moment(localFilters.dateFrom)
  const to = moment(localFilters.dateTo)
  return from.isSameOrBefore(to) && to.diff(from, 'days') <= 90
})

const validateDateRange = () => {
  if (!localFilters.dateFrom || !localFilters.dateTo) return true
  const from = moment(localFilters.dateFrom)
  const to = moment(localFilters.dateTo)
  return to.isSameOrAfter(from) || 'End date must be after start date'
}

const validate90DaysLimit = () => {
  if (!localFilters.dateFrom || !localFilters.dateTo) return true
  const from = moment(localFilters.dateFrom)
  const to = moment(localFilters.dateTo)
  const diffDays = to.diff(from, 'days')
  return diffDays <= 90 || 'Cannot select more than 90 days'
}

// Methods
const getDateRange = (range: string) => {
  const now = moment()

  switch (range) {
    case 'past7Days':
      return {
        from: now.clone().subtract(7, 'days').format('YYYY-MM-DD'),
        to: now.format('YYYY-MM-DD')
      }
    case 'past15Days':
      return {
        from: now.clone().subtract(15, 'days').format('YYYY-MM-DD'),
        to: now.format('YYYY-MM-DD')
      }
    case 'past30Days':
      return {
        from: now.clone().subtract(30, 'days').format('YYYY-MM-DD'),
        to: now.format('YYYY-MM-DD')
      }
    case 'thisMonth':
      return {
        from: now.clone().startOf('month').format('YYYY-MM-DD'),
        to: now.format('YYYY-MM-DD')
      }
    case 'previousMonth':
      return {
        from: now.clone().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        to: now.clone().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      }
    default:
      return null
  }
}

const handleDateRangeChange = (value: string | null) => {
  if (!value) {
    localFilters.dateFrom = null
    localFilters.dateTo = null
    return
  }

  if (value === 'custom') {
    // Keep current dates for custom selection
    return
  }

  const dateRange = getDateRange(value)
  if (dateRange) {
    localFilters.dateFrom = dateRange.from
    localFilters.dateTo = dateRange.to
  }
}

const handleSearch = () => {
  if (!isValidDateRange.value) return

  const filters: ReportFilters = {
    departmentId: localFilters.departmentId,
    branchId: localFilters.branchId,
    dateFrom: localFilters.dateFrom,
    dateTo: localFilters.dateTo
  }

  emit('search', filters)
}

const handleReset = () => {
  localFilters.departmentId = null
  localFilters.branchId = null
  localFilters.dateFrom = moment().subtract(7, 'days').format('YYYY-MM-DD')
  localFilters.dateTo = moment().format('YYYY-MM-DD')
  selectedDateRange.value = 'past7Days'
  emit('reset')
}

// Fetch departments from API
const fetchDepartments = async () => {
  loadingDepartments.value = true
  try {
    const response = await axios.get('/api/master/departments')
    if (response.data.success) {
      departments.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching departments:', error)
  } finally {
    loadingDepartments.value = false
  }
}

// Fetch branches from API
const fetchBranches = async () => {
  loadingBranches.value = true
  try {
    const response = await axios.get('/api/master/branches')
    if (response.data.success) {
      branches.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching branches:', error)
  } finally {
    loadingBranches.value = false
  }
}

// Load data on component mount
onMounted(() => {
  fetchDepartments()
  fetchBranches()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
