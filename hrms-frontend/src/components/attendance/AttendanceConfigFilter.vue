<template>
  <v-form @submit.prevent="handleSearch">
    <v-row>
      <!-- Department Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-autocomplete
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

      <!-- Designation Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-autocomplete
          v-model="localFilters.designationId"
          label="Designation"
          :items="designations"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>

      <!-- Branch Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-autocomplete
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

      <!-- Country Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-autocomplete
          v-model="localFilters.countryId"
          label="Country"
          :items="countries"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>

      <!-- Attendance Method Filter -->
      <v-col cols="12" md="4" lg="3">
        <v-select
          v-model="localFilters.isManualAttendance"
          label="Attendance Method"
          :items="attendanceMethods"
          item-title="label"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>

      <!-- DOJ Range Selector -->
      <v-col cols="12" md="4" lg="3">
        <v-select
          v-model="selectedDojRange"
          label="Select DOJ Range"
          :items="dojRangeOptions"
          item-title="label"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          @update:model-value="handleDojRangeChange"
        />
      </v-col>

      <!-- Custom DOJ From Date -->
      <v-col v-if="selectedDojRange === 'custom'" cols="12" md="4" lg="3">
        <v-text-field
          v-model="localFilters.dojFrom"
          label="DOJ From"
          type="date"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>

      <!-- Custom DOJ To Date -->
      <v-col v-if="selectedDojRange === 'custom'" cols="12" md="4" lg="3">
        <v-text-field
          v-model="localFilters.dojTo"
          label="DOJ To"
          type="date"
          clearable
          density="compact"
          variant="outlined"
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
import { ref, reactive, onMounted } from 'vue'
import { employeeService } from '@/services/employeeService'
import moment from 'moment'

// Props and Emits
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

interface LocalFilters {
  departmentId?: number | null
  designationId?: number | null
  branchId?: number | null
  countryId?: number | null
  dojFrom?: string | null
  dojTo?: string | null
  isManualAttendance?: string | null
}

interface Props {
  filters: ConfigFilters
}

defineProps<Props>()

const emit = defineEmits<{
  search: [filters: ConfigFilters]
  reset: []
}>()

// Local state
const localFilters = reactive<LocalFilters>({
  departmentId: null,
  designationId: null,
  branchId: null,
  countryId: null,
  dojFrom: null,
  dojTo: null,
  isManualAttendance: null
})

const selectedDojRange = ref<string | null>(null)

// Options data
const departments = ref<Array<{ id: number; name: string }>>([])
const designations = ref<Array<{ id: number; name: string }>>([])
const branches = ref<Array<{ id: number; name: string }>>([])
const countries = ref<Array<{ id: number; name: string }>>([])

const attendanceMethods = [
  { id: 'timeDoctor', label: 'Time Doctor' },
  { id: 'manual', label: 'Manual' }
]

const dojRangeOptions = [
  { id: 'past7Days', label: 'Past 7 Days' },
  { id: 'past15Days', label: 'Past 15 Days' },
  { id: 'past30Days', label: 'Past 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'previousMonth', label: 'Previous Month' },
  { id: 'custom', label: 'Custom' }
]

// Branches will be fetched from API

// Date range handler
const handleDojRangeChange = (range: string | null) => {
  if (!range) {
    localFilters.dojFrom = null
    localFilters.dojTo = null
    return
  }

  const today = moment()
  let dateRange: { from: moment.Moment; to: moment.Moment } | null = null

  switch (range) {
    case 'past7Days':
      dateRange = {
        from: today.clone().subtract(7, 'day').startOf('day'),
        to: today.clone().endOf('day')
      }
      break
    case 'past15Days':
      dateRange = {
        from: today.clone().subtract(15, 'day').startOf('day'),
        to: today.clone().endOf('day')
      }
      break
    case 'past30Days':
      dateRange = {
        from: today.clone().subtract(30, 'day').startOf('day'),
        to: today.clone().endOf('day')
      }
      break
    case 'thisMonth':
      dateRange = {
        from: today.clone().startOf('month'),
        to: today.clone().endOf('month')
      }
      break
    case 'previousMonth':
      dateRange = {
        from: today.clone().subtract(1, 'month').startOf('month'),
        to: today.clone().subtract(1, 'month').endOf('month')
      }
      break
    case 'custom':
      localFilters.dojFrom = null
      localFilters.dojTo = today.format('YYYY-MM-DD')
      return
  }

  if (dateRange) {
    localFilters.dojFrom = dateRange.from.format('YYYY-MM-DD')
    localFilters.dojTo = dateRange.to.format('YYYY-MM-DD')
  }
}

// Methods
const handleSearch = () => {
  const filters: ConfigFilters = {
    departmentId: localFilters.departmentId,
    designationId: localFilters.designationId,
    branchId: localFilters.branchId,
    countryId: localFilters.countryId,
    dojFrom: localFilters.dojFrom,
    dojTo: localFilters.dojTo,
    isManualAttendance: null
  }

  // Convert attendance method string to boolean
  if (localFilters.isManualAttendance === 'manual') {
    filters.isManualAttendance = true
  } else if (localFilters.isManualAttendance === 'timeDoctor') {
    filters.isManualAttendance = false
  } else {
    filters.isManualAttendance = null
  }

  emit('search', filters)
}

const handleReset = () => {
  localFilters.departmentId = null
  localFilters.designationId = null
  localFilters.branchId = null
  localFilters.countryId = null
  localFilters.dojFrom = null
  localFilters.dojTo = null
  localFilters.isManualAttendance = null
  selectedDojRange.value = null
  emit('reset')
}

// Fetch master data from API
const fetchMasterData = async () => {
  try {
    // Fetch departments
    const deptResponse = await employeeService.getDepartments()
    if (deptResponse.data?.success && deptResponse.data?.data) {
      departments.value = deptResponse.data.data
    }

    // Fetch branches
    const branchResponse = await employeeService.getBranches()
    if (branchResponse.data?.success && branchResponse.data?.data) {
      branches.value = branchResponse.data.data
    }

    // Fetch designations
    const desigResponse = await employeeService.getDesignations()
    if (desigResponse.data?.success && desigResponse.data?.data) {
      designations.value = desigResponse.data.data
    }

    // Fetch countries
    const countryResponse = await employeeService.getCountries()
    if (countryResponse.data?.success && countryResponse.data?.data) {
      countries.value = countryResponse.data.data.map((c: any) => ({
        id: c.id,
        name: c.country_name || c.name
      }))
    }
  } catch (error) {
    console.error('Error fetching master data:', error)
  }
}

onMounted(() => {
  fetchMasterData()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
