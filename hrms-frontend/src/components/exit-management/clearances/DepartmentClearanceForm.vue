<template>
  <div class="department-clearance-form">
    <h3>Department Clearance</h3>

    <div v-if="loading" class="loading-state">
      <p>Loading clearance data...</p>
    </div>

    <div v-else>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="kt-status">Knowledge Transfer Status <span class="required">*</span></label>
          <select id="kt-status" v-model="formData.KTStatus" required>
            <option value="">Select Status</option>
            <option value="1">Not Started</option>
            <option value="2">In Progress</option>
            <option value="3">Completed</option>
          </select>
        </div>

        <div class="form-group">
          <label for="kt-notes">KT Notes</label>
          <textarea
            id="kt-notes"
            v-model="formData.KTNotes"
            rows="4"
            maxlength="1000"
            placeholder="Enter knowledge transfer notes..."
          ></textarea>
          <small class="char-count">{{ (formData.KTNotes || '').length }}/1000 characters</small>
        </div>

        <div class="form-group">
          <label for="kt-users">KT Users (Comma-separated IDs)</label>
          <input
            id="kt-users"
            type="text"
            v-model="formData.KTUsers"
            placeholder="e.g., 101, 102, 103"
          />
          <small class="help-text">Enter employee IDs separated by commas</small>
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
            {{ saving ? 'Saving...' : 'Save Department Clearance' }}
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
  KTStatus: '',
  KTNotes: '',
  KTUsers: '',
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

  const result = await clearanceStore.upsertDepartmentClearance({
    ResignationId: formData.value.ResignationId,
    KTStatus: parseInt(formData.value.KTStatus),
    KTNotes: formData.value.KTNotes,
    KTUsers: formData.value.KTUsers,
    Attachment: formData.value.Attachment,
    IsCompleted: formData.value.IsCompleted,
  });

  saving.value = false;

  if (result.success) {
    emit('saved');
  } else {
    error.value = result.error || 'Failed to save department clearance';
  }
}

async function loadClearance() {
  loading.value = true;
  await clearanceStore.fetchDepartmentClearance(props.resignationId);
  loading.value = false;

  const existing = clearanceStore.deptClearance;
  if (existing) {
    formData.value = {
      ...formData.value,
      ...existing,
      KTStatus: existing.KTStatus?.toString() || '',
    };
  }
}

onMounted(() => {
  loadClearance();
});
</script>

<style scoped>
.department-clearance-form {
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

.required {
  color: #dc3545;
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
