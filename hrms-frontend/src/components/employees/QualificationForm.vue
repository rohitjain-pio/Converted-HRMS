<template>
  <div class="qualification-form-container">
    <div class="form-header">
      <h3>Educational Qualifications</h3>
      <span v-if="existingQualifications.length > 0" class="qualification-count">
        {{ existingQualifications.length }} Qualification(s) Added
      </span>
    </div>

    <!-- Existing Qualifications List -->
    <div v-if="existingQualifications.length > 0" class="qualifications-list">
      <div 
        v-for="qualification in existingQualifications" 
        :key="qualification.id"
        class="qualification-card"
      >
        <div class="qualification-info">
          <div class="qualification-name">
            {{ qualification.qualification_name }}
            <span v-if="qualification.degree_name" class="degree-badge">{{ qualification.degree_name }}</span>
          </div>
          <div class="qualification-details">
            <span v-if="qualification.university_name">
              <strong>University:</strong> {{ qualification.university_name }}
            </span>
            <span v-if="qualification.college_name">
              <strong>College:</strong> {{ qualification.college_name }}
            </span>
            <span v-if="qualification.year_from && qualification.year_to">
              <strong>Duration:</strong> {{ qualification.year_from }} - {{ qualification.year_to }}
            </span>
            <span v-if="qualification.aggregate_percentage">
              <strong>Percentage:</strong> {{ qualification.aggregate_percentage }}%
            </span>
          </div>
          <div v-if="qualification.document_url" class="qualification-document">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
            </svg>
            <a :href="qualification.document_url" target="_blank" class="document-link">
              View Document
            </a>
          </div>
        </div>
        <div class="qualification-actions">
          <button 
            @click="editQualification(qualification)" 
            class="btn-action btn-edit"
            type="button"
          >
            Edit
          </button>
          <button 
            @click="deleteQualification(qualification.id!)" 
            class="btn-action btn-delete"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div class="qualification-form" v-if="showForm">
      <div class="form-title">
        <h4>{{ editingQualificationId ? 'Edit Qualification' : 'Add New Qualification' }}</h4>
        <button @click="cancelForm" class="btn-close" type="button">×</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Qualification</label>
            <select 
              v-model="formData.qualification_id" 
              class="form-control"
              :class="{ 'error': errors.qualification_id }"
              required
            >
              <option :value="null">Select Qualification</option>
              <option 
                v-for="qual in employeeStore.qualifications" 
                :key="qual.id"
                :value="qual.id"
              >
                {{ qual.qualification_name }}
              </option>
            </select>
            <span v-if="errors.qualification_id" class="error-message">{{ errors.qualification_id }}</span>
          </div>

          <div class="form-group">
            <label>University</label>
            <select 
              v-model="formData.university_id" 
              class="form-control"
            >
              <option :value="null">Select University</option>
              <option 
                v-for="university in employeeStore.universities" 
                :key="university.id"
                :value="university.id"
              >
                {{ university.university_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Degree Name</label>
            <input 
              v-model="formData.degree_name" 
              type="text" 
              class="form-control"
              placeholder="e.g., B.Tech, MBA, etc."
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>College/Institute Name</label>
            <input 
              v-model="formData.college_name" 
              type="text" 
              class="form-control"
              placeholder="Enter College Name"
            />
          </div>

          <div class="form-group">
            <label>Aggregate Percentage</label>
            <input 
              v-model="formData.aggregate_percentage" 
              type="text" 
              class="form-control"
              placeholder="e.g., 85.5 or 8.5 CGPA"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="required">Year From</label>
            <input 
              v-model.number="formData.year_from" 
              type="number" 
              class="form-control"
              :class="{ 'error': errors.year_from }"
              :min="1950"
              :max="currentYear + 10"
              placeholder="Starting Year"
              @input="validateYears"
              required
            />
            <span v-if="errors.year_from" class="error-message">{{ errors.year_from }}</span>
          </div>

          <div class="form-group">
            <label class="required">Year To</label>
            <input 
              v-model.number="formData.year_to" 
              type="number" 
              class="form-control"
              :class="{ 'error': errors.year_to }"
              :min="formData.year_from || 1950"
              :max="currentYear + 10"
              placeholder="Completion Year"
              @input="validateYears"
              required
            />
            <span v-if="errors.year_to" class="error-message">{{ errors.year_to }}</span>
          </div>

          <div class="form-group">
            <label>Document {{ editingQualificationId && !uploadingNewDocument ? '(Optional)' : '' }}</label>
            <div class="file-input-wrapper">
              <input 
                type="file" 
                ref="fileInput"
                class="form-control file-input"
                @change="handleFileSelect"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <button 
                v-if="selectedFile" 
                @click="clearFile" 
                type="button"
                class="btn-clear-file"
              >
                ×
              </button>
            </div>
            <small class="help-text">PDF, JPG, PNG, DOC, DOCX (Max 10MB)</small>
            <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
            <span v-if="errors.file" class="error-message">{{ errors.file }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving || uploading">
            {{ saving || uploading ? 'Saving...' : (editingQualificationId ? 'Update Qualification' : 'Add Qualification') }}
          </button>
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Add Button (when form is hidden) -->
    <div v-if="!showForm" class="add-qualification-section">
      <button @click="showAddForm" class="btn btn-add" type="button">
        + Add Qualification
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Qualification } from '@/types/employee';

interface Props {
  employeeId: number;
}

const props = defineProps<Props>();

const employeeStore = useEmployeeStore();
const existingQualifications = ref<Qualification[]>([]);
const showForm = ref(false);
const saving = ref(false);
const uploading = ref(false);
const editingQualificationId = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const uploadingNewDocument = ref(false);

const currentYear = new Date().getFullYear();

const formData = reactive<Partial<Qualification>>({
  employee_id: props.employeeId,
  qualification_id: null,
  university_id: null,
  degree_name: '',
  college_name: '',
  aggregate_percentage: '',
  year_from: null,
  year_to: null
});

const errors = reactive<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([
    loadQualifications(),
    employeeStore.loadQualificationMasters(),
    employeeStore.loadUniversities()
  ]);
});

async function loadQualifications() {
  try {
    const response = await employeeStore.fetchQualifications(props.employeeId);
    existingQualifications.value = response;
  } catch (error) {
    console.error('Failed to load qualifications:', error);
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      errors.file = 'File size must not exceed 10MB';
      target.value = '';
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      errors.file = 'Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX';
      target.value = '';
      return;
    }
    
    selectedFile.value = file;
    uploadingNewDocument.value = true;
    delete errors.file;
  }
}

function clearFile() {
  selectedFile.value = null;
  uploadingNewDocument.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function validateYears() {
  delete errors.year_from;
  delete errors.year_to;
  
  if (formData.year_from && formData.year_from < 1950) {
    errors.year_from = 'Year must be 1950 or later';
  }
  
  if (formData.year_from && formData.year_from > currentYear + 10) {
    errors.year_from = `Year cannot exceed ${currentYear + 10}`;
  }
  
  if (formData.year_to && formData.year_to < 1950) {
    errors.year_to = 'Year must be 1950 or later';
  }
  
  if (formData.year_to && formData.year_to > currentYear + 10) {
    errors.year_to = `Year cannot exceed ${currentYear + 10}`;
  }
  
  if (formData.year_from && formData.year_to && formData.year_to < formData.year_from) {
    errors.year_to = 'End year must be after start year';
  }
}

function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (!formData.qualification_id) {
    errors.qualification_id = 'Qualification is required';
  }
  
  if (!formData.year_from) {
    errors.year_from = 'Start year is required';
  }
  
  if (!formData.year_to) {
    errors.year_to = 'End year is required';
  }
  
  validateYears();
  
  return Object.keys(errors).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  saving.value = true;
  uploading.value = !!selectedFile.value;
  
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('employee_id', String(props.employeeId));
    formDataToSend.append('qualification_id', String(formData.qualification_id));
    
    if (formData.university_id) {
      formDataToSend.append('university_id', String(formData.university_id));
    }
    if (formData.degree_name) {
      formDataToSend.append('degree_name', formData.degree_name);
    }
    if (formData.college_name) {
      formDataToSend.append('college_name', formData.college_name);
    }
    if (formData.aggregate_percentage) {
      formDataToSend.append('aggregate_percentage', formData.aggregate_percentage);
    }
    if (formData.year_from) {
      formDataToSend.append('year_from', String(formData.year_from));
    }
    if (formData.year_to) {
      formDataToSend.append('year_to', String(formData.year_to));
    }
    
    if (selectedFile.value) {
      formDataToSend.append('file', selectedFile.value);
    }
    
    if (editingQualificationId.value) {
      await employeeStore.updateQualification(editingQualificationId.value, formDataToSend);
    } else {
      await employeeStore.createQualification(formDataToSend);
    }
    
    await loadQualifications();
    resetForm();
  } catch (error: any) {
    console.error('Failed to save qualification:', error);
    alert(error.message || 'Failed to save qualification');
  } finally {
    saving.value = false;
    uploading.value = false;
  }
}

function showAddForm() {
  showForm.value = true;
  editingQualificationId.value = null;
  uploadingNewDocument.value = false;
  resetFormData();
}

function editQualification(qualification: Qualification) {
  showForm.value = true;
  editingQualificationId.value = qualification.id!;
  uploadingNewDocument.value = false;
  Object.assign(formData, {
    employee_id: qualification.employee_id,
    qualification_id: qualification.qualification_id,
    university_id: qualification.university_id,
    degree_name: qualification.degree_name,
    college_name: qualification.college_name,
    aggregate_percentage: qualification.aggregate_percentage,
    year_from: qualification.year_from,
    year_to: qualification.year_to
  });
}

async function deleteQualification(qualificationId: number) {
  if (confirm('Are you sure you want to delete this qualification?')) {
    try {
      await employeeStore.deleteQualification(qualificationId);
      await loadQualifications();
    } catch (error: any) {
      alert(error.message || 'Failed to delete qualification');
    }
  }
}

function cancelForm() {
  resetForm();
}

function resetForm() {
  showForm.value = false;
  editingQualificationId.value = null;
  uploadingNewDocument.value = false;
  resetFormData();
  clearFile();
  Object.keys(errors).forEach(key => delete errors[key]);
}

function resetFormData() {
  formData.qualification_id = null;
  formData.university_id = null;
  formData.degree_name = '';
  formData.college_name = '';
  formData.aggregate_percentage = '';
  formData.year_from = null;
  formData.year_to = null;
}
</script>

<style scoped>
.qualification-form-container {
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

.qualification-count {
  font-size: 14px;
  color: #666;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 12px;
}

.qualifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.qualification-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s;
}

.qualification-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qualification-info {
  flex: 1;
}

.qualification-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.degree-badge {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: #673ab7;
  padding: 3px 10px;
  border-radius: 12px;
}

.qualification-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.qualification-document {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #1976d2;
  margin-top: 8px;
}

.document-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.document-link:hover {
  text-decoration: underline;
}

.qualification-actions {
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

.qualification-form {
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

.error-message {
  font-size: 12px;
  color: #f44336;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  padding-right: 40px;
}

.btn-clear-file {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: #f44336;
  color: #fff;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.2s;
}

.btn-clear-file:hover {
  background: #d32f2f;
}

.help-text {
  font-size: 11px;
  color: #999;
}

.file-name {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
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

.add-qualification-section {
  text-align: center;
  padding: 20px;
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

.btn-add:hover {
  background: #1565c0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .qualification-card {
    flex-direction: column;
    gap: 15px;
  }
  
  .qualification-details {
    grid-template-columns: 1fr;
  }
  
  .qualification-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
