<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500px"
    min-width="500px"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <!-- Dialog Header matching legacy PageHeader -->
      <div class="dialog-header px-4 py-3">
        <v-row no-gutters align="center" justify="space-between">
          <v-col cols="auto">
            <h4 class="text-h5 dark-color" style="font-weight: 500;">
              Time In
            </h4>
          </v-col>
          <v-col cols="auto">
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="handleClose"
            />
          </v-col>
        </v-row>
      </div>
      
      <v-card-text class="px-4" style="padding-top: 30px; padding-bottom: 30px;">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row dense>
            <!-- Date Picker -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.date"
                type="date"
                label="Date*"
                :max="maxDate"
                :min="minDate"
                variant="outlined"
                density="comfortable"
                :error-messages="fieldErrors.date"
                hide-details="auto"
                :disabled="shouldDisableDate(formData.date)"
              />
            </v-col>

            <!-- Start Time & End Time (only for past dates) -->
            <template v-if="isPastDate">
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.startTime"
                  type="time"
                  label="Start Time*"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="fieldErrors.startTime"
                  hide-details="auto"
                  required
                />
              </v-col>
              
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.endTime"
                  type="time"
                  label="End Time*"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="fieldErrors.endTime"
                  hide-details="auto"
                  required
                  @update:model-value="validateEndTime"
                />
              </v-col>
              
              <v-col cols="12" sm="4">
                <v-text-field
                  :model-value="calculatedHours"
                  label="Total Hours"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  hide-details="auto"
                />
              </v-col>
            </template>

            <!-- Location -->
            <v-col cols="12">
              <v-select
                v-model="formData.location"
                :items="locationOptions"
                label="Location*"
                variant="outlined"
                density="comfortable"
                :error-messages="fieldErrors.location"
                hide-details="auto"
                required
              />
            </v-col>

            <!-- Note (only for today) -->
            <v-col v-if="isToday" cols="12">
              <v-text-field
                v-model="formData.note"
                label="Note (optional)"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>

            <!-- Reason (only for past dates) -->
            <v-col v-if="isPastDate" cols="12">
              <v-text-field
                v-model="formData.reason"
                label="Reason for past entry*"
                variant="outlined"
                density="comfortable"
                :error-messages="fieldErrors.reason"
                hide-details="auto"
                required
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="px-6 pb-4 pt-2" style="justify-content: center; gap: 16px;">
        <v-btn variant="text" @click="handleClose" min-width="80">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="loading"
          @click="handleSubmit"
          min-width="80"
        >
          Time In
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { format, differenceInMinutes, parse, isBefore, isToday as checkIsToday, isSameDay } from 'date-fns'
import type { EditData } from '@/composables/useAttendanceDialogs'

interface Props {
  modelValue: boolean
  editData?: EditData | null
  loading: boolean
  filledDates: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

// Refs
const formRef = ref()

// Reactive data
const formData = reactive({
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  note: '',
  reason: ''
})

const fieldErrors = reactive<{
  date: string[]
  startTime: string[]
  endTime: string[]
  location: string[]
  reason: string[]
}>({
  date: [],
  startTime: [],
  endTime: [],
  location: [],
  reason: []
})

// Location options matching legacy exactly
const locationOptions = [
  'Jaipur Office',
  'Hyderabad Office',
  'Pune Office',
  'Remote',
  'On Premises',
  'US',
  'Other'
]

// Computed properties
const today = computed(() => format(new Date(), 'yyyy-MM-dd'))
const maxDate = computed(() => format(new Date(), 'yyyy-MM-dd'))
const minDate = computed(() => '2025-06-03') // Matching legacy min date

const isEdit = computed(() => props.editData && props.editData.id > 0)

const isPastDate = computed(() => {
  if (!formData.date) return false
  const selectedDate = new Date(formData.date)
  const todayDate = new Date()
  return isBefore(selectedDate, todayDate) && !isSameDay(selectedDate, todayDate)
})

const isToday = computed(() => {
  if (!formData.date) return false
  return checkIsToday(new Date(formData.date))
})

const calculatedHours = computed(() => {
  if (formData.startTime && formData.endTime) {
    try {
      const start = parse(formData.startTime, 'HH:mm', new Date())
      const end = parse(formData.endTime, 'HH:mm', new Date())
      let minutes = differenceInMinutes(end, start)
      
      if (minutes < 0) {
        minutes += 24 * 60 // Handle overnight
      }
      
      if (minutes > 0) {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      }
    } catch (error) {
      // Invalid time format
    }
  }
  return '00:00'
})

// Methods
const shouldDisableDate = (date: string) => {
  if (!date) return false
  
  const selectedDate = new Date(date)
  const isFilled = props.filledDates.some(filled => 
    isSameDay(new Date(filled), selectedDate)
  )
  const isCurrentToday = checkIsToday(selectedDate)
  
  // Disable if filled and not today (matching legacy logic)
  return isFilled && !isCurrentToday
}

const validateEndTime = () => {
  fieldErrors.endTime = []
  
  if (formData.startTime && formData.endTime) {
    if (formData.endTime < formData.startTime) {
      fieldErrors.endTime.push('End time cannot be before start time.')
    }
  }
}

const validateForm = (): boolean => {
  // Reset errors
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key as keyof typeof fieldErrors] = []
  })
  
  let isValid = true
  
  // Validate date
  if (!formData.date) {
    fieldErrors.date.push('Date is required')
    isValid = false
  } else if (isEdit.value && checkIsToday(new Date(formData.date))) {
    fieldErrors.date.push('You cannot edit for the current date.')
    isValid = false
  }
  
  // Validate location
  if (!formData.location) {
    fieldErrors.location.push('Location is required')
    isValid = false
  }
  
  // Validate for past dates
  if (isPastDate.value) {
    if (!formData.startTime) {
      fieldErrors.startTime.push('Start time is required')
      isValid = false
    }
    
    if (!formData.endTime) {
      fieldErrors.endTime.push('End time is required')
      isValid = false
    } else {
      validateEndTime()
      if (fieldErrors.endTime.length > 0) {
        isValid = false
      }
    }
    
    if (!formData.reason || formData.reason.trim() === '') {
      fieldErrors.reason.push('Please tell us why you\'re adding a past entry.')
      isValid = false
    }
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  const currentTime = format(new Date(), 'HH:mm')
  let time = currentTime
  let endTime: string | undefined = undefined
  
  const auditEntries = []
  
  if (isPastDate.value) {
    // For past dates
    time = formData.startTime
    endTime = formData.endTime
    
    auditEntries.push({
      action: 'Time In',
      time,
      reason: formData.reason
    })
    
    auditEntries.push({
      action: 'Time Out',
      time: endTime
    })
  } else {
    // For today
    auditEntries.push({
      action: 'Time In',
      time,
      comment: formData.note ? `${formData.note} (${formData.location})` : '',
      reason: formData.reason
    })
  }
  
  const submitData = {
    id: isEdit.value ? props.editData?.id : 0,
    date: formData.date,
    startTime: time,
    endTime: endTime || null,
    location: formData.location,
    note: formData.note || null,
    reason: formData.reason || null,
    audit: auditEntries
  }
  
  emit('submit', submitData)
}

const handleClose = () => {
  // Reset form
  Object.assign(formData, {
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    note: '',
    reason: ''
  })
  
  // Clear errors
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key as keyof typeof fieldErrors] = []
  })
  
  emit('update:modelValue', false)
}

// Watchers
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.editData) {
    nextTick(() => {
      formData.date = props.editData.date
      formData.startTime = props.editData.startTime
      formData.endTime = props.editData.endTime
      formData.location = props.editData.location
      formData.note = props.editData.notes || ''
      formData.reason = props.editData.reason || ''
    })
  } else if (isOpen && !props.editData) {
    // New entry
    nextTick(() => {
      formData.date = today.value
      formData.startTime = ''
      formData.endTime = ''
      formData.location = ''
      formData.note = ''
      formData.reason = ''
    })
  }
})
</script>

<style scoped>
.dialog-header {
  background: #ffffff;
}

/* Legacy MUI dialog styling */
:deep(.v-text-field) {
  margin-bottom: 0;
}

:deep(.v-select) {
  margin-bottom: 0;
}

:deep(.v-field__input) {
  font-size: 0.875rem;
}

:deep(.v-label) {
  font-size: 0.875rem;
}

:deep(.v-btn) {
  text-transform: uppercase;
  letter-spacing: 0.02857em;
  font-weight: 500;
}

.dark-color {
  color: #273A50;
}
</style>
