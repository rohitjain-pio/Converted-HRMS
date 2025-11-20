<template>
  <div v-if="show" class="dialog-overlay" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <h3>{{ isAccept ? 'Accept Resignation' : 'Reject Resignation' }}</h3>
      <p v-if="isAccept">
        Confirm that you want to accept this resignation. The employee will be notified.
      </p>
      <p v-else>
        Please provide a reason for rejecting this resignation.
      </p>

      <form @submit.prevent="handleSubmit">
        <div v-if="!isAccept" class="form-group">
          <label for="reason">Rejection Reason <span class="required">*</span></label>
          <textarea
            id="reason"
            v-model="rejectReason"
            rows="4"
            maxlength="500"
            placeholder="Enter reason for rejection..."
            required
          ></textarea>
          <small class="char-count">{{ rejectReason.length }}/500 characters</small>
        </div>

        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <div class="dialog-actions">
          <button type="button" @click="handleClose" class="btn-secondary" :disabled="processing">
            Cancel
          </button>
          <button
            type="submit"
            :class="['btn-primary', isAccept ? 'btn-success' : 'btn-danger']"
            :disabled="processing || (!isAccept && !rejectReason)"
          >
            {{ processing ? 'Processing...' : (isAccept ? 'Accept' : 'Reject') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';

const props = defineProps<{
  show: boolean;
  resignationId: number;
  action: 'accept' | 'reject';
}>();

const emit = defineEmits(['close', 'completed']);

const rejectReason = ref('');
const processing = ref(false);
const error = ref<string | null>(null);

const isAccept = computed(() => props.action === 'accept');

function handleClose() {
  if (!processing.value) {
    rejectReason.value = '';
    error.value = null;
    emit('close');
  }
}

async function handleSubmit() {
  processing.value = true;
  error.value = null;

  let result;
  
  if (isAccept.value) {
    result = await adminExitEmployeeApi.acceptResignation(props.resignationId);
  } else {
    result = await adminExitEmployeeApi.adminRejection({
      ResignationId: props.resignationId,
      RejectionType: 'Resignation',
      RejectionReason: rejectReason.value,
    });
  }

  processing.value = false;

  if (result.data.StatusCode === 200) {
    emit('completed');
    handleClose();
  } else {
    error.value = result.data.Message || `Failed to ${props.action} resignation`;
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

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
}

.char-count {
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
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-success {
  background-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
