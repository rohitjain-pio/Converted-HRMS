<template>
  <div v-if="show" class="dialog-overlay" @click="handleClose">
    <div class="dialog-content" @click.stop>
      <h3>Withdraw Resignation</h3>
      <p>Are you sure you want to withdraw your resignation?</p>
      <p class="warning-text">
        This action cannot be undone. Once withdrawn, you will need to submit a new resignation if you change your mind.
      </p>

      <div v-if="error" class="error-box">
        {{ error }}
      </div>

      <div class="dialog-actions">
        <button @click="handleClose" class="btn-secondary" :disabled="processing">
          Cancel
        </button>
        <button @click="handleConfirm" class="btn-danger" :disabled="processing">
          {{ processing ? 'Processing...' : 'Yes, Withdraw' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useResignationStore } from '@/stores/resignationStore';

const props = defineProps<{
  show: boolean;
  resignationId: number;
}>();

const emit = defineEmits(['close', 'withdrawn']);

const resignationStore = useResignationStore();
const processing = ref(false);
const error = ref<string | null>(null);

function handleClose() {
  if (!processing.value) {
    emit('close');
  }
}

async function handleConfirm() {
  processing.value = true;
  error.value = null;

  const result = await resignationStore.revokeResignation(props.resignationId);

  processing.value = false;

  if (result.success) {
    emit('withdrawn');
    emit('close');
  } else {
    error.value = result.error || 'Failed to withdraw resignation';
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
  margin-bottom: 16px;
  color: #333;
}

p {
  margin-bottom: 12px;
  color: #555;
  line-height: 1.5;
}

.warning-text {
  color: #856404;
  background-color: #fff3cd;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
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

.btn-secondary,
.btn-danger {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
