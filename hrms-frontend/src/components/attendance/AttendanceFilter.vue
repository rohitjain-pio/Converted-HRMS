<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row dense>
      <!-- Date Range Selector -->
      <v-col cols="12" md="4" lg="3">
        <v-select
          v-model="selectedRange"
          :items="dateRangeOptions"
          item-title="label"
          item-value="id"
          label="Select Date Range"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          @update:model-value="handleDateRangeChange"
        />
      </v-col>

      <!-- Custom Date From (only shows when custom is selected) -->
      <v-col v-if="selectedRange === 'custom'" cols="12" md="4" lg="3">
        <v-text-field
          v-model="formData.startDate"
          type="date"
          label="Date From"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
      </v-col>

      <!-- Custom Date To (only shows when custom is selected) -->
      <v-col v-if="selectedRange === 'custom'" cols="12" md="4" lg="3">
        <v-text-field
          v-model="formData.endDate"
          type="date"
          label="Date To"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
      </v-col>

      <!-- Action Buttons -->
      <v-col cols="12" class="pt-4">
        <div class="d-flex justify-center" style="gap: 16px;">
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            min-width="120"
          >
            Submit
          </v-btn>
          <v-btn
            type="button"
            color="inherit"
            variant="elevated"
            min-width="120"
            @click="handleReset"
          >
            Reset
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

// Types matching legacy
export type AttendanceFilter = {
  startDate: string
  endDate: string
}

type DateRangeType =
  | 'past7Days'
  | 'past15Days'
  | 'past30Days'
  | 'thisMonth'
  | 'previousMonth'
  | 'custom'

// Emits
const emit = defineEmits<{
  search: [filters: AttendanceFilter]
}>()

// Expose methods for parent component
defineExpose({
  handleReset
})

// State
const selectedRange = ref<'' | DateRangeType>('')
const formData = reactive({
  startDate: '',
  endDate: ''
})

// Date range options matching legacy exactly
const dateRangeOptions = [
  { id: 'past7Days', label: 'Past 7 Days' },
  { id: 'past15Days', label: 'Past 15 Days' },
  { id: 'past30Days', label: 'Past 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'previousMonth', label: 'Previous Month' },
  { id: 'custom', label: 'Custom' }
]

// Methods
const getDateRange = (range: DateRangeType) => {
  const today = new Date()

  switch (range) {
    case 'past7Days':
      return {
        from: format(subDays(today, 7), 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd')
      }
    case 'past15Days':
      return {
        from: format(subDays(today, 15), 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd')
      }
    case 'past30Days':
      return {
        from: format(subDays(today, 30), 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd')
      }
    case 'thisMonth':
      return {
        from: format(startOfMonth(today), 'yyyy-MM-dd'),
        to: format(endOfMonth(today), 'yyyy-MM-dd')
      }
    case 'previousMonth': {
      const prevMonth = subMonths(today, 1)
      return {
        from: format(startOfMonth(prevMonth), 'yyyy-MM-dd'),
        to: format(endOfMonth(prevMonth), 'yyyy-MM-dd')
      }
    }
    default:
      return null
  }
}

const handleDateRangeChange = (value: DateRangeType) => {
  const dateRange = getDateRange(value)

  if (!dateRange) {
    // Reset for custom selection
    formData.startDate = ''
    formData.endDate = ''
    return
  }

  // Auto-fill dates for predefined ranges
  formData.startDate = dateRange.from
  formData.endDate = dateRange.to
}

const handleSubmit = () => {
  emit('search', {
    startDate: formData.startDate,
    endDate: formData.endDate
  })
}

function handleReset() {
  selectedRange.value = ''
  formData.startDate = ''
  formData.endDate = ''
  emit('search', {
    startDate: '',
    endDate: ''
  })
}
</script>

<style scoped>
/* Match legacy Material-UI form styling */
:deep(.v-field) {
  font-size: 0.875rem;
}

:deep(.v-field__input) {
  min-height: 40px;
}

:deep(.v-label) {
  font-size: 0.875rem;
}

:deep(.v-btn) {
  text-transform: uppercase;
  letter-spacing: 0.02857em;
  font-weight: 500;
}
</style>
