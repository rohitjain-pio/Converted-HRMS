<template>
  <div class="certificate-form-container">
    <div class="form-header">
      <h3>Professional Certificates</h3>
      <span v-if="existingCertificates.length > 0" class="certificate-count">
        {{ existingCertificates.length }} Certificate(s) Added
      </span>
    </div>

    <!-- Existing Certificates List -->
    <div v-if="existingCertificates.length > 0" class="certificates-list">
      <div 
        v-for="certificate in existingCertificates" 
        :key="certificate.id"
        class="certificate-card"
        :class="{ 'expiring-soon': isExpiringSoon(certificate.certificate_expiry), 'expired': isExpired(certificate.certificate_expiry) }"
      >
        <div class="certificate-info">
          <div class="certificate-name">
            {{ certificate.certificate_name }}
            <span v-if="isExpired(certificate.certificate_expiry)" class="badge-expired">Expired</span>
            <span v-else-if="isExpiringSoon(certificate.certificate_expiry)" class="badge-expiring">Expiring Soon</span>
            <span v-else-if="certificate.certificate_expiry" class="badge-valid">Valid</span>
          </div>
          <div class="certificate-details">
            <span v-if="certificate.certificate_expiry">
              <strong>Expiry Date:</strong> {{ formatDate(certificate.certificate_expiry) }}
              <span v-if="!isExpired(certificate.certificate_expiry)" class="days-remaining">
                ({{ getDaysUntilExpiry(certificate.certificate_expiry) }} days remaining)
              </span>
            </span>
          </div>
          <div v-if="certificate.document_url" class="certificate-document">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
            </svg>
            <a :href="certificate.document_url" target="_blank" class="document-link">
              View Certificate
            </a>
          </div>
        </div>
        <div class="certificate-actions">
          <button 
            @click="deleteCertificate(certificate.id!)" 
            class="btn-action btn-delete"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add Form -->
    <div class="certificate-form" v-if="showForm">
      <div class="form-title">
        <h4>Add New Certificate</h4>
        <button @click="cancelForm" class="btn-close" type="button">×</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Certificate Name</label>
            <input 
              v-model="formData.certificate_name" 
              type="text" 
              class="form-control"
              :class="{ 'error': errors.certificate_name }"
              placeholder="e.g., AWS Certified Solutions Architect"
              required
            />
            <span v-if="errors.certificate_name" class="error-message">{{ errors.certificate_name }}</span>
          </div>

          <div class="form-group">
            <label>Expiry Date</label>
            <input 
              v-model="formData.certificate_expiry" 
              type="date" 
              class="form-control"
              :min="today"
            />
            <small class="help-text">Leave blank if certificate doesn't expire</small>
          </div>

          <div class="form-group">
            <label class="required">Certificate Document</label>
            <div class="file-input-wrapper">
              <input 
                type="file" 
                ref="fileInput"
                class="form-control file-input"
                :class="{ 'error': errors.file }"
                @change="handleFileSelect"
                accept=".pdf,.jpg,.jpeg,.png"
                required
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
            <small class="help-text">PDF, JPG, PNG (Max 10MB)</small>
            <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
            <span v-if="errors.file" class="error-message">{{ errors.file }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving || uploading">
            {{ saving || uploading ? 'Uploading...' : 'Add Certificate' }}
          </button>
          <button type="button" @click="cancelForm" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Add Button (when form is hidden) -->
    <div v-if="!showForm" class="add-certificate-section">
      <button @click="showAddForm" class="btn btn-add" type="button">
        + Add Certificate
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { Certificate } from '@/types/employee';

interface Props {
  employeeId: number;
}

const props = defineProps<Props>();

const employeeStore = useEmployeeStore();
const existingCertificates = ref<Certificate[]>([]);
const showForm = ref(false);
const saving = ref(false);
const uploading = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const today = computed(() => {
  const date = new Date();
  return date.toISOString().split('T')[0];
});

const formData = reactive<Partial<Certificate>>({
  employee_id: props.employeeId,
  certificate_name: '',
  certificate_expiry: ''
});

const errors = reactive<Record<string, string>>({});

onMounted(async () => {
  await loadCertificates();
});

async function loadCertificates() {
  try {
    const response = await employeeStore.fetchCertificates(props.employeeId);
    existingCertificates.value = response;
  } catch (error) {
    console.error('Failed to load certificates:', error);
  }
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

function isExpired(dateString?: string): boolean {
  if (!dateString) return false;
  const expiryDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiryDate < today;
}

function isExpiringSoon(dateString?: string): boolean {
  if (!dateString || isExpired(dateString)) return false;
  const expiryDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  return expiryDate <= thirtyDaysFromNow;
}

function getDaysUntilExpiry(dateString?: string): number {
  if (!dateString) return 0;
  const expiryDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
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
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      errors.file = 'Invalid file type. Allowed: PDF, JPG, PNG';
      target.value = '';
      return;
    }
    
    selectedFile.value = file;
    delete errors.file;
  }
}

function clearFile() {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (!formData.certificate_name?.trim()) {
    errors.certificate_name = 'Certificate name is required';
  }
  
  if (!selectedFile.value) {
    errors.file = 'Certificate document is required';
  }
  
  return Object.keys(errors).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  saving.value = true;
  uploading.value = true;
  
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('employee_id', String(props.employeeId));
    formDataToSend.append('certificate_name', formData.certificate_name!);
    
    if (formData.certificate_expiry) {
      formDataToSend.append('certificate_expiry', formData.certificate_expiry);
    }
    
    if (selectedFile.value) {
      formDataToSend.append('file', selectedFile.value);
    }
    
    await employeeStore.createCertificate(formDataToSend);
    
    await loadCertificates();
    resetForm();
  } catch (error: any) {
    console.error('Failed to save certificate:', error);
    alert(error.message || 'Failed to save certificate');
  } finally {
    saving.value = false;
    uploading.value = false;
  }
}

function showAddForm() {
  showForm.value = true;
  resetFormData();
}

async function deleteCertificate(certificateId: number) {
  if (confirm('Are you sure you want to delete this certificate?')) {
    try {
      await employeeStore.deleteCertificate(certificateId);
      await loadCertificates();
    } catch (error: any) {
      alert(error.message || 'Failed to delete certificate');
    }
  }
}

function cancelForm() {
  resetForm();
}

function resetForm() {
  showForm.value = false;
  resetFormData();
  clearFile();
  Object.keys(errors).forEach(key => delete errors[key]);
}

function resetFormData() {
  formData.certificate_name = '';
  formData.certificate_expiry = '';
}
</script>

<style scoped>
.certificate-form-container {
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

.certificate-count {
  font-size: 14px;
  color: #666;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 12px;
}

.certificates-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.certificate-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s;
}

.certificate-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.certificate-card.expiring-soon {
  border-color: #ff9800;
  background: #fff3e0;
}

.certificate-card.expired {
  border-color: #f44336;
  background: #ffebee;
}

.certificate-info {
  flex: 1;
}

.certificate-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-valid {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: #4caf50;
  padding: 3px 10px;
  border-radius: 12px;
}

.badge-expiring {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: #ff9800;
  padding: 3px 10px;
  border-radius: 12px;
}

.badge-expired {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: #f44336;
  padding: 3px 10px;
  border-radius: 12px;
}

.certificate-details {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.days-remaining {
  font-size: 13px;
  color: #ff9800;
  font-weight: 500;
}

.certificate-document {
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

.certificate-actions {
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

.btn-delete {
  background: #f44336;
  color: #fff;
}

.btn-delete:hover {
  background: #d32f2f;
}

.certificate-form {
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

.add-certificate-section {
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
  
  .certificate-card {
    flex-direction: column;
    gap: 15px;
  }
  
  .certificate-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
