<template>
  <div class="nominee-form-container">
    <div class="form-header">
      <h3>Nominee Information</h3>
      <div class="percentage-tracker">
        <span>Total Allocated: </span>
        <span class="percentage-value" :class="percentageClass">
          {{ totalAllocatedPercentage }}%
        </span>
        <span class="percentage-status">/ 100%</span>
      </div>
    </div>

    <!-- Existing Nominees List -->
    <div v-if="existingNominees.length > 0" class="nominees-list">
      <div 
        v-for="nominee in existingNominees" 
        :key="nominee.id"
        class="nominee-card"
      >
        <div class="nominee-info">
          <div class="nominee-name">
            {{ nominee.nominee_name }}
            <span class="badge-type">{{ getNomineeTypeName(nominee.nominee_type) }}</span>
            <span v-if="nominee.is_nominee_minor" class="badge-minor">Minor</span>
          </div>
          <div class="nominee-details">
            <span><strong>Relationship:</strong> {{ nominee.relationship_name || 'N/A' }}</span>
            <span><strong>Contact:</strong> {{ nominee.contact_no || 'N/A' }}</span>
            <span><strong>DOB:</strong> {{ formatDate(nominee.dob) || 'N/A' }}</span>
            <span><strong>Percentage:</strong> {{ nominee.percentage }}%</span>
          </div>
          <div v-if="nominee.address" class="nominee-address">
            <strong>Address:</strong> {{ nominee.address }}
          </div>
        </div>
        <div class="nominee-actions">
          <button 
            @click="editNominee(nominee)" 
            class="btn-action btn-edit"
            type="button"
          >
            Edit
          </button>
          <button 
            @click="deleteNominee(nominee.id!)" 
            class="btn-action btn-delete"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div class="nominee-form" v-if="showForm">
      <div class="form-title">
        <h4>{{ editingNomineeId ? 'Edit Nominee' : 'Add New Nominee' }}</h4>
        <button @click="cancelForm" class="btn-close" type="button">×</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Nominee Name</label>
            <input 
              v-model="formData.nominee_name" 
              type="text" 
              class="form-control"
              :class="{ 'error': errors.nominee_name }"
              placeholder="Enter Nominee Name"
              required
            />
            <span v-if="errors.nominee_name" class="error-message">{{ errors.nominee_name }}</span>
          </div>

          <div class="form-group">
            <label class="required">Relationship</label>
            <select 
              v-model="formData.relationship_id" 
              class="form-control"
              :class="{ 'error': errors.relationship_id }"
              required
            >
              <option :value="null">Select Relationship</option>
              <option 
                v-for="relationship in employeeStore.relationships" 
                :key="relationship.id"
                :value="relationship.id"
              >
                {{ relationship.relationship_name }}
              </option>
            </select>
            <span v-if="errors.relationship_id" class="error-message">{{ errors.relationship_id }}</span>
          </div>

          <div class="form-group">
            <label>Date of Birth</label>
            <input 
              v-model="formData.dob" 
              type="date" 
              class="form-control"
              @change="checkIfMinor"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Contact Number</label>
            <input 
              v-model="formData.contact_no" 
              type="tel" 
              class="form-control"
              placeholder="Enter Contact Number"
              maxlength="10"
            />
          </div>

          <div class="form-group">
            <label class="required">Nominee Type</label>
            <select 
              v-model="formData.nominee_type" 
              class="form-control"
              required
            >
              <option :value="null">Select Type</option>
              <option :value="1">Insurance</option>
              <option :value="2">PF</option>
              <option :value="3">Gratuity</option>
              <option :value="4">All</option>
            </select>
          </div>

          <div class="form-group">
            <label class="required">Percentage</label>
            <div class="percentage-input-group">
              <input 
                v-model.number="formData.percentage" 
                type="number" 
                class="form-control"
                :class="{ 'error': errors.percentage }"
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                @input="validatePercentage"
                required
              />
              <span class="percentage-symbol">%</span>
            </div>
            <span v-if="errors.percentage" class="error-message">{{ errors.percentage }}</span>
            <small v-if="remainingPercentage > 0" class="help-text">
              Remaining: {{ remainingPercentage }}%
            </small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Address</label>
            <textarea 
              v-model="formData.address" 
              class="form-control"
              rows="3"
              placeholder="Enter Complete Address"
            ></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                v-model="formData.is_nominee_minor" 
                type="checkbox" 
                :true-value="true"
                :false-value="false"
              />
              <span>Nominee is a Minor</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : (editingNomineeId ? 'Update Nominee' : 'Add Nominee') }}
          </button>
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Add Button (when form is hidden) -->
    <div v-if="!showForm" class="add-nominee-section">
      <button 
        @click="showAddForm" 
        class="btn btn-add" 
        type="button"
        :disabled="totalAllocatedPercentage >= 100"
      >
        + Add Nominee
      </button>
      <small v-if="totalAllocatedPercentage >= 100" class="warning-text">
        Cannot add more nominees. Total percentage allocated is 100%.
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Nominee } from '@/types/employee';

interface Props {
  employeeId: number;
}

const props = defineProps<Props>();

const employeeStore = useEmployeeStore();
const existingNominees = ref<Nominee[]>([]);
const showForm = ref(false);
const saving = ref(false);
const editingNomineeId = ref<number | null>(null);

const formData = reactive<Partial<Nominee>>({
  employee_id: props.employeeId,
  nominee_name: '',
  relationship_id: null,
  dob: '',
  contact_no: '',
  address: '',
  percentage: 0,
  nominee_type: null,
  is_nominee_minor: false
});

const errors = reactive<Record<string, string>>({});

const totalAllocatedPercentage = computed(() => {
  const existingTotal = existingNominees.value
    .filter(n => editingNomineeId.value ? n.id !== editingNomineeId.value : true)
    .reduce((sum, nominee) => sum + (nominee.percentage || 0), 0);
  return Number(existingTotal.toFixed(2));
});

const remainingPercentage = computed(() => {
  const remaining = 100 - totalAllocatedPercentage.value - (formData.percentage || 0);
  return Number(remaining.toFixed(2));
});

const percentageClass = computed(() => {
  if (totalAllocatedPercentage.value === 100) return 'complete';
  if (totalAllocatedPercentage.value > 100) return 'exceeded';
  return 'incomplete';
});

onMounted(async () => {
  await Promise.all([
    loadNominees(),
    employeeStore.loadRelationships()
  ]);
});

async function loadNominees() {
  try {
    const response = await employeeStore.fetchNominees(props.employeeId);
    existingNominees.value = response;
  } catch (error) {
    console.error('Failed to load nominees:', error);
  }
}

function getNomineeTypeName(type?: number): string {
  const types: Record<number, string> = {
    1: 'Insurance',
    2: 'PF',
    3: 'Gratuity',
    4: 'All'
  };
  return type ? types[type] : 'N/A';
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function checkIfMinor() {
  if (formData.dob) {
    const birthDate = new Date(formData.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      formData.is_nominee_minor = (age - 1) < 18;
    } else {
      formData.is_nominee_minor = age < 18;
    }
  }
}

async function validatePercentage() {
  delete errors.percentage;
  
  if (!formData.percentage || formData.percentage < 0) {
    errors.percentage = 'Percentage must be greater than 0';
    return;
  }
  
  if (formData.percentage > 100) {
    errors.percentage = 'Percentage cannot exceed 100%';
    return;
  }
  
  // Check total percentage
  try {
    const response = await employeeStore.verifyNomineePercentage(
      props.employeeId,
      formData.percentage,
      editingNomineeId.value || undefined
    );
    
    if (!response.is_valid) {
      errors.percentage = response.message || 'Total percentage exceeds 100%';
    }
  } catch (error: any) {
    console.error('Failed to validate percentage:', error);
  }
}

function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (!formData.nominee_name?.trim()) {
    errors.nominee_name = 'Nominee name is required';
  }
  
  if (!formData.relationship_id) {
    errors.relationship_id = 'Relationship is required';
  }
  
  if (!formData.percentage || formData.percentage <= 0) {
    errors.percentage = 'Percentage must be greater than 0';
  } else if (formData.percentage > 100) {
    errors.percentage = 'Percentage cannot exceed 100%';
  }
  
  const totalWithCurrent = totalAllocatedPercentage.value + (formData.percentage || 0);
  if (totalWithCurrent > 100) {
    errors.percentage = `Total percentage would be ${totalWithCurrent}%, exceeding 100%`;
  }
  
  return Object.keys(errors).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  saving.value = true;
  try {
    if (editingNomineeId.value) {
      await employeeStore.updateNominee(editingNomineeId.value, formData);
    } else {
      await employeeStore.createNominee(formData);
    }
    
    await loadNominees();
    resetForm();
  } catch (error: any) {
    console.error('Failed to save nominee:', error);
    alert(error.message || 'Failed to save nominee');
  } finally {
    saving.value = false;
  }
}

function showAddForm() {
  showForm.value = true;
  editingNomineeId.value = null;
  resetFormData();
}

function editNominee(nominee: Nominee) {
  showForm.value = true;
  editingNomineeId.value = nominee.id!;
  Object.assign(formData, {
    employee_id: nominee.employee_id,
    nominee_name: nominee.nominee_name,
    relationship_id: nominee.relationship_id,
    dob: nominee.dob,
    contact_no: nominee.contact_no,
    address: nominee.address,
    percentage: nominee.percentage,
    nominee_type: nominee.nominee_type,
    is_nominee_minor: nominee.is_nominee_minor
  });
}

async function deleteNominee(nomineeId: number) {
  if (confirm('Are you sure you want to delete this nominee?')) {
    try {
      await employeeStore.deleteNominee(nomineeId);
      await loadNominees();
    } catch (error: any) {
      alert(error.message || 'Failed to delete nominee');
    }
  }
}

function cancelForm() {
  resetForm();
}

function resetForm() {
  showForm.value = false;
  editingNomineeId.value = null;
  resetFormData();
  Object.keys(errors).forEach(key => delete errors[key]);
}

function resetFormData() {
  formData.nominee_name = '';
  formData.relationship_id = null;
  formData.dob = '';
  formData.contact_no = '';
  formData.address = '';
  formData.percentage = 0;
  formData.nominee_type = null;
  formData.is_nominee_minor = false;
}
</script>

<style scoped>
.nominee-form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.percentage-tracker {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
}

.percentage-value {
  font-size: 18px;
  font-weight: 700;
}

.percentage-value.complete {
  color: #4caf50;
}

.percentage-value.incomplete {
  color: #ff9800;
}

.percentage-value.exceeded {
  color: #f44336;
}

.percentage-status {
  color: #999;
}

.nominees-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.nominee-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s;
}

.nominee-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nominee-info {
  flex: 1;
}

.nominee-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-type {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: #2196f3;
  padding: 2px 8px;
  border-radius: 10px;
}

.badge-minor {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: #ff9800;
  padding: 2px 8px;
  border-radius: 10px;
}

.nominee-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.nominee-address {
  font-size: 13px;
  color: #666;
  margin-top: 5px;
}

.nominee-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #2196f3;
  color: #fff;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: #fff;
}

.btn-delete:hover {
  background: #d32f2f;
}

.nominee-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.form-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.btn-close {
  width: 30px;
  height: 30px;
  border: none;
  background: #f44336;
  color: #fff;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #d32f2f;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group label.required::after {
  content: ' *';
  color: #f44336;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
}

.form-control.error {
  border-color: #f44336;
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  font-size: 12px;
  color: #f44336;
}

.percentage-input-group {
  position: relative;
}

.percentage-input-group .form-control {
  padding-right: 35px;
}

.percentage-symbol {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: #666;
  pointer-events: none;
}

.help-text {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
}

.checkbox-group {
  gap: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 400;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-outline {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.add-nominee-section {
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn-add {
  padding: 12px 30px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover:not(:disabled) {
  background: #1565c0;
}

.btn-add:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.warning-text {
  font-size: 13px;
  color: #f44336;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .nominee-card {
    flex-direction: column;
    gap: 15px;
  }
  
  .nominee-details {
    grid-template-columns: 1fr;
  }
  
  .nominee-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
