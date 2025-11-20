<template>
  <div class="hr-clearance-form">
    <h3>HR Clearance</h3>

    <div v-if="loading" class="loading-state">
      <p>Loading clearance data...</p>
    </div>

    <div v-else>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label for="advance-bonus">Advance Bonus Recovery Amount</label>
            <input
              id="advance-bonus"
              type="number"
              step="0.01"
              v-model.number="formData.AdvanceBonusRecoveryAmount"
              placeholder="0.00"
            />
          </div>

          <div class="form-group">
            <label for="service-agreement">Service Agreement Details</label>
            <input
              id="service-agreement"
              type="text"
              v-model="formData.ServiceAgreementDetails"
              maxlength="200"
              placeholder="Enter details..."
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="current-el">Current Earned Leave (Days)</label>
            <input
              id="current-el"
              type="number"
              v-model.number="formData.CurrentEL"
              placeholder="0"
            />
          </div>

          <div class="form-group">
            <label for="buyout-days">Number of Buy Out Days</label>
            <input
              id="buyout-days"
              type="number"
              v-model.number="formData.NumberOfBuyOutDays"
              placeholder="0"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="exit-interview-status">Exit Interview Status</label>
            <select id="exit-interview-status" v-model="formData.ExitInterviewStatus">
              <option value="">Not Scheduled</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Skipped">Skipped</option>
            </select>
          </div>

          <div class="form-group">
            <label for="exit-interview-details">Exit Interview Details</label>
            <input
              id="exit-interview-details"
              type="text"
              v-model="formData.ExitInterviewDetails"
              maxlength="500"
              placeholder="Enter details..."
            />
          </div>
        </div>

        <div class="form-group">
          <label for="attachment">Attachment</label>
          <input
            id="attachment"
            type="file"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <small class="help-text">Maximum file size: 5MB. Allowed: PDF, DOC, DOCX, JPG, PNG</small>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.IsCompleted" />
            <span>Mark as Completed</span>
          </label>
        </div>

        <div v-if="error" class="error-box">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('cancel')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving...' : 'Save HR Clearance' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useClearanceStore } from '@/stores/clearanceStore';

const props = defineProps<{
  resignationId: number;
}>();

const emit = defineEmits(['cancel', 'saved']);

const clearanceStore = useClearanceStore();

const formData = ref({
  ResignationId: props.resignationId,
  AdvanceBonusRecoveryAmount: null as number | null,
  ServiceAgreementDetails: '',
  CurrentEL: null as number | null,
  NumberOfBuyOutDays: null as number | null,
  ExitInterviewStatus: '',
  ExitInterviewDetails: '',
  Attachment: null as File | null,
  IsCompleted: false,
});

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size must be less than 5MB';
      target.value = '';
      return;
    }
    
    formData.value.Attachment = file;
  }
}

async function handleSubmit() {
  saving.value = true;
  error.value = null;

  const result = await clearanceStore.upsertHRClearance({
    ResignationId: formData.value.ResignationId,
    AdvanceBonusRecoveryAmount: formData.value.AdvanceBonusRecoveryAmount,
    ServiceAgreementDetails: formData.value.ServiceAgreementDetails,
    CurrentEL: formData.value.CurrentEL,
    NumberOfBuyOutDays: formData.value.NumberOfBuyOutDays,
    ExitInterviewStatus: formData.value.ExitInterviewStatus,
    ExitInterviewDetails: formData.value.ExitInterviewDetails,
    Attachment: formData.value.Attachment,
    IsCompleted: formData.value.IsCompleted,
  });

  saving.value = false;

  if (result.success) {
    emit('saved');
  } else {
    error.value = result.error || 'Failed to save HR clearance';
  }
}

async function loadClearance() {
  loading.value = true;
  await clearanceStore.fetchHRClearance(props.resignationId);
  loading.value = false;

  const existing = clearanceStore.hrClearance;
  if (existing) {
    formData.value = {
      ...formData.value,
      ...existing,
    };
  }
}

onMounted(() => {
  loadClearance();
});
</script>

<style scoped>
.hr-clearance-form {
  padding: 0;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.checkbox-group {
  margin-top: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 8px;
  cursor: pointer;
}

.error-box {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
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

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
