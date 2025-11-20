<template>
  <div class="it-clearance-form">
    <h3>IT Clearance</h3>

    <div v-if="loading" class="loading-state">
      <p>Loading clearance data...</p>
    </div>

    <div v-else>
      <form @submit.prevent="handleSubmit">
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.AccessRevoked" />
            <span>Access Revoked</span>
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.AssetReturned" />
            <span>Assets Returned</span>
          </label>
        </div>

        <div class="form-group">
          <label for="asset-condition">Asset Condition</label>
          <select id="asset-condition" v-model="formData.AssetCondition">
            <option value="">Select Condition</option>
            <option value="1">Good</option>
            <option value="2">Fair</option>
            <option value="3">Damaged</option>
            <option value="4">Not Applicable</option>
          </select>
        </div>

        <div class="form-group">
          <label for="note">Notes</label>
          <textarea
            id="note"
            v-model="formData.Note"
            rows="4"
            maxlength="500"
            placeholder="Enter notes about IT clearance..."
          ></textarea>
          <small class="char-count">{{ (formData.Note || '').length }}/500 characters</small>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.ITClearanceCertification" />
            <span>IT Clearance Certification Issued</span>
          </label>
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
            {{ saving ? 'Saving...' : 'Save IT Clearance' }}
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
  AccessRevoked: false,
  AssetReturned: false,
  AssetCondition: '',
  Note: '',
  ITClearanceCertification: false,
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

  const result = await clearanceStore.upsertITClearance({
    ResignationId: formData.value.ResignationId,
    AccessRevoked: formData.value.AccessRevoked,
    AssetReturned: formData.value.AssetReturned,
    AssetCondition: formData.value.AssetCondition ? parseInt(formData.value.AssetCondition) : null,
    Note: formData.value.Note,
    ITClearanceCertification: formData.value.ITClearanceCertification,
    Attachment: formData.value.Attachment,
    IsCompleted: formData.value.IsCompleted,
  });

  saving.value = false;

  if (result.success) {
    emit('saved');
  } else {
    error.value = result.error || 'Failed to save IT clearance';
  }
}

async function loadClearance() {
  loading.value = true;
  await clearanceStore.fetchITClearance(props.resignationId);
  loading.value = false;

  const existing = clearanceStore.itClearance;
  if (existing) {
    formData.value = {
      ...formData.value,
      ...existing,
      AssetCondition: existing.AssetCondition?.toString() || '',
    };
  }
}

onMounted(() => {
  loadClearance();
});
</script>

<style scoped>
.it-clearance-form {
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

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

textarea {
  resize: vertical;
}

.char-count,
.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.checkbox-group {
  margin-bottom: 16px;
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
