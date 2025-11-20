<template>
  <div v-if="show" class="dialog-overlay" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <h3>Request Early Release</h3>
      <p>Request to be released before your calculated last working day.</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="early-date">Early Release Date <span class="required">*</span></label>
          <input
            id="early-date"
            type="date"
            v-model="earlyReleaseDate"
            :min="minDate"
            :max="maxDate"
            required
          />
          <small class="help-text">
            Must be between today and your last working day ({{ formatDate(lastWorkingDay) }})
          </small>
        </div>

        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <div class="dialog-actions">
          <button type="button" @click="handleClose" class="btn-secondary" :disabled="processing">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="processing || !earlyReleaseDate">
            {{ processing ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useResignationStore } from '@/stores/resignationStore';
import { formatDate } from '@/utils/exitManagementHelpers';

const props = defineProps<{
  show: boolean;
  resignationId: number;
  lastWorkingDay: string;
}>();

const emit = defineEmits(['close', 'requested']);

const resignationStore = useResignationStore();
const earlyReleaseDate = ref('');
const processing = ref(false);
const error = ref<string | null>(null);

const minDate = computed(() => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Tomorrow
  return today.toISOString().split('T')[0];
});

const maxDate = computed(() => {
  const lwd = new Date(props.lastWorkingDay);
  lwd.setDate(lwd.getDate() - 1); // Day before LWD
  return lwd.toISOString().split('T')[0];
});

function handleClose() {
  if (!processing.value) {
    earlyReleaseDate.value = '';
    error.value = null;
    emit('close');
  }
}

async function handleSubmit() {
  processing.value = true;
  error.value = null;

  const result = await resignationStore.requestEarlyRelease({
    ResignationId: props.resignationId,
    EarlyReleaseDate: earlyReleaseDate.value,
  });

  processing.value = false;

  if (result.success) {
    emit('requested');
    handleClose();
  } else {
    error.value = result.error || 'Failed to submit early release request';
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

p {
  margin-bottom: 20px;
  color: #555;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.required {
  color: #dc3545;
}

input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input[type="date"]:focus {
  outline: none;
  border-color: #007bff;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.error-box {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
