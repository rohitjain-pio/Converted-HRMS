<template>
  <div class="resignation-form">
    <h2>Submit Resignation</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="reason">Reason for Resignation <span class="required">*</span></label>
        <textarea
          id="reason"
          v-model="formData.Reason"
          rows="5"
          maxlength="500"
          placeholder="Please provide your reason for resignation..."
          required
        ></textarea>
        <small class="char-count">{{ formData.Reason.length }}/500 characters</small>
        <span v-if="errors.Reason" class="error-text">{{ errors.Reason }}</span>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="formData.ExitDiscussion"
          />
          <span>I have discussed my exit with my manager</span>
        </label>
      </div>

      <div v-if="calculatedLWD" class="info-box">
        <p><strong>Calculated Last Working Day:</strong> {{ calculatedLWD }}</p>
        <p class="notice-info">Based on your employment type, your notice period is {{ noticePeriodDays }} days.</p>
      </div>

      <div v-if="submitError" class="error-box">
        {{ submitError }}
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" :disabled="submitting" class="btn-primary">
          {{ submitting ? 'Submitting...' : 'Submit Resignation' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useResignationStore } from '@/stores/resignationStore';
import { validateResignationData, calculateLastWorkingDay, NoticePeriods } from '@/utils/exitManagementHelpers';

const props = defineProps<{
  employeeId: number;
  departmentId: number;
  jobTypeId?: number; // 1=Probation, 2=Training, 3=Confirmed
}>();

const emit = defineEmits(['cancel', 'submitted']);

const resignationStore = useResignationStore();

const formData = ref({
  Reason: '',
  ExitDiscussion: false,
});

const errors = ref<Record<string, string>>({});
const submitting = ref(false);
const submitError = ref<string | null>(null);

const noticePeriodDays = computed(() => {
  const jobType = props.jobTypeId || 3; // Default to confirmed
  return jobType === 1 ? NoticePeriods.PROBATION : 
         jobType === 2 ? NoticePeriods.TRAINING : 
         NoticePeriods.CONFIRMED;
});

const calculatedLWD = computed(() => {
  if (!props.jobTypeId) return null;
  const lwd = calculateLastWorkingDay(new Date(), props.jobTypeId);
  return lwd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

async function handleSubmit() {
  errors.value = {};
  submitError.value = null;

  // Validate form data
  const validation = validateResignationData({
    EmployeeId: props.employeeId,
    DepartmentID: props.departmentId,
    Reason: formData.value.Reason,
  });

  if (!validation.valid) {
    validation.errors.forEach(error => {
      if (error.includes('Reason')) {
        errors.value.Reason = error;
      }
    });
    return;
  }

  submitting.value = true;

  const result = await resignationStore.submitResignation({
    EmployeeId: props.employeeId,
    DepartmentID: props.departmentId,
    Reason: formData.value.Reason,
    ExitDiscussion: formData.value.ExitDiscussion,
  });

  submitting.value = false;

  if (result.success) {
    emit('submitted', result.data);
  } else {
    submitError.value = result.error || 'Failed to submit resignation';
  }
}
</script>

<style scoped>
.resignation-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
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

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.info-box {
  background-color: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-box p {
  margin: 0 0 8px 0;
}

.info-box p:last-child {
  margin-bottom: 0;
}

.notice-info {
  font-size: 14px;
  color: #666;
}

.error-box {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
