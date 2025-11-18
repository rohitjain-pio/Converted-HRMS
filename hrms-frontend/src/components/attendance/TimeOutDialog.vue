<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <!-- Dialog Title matching legacy exactly -->
      <v-card-title class="dialog-title px-4 py-3">
        <span class="text-h5 dark-color" style="font-weight: 500;">Time Out</span>
      </v-card-title>
      
      <v-card-text class="px-4 py-4">
        <p class="text-body-2 mb-2">
          Please confirm your Time Out for the selected date.
        </p>
        <p class="mt-4">
          Confirm Time Out for <strong>{{ timeOutDate }}</strong>
        </p>
      </v-card-text>
      
      <v-card-actions class="px-4 pb-3">
        <v-btn
          variant="text"
          :disabled="loading"
          @click="handleClose"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          :disabled="loading"
          :loading="loading"
          @click="handleConfirm"
        >
          Time Out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'

interface Props {
  modelValue: boolean
  currentTime: string
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

// Computed
const timeOutDate = computed(() => {
  return format(new Date(), 'yyyy-MM-dd')
})

// Methods
const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-title {
  background: #ffffff;
}

.dark-color {
  color: #273A50;
}

/* Legacy MUI dialog styling */
:deep(.v-btn) {
  text-transform: uppercase;
  letter-spacing: 0.02857em;
  font-weight: 500;
}

:deep(.v-card-text) {
  font-size: 0.875rem;
  line-height: 1.43;
  color: rgba(0, 0, 0, 0.87);
}
</style>
