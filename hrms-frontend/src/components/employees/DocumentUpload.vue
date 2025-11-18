<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import type { UserDocument, DocumentType } from '@/types/employee';

interface Props {
  employeeId: number;
}

const props = defineProps<Props>();
const employeeStore = useEmployeeStore();

const documents = ref<UserDocument[]>([]);
const documentTypes = ref<DocumentType[]>([]);
const loading = ref(false);
const uploadingDialogOpen = ref(false);

// Upload form
const uploadForm = ref({
  document_type_id: null as number | null,
  document_no: '',
  document_expiry: '',
  file: null as File | null,
});

const selectedFile = ref<File | null>(null);
const uploadProgress = ref(0);
const uploading = ref(false);

const documentTypeOptions = computed(() => {
  return documentTypes.value.map(dt => ({
    value: dt.id,
    label: dt.document_name,
    category: getCategoryName(dt.id_proof_for)
  }));
});

const getCategoryName = (idProofFor: number) => {
  const categories: Record<number, string> = {
    1: 'Identity Proof',
    2: 'Address Proof',
    3: 'Educational',
    4: 'Experience',
    5: 'Other'
  };
  return categories[idProofFor] || 'Other';
};

const groupedDocumentTypes = computed(() => {
  const groups: Record<string, typeof documentTypeOptions.value> = {};
  documentTypeOptions.value.forEach(option => {
    if (!groups[option.category]) {
      groups[option.category] = [];
    }
    groups[option.category].push(option);
  });
  return groups;
});

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    await employeeStore.loadDocumentTypes();
    documentTypes.value = employeeStore.documentTypes;
    documents.value = await employeeStore.fetchDocuments(props.employeeId);
  } finally {
    loading.value = false;
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    uploadForm.value.file = target.files[0];
  }
};

const openUploadDialog = () => {
  uploadingDialogOpen.value = true;
  resetUploadForm();
};

const closeUploadDialog = () => {
  uploadingDialogOpen.value = false;
  resetUploadForm();
};

const resetUploadForm = () => {
  uploadForm.value = {
    document_type_id: null,
    document_no: '',
    document_expiry: '',
    file: null,
  };
  selectedFile.value = null;
  uploadProgress.value = 0;
};

const uploadDocument = async () => {
  if (!uploadForm.value.file || !uploadForm.value.document_type_id) {
    alert('Please select document type and file');
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append('employee_id', props.employeeId.toString());
    formData.append('document_type_id', uploadForm.value.document_type_id.toString());
    formData.append('file', uploadForm.value.file);
    
    if (uploadForm.value.document_no) {
      formData.append('document_no', uploadForm.value.document_no);
    }
    if (uploadForm.value.document_expiry) {
      formData.append('document_expiry', uploadForm.value.document_expiry);
    }

    // Simulate progress (in real app, use axios upload progress)
    const interval = setInterval(() => {
      uploadProgress.value = Math.min(uploadProgress.value + 10, 90);
    }, 200);

    await employeeStore.uploadDocument(formData);
    
    clearInterval(interval);
    uploadProgress.value = 100;

    // Reload documents
    await loadData();
    
    closeUploadDialog();
    alert('Document uploaded successfully');
  } catch (error: any) {
    alert('Failed to upload document: ' + (error.message || 'Unknown error'));
  } finally {
    uploading.value = false;
  }
};

const deleteDocument = async (id: number) => {
  if (!confirm('Are you sure you want to delete this document?')) {
    return;
  }

  try {
    await employeeStore.deleteDocument(id);
    documents.value = documents.value.filter(doc => doc.id !== id);
    alert('Document deleted successfully');
  } catch (error: any) {
    alert('Failed to delete document: ' + (error.message || 'Unknown error'));
  }
};

const downloadDocument = async (id: number, fileName: string) => {
  try {
    const response = await employeeStore.downloadDocument(id);
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    alert('Failed to download document: ' + (error.message || 'Unknown error'));
  }
};

const viewDocument = (location: string) => {
  window.open(location, '_blank');
};

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
};

const isExpiringSoon = (expiryDate: string | undefined) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
};

const isExpired = (expiryDate: string | undefined) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};
</script>

<template>
  <div class="document-upload-section">
    <div class="section-header">
      <h2>Documents</h2>
      <button class="btn btn-primary" @click="openUploadDialog">
        <span class="icon">📎</span>
        Upload Document
      </button>
    </div>

    <div v-if="loading" class="loading">Loading documents...</div>

    <div v-else class="documents-grid">
      <div 
        v-for="doc in documents" 
        :key="doc.id"
        class="document-card"
        :class="{
          'expiring-soon': isExpiringSoon(doc.document_expiry),
          'expired': isExpired(doc.document_expiry)
        }"
      >
        <div class="document-header">
          <h3>{{ doc.document_type }}</h3>
          <button class="btn-icon-delete" @click="deleteDocument(doc.id!)" title="Delete">
            🗑️
          </button>
        </div>

        <div class="document-details">
          <div class="detail-row">
            <span class="label">Document No:</span>
            <span class="value">{{ doc.document_no || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Expiry Date:</span>
            <span class="value">{{ formatDate(doc.document_expiry) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">File:</span>
            <span class="value file-name">{{ doc.file_original_name }}</span>
          </div>
        </div>

        <div class="document-actions">
          <button 
            v-if="doc.location" 
            class="btn btn-secondary" 
            @click="viewDocument(doc.location)"
          >
            View
          </button>
          <button 
            v-if="doc.file_name" 
            class="btn btn-secondary" 
            @click="downloadDocument(doc.id!, doc.file_original_name!)"
          >
            Download
          </button>
        </div>

        <div v-if="isExpired(doc.document_expiry)" class="expiry-badge expired-badge">
          Expired
        </div>
        <div v-else-if="isExpiringSoon(doc.document_expiry)" class="expiry-badge warning-badge">
          Expiring Soon
        </div>
      </div>

      <div v-if="documents.length === 0" class="no-documents">
        <p>No documents uploaded yet</p>
        <button class="btn btn-primary" @click="openUploadDialog">
          Upload Your First Document
        </button>
      </div>
    </div>

    <!-- Upload Dialog -->
    <div v-if="uploadingDialogOpen" class="modal-overlay" @click="closeUploadDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Upload Document</h2>
          <button class="modal-close" @click="closeUploadDialog">×</button>
        </div>

        <form @submit.prevent="uploadDocument" class="upload-form">
          <div class="form-group">
            <label class="form-label">Document Type *</label>
            <select v-model="uploadForm.document_type_id" class="form-select" required>
              <option :value="null" disabled>Select document type</option>
              <optgroup 
                v-for="(types, category) in groupedDocumentTypes" 
                :key="category"
                :label="category"
              >
                <option v-for="type in types" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Document Number</label>
            <input 
              v-model="uploadForm.document_no" 
              type="text" 
              class="form-input"
              placeholder="e.g., PAN: ABCDE1234F"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Expiry Date</label>
            <input 
              v-model="uploadForm.document_expiry" 
              type="date" 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">File *</label>
            <input 
              type="file" 
              class="form-file-input" 
              @change="handleFileSelect"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              required
            />
            <small class="form-help">Max file size: 10MB. Formats: PDF, JPG, PNG, DOC, DOCX</small>
          </div>

          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span>Uploading... {{ uploadProgress }}%</span>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeUploadDialog" :disabled="uploading">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-upload-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  transition: box-shadow 0.2s;
}

.document-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.document-card.expiring-soon {
  border-color: #ff9800;
}

.document-card.expired {
  border-color: #f44336;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.document-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.document-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row .label {
  font-size: 13px;
  color: #666;
}

.detail-row .value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.file-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.expiry-badge {
  position: absolute;
  top: 12px;
  right: 40px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.warning-badge {
  background-color: #fff3e0;
  color: #ef6c00;
}

.expired-badge {
  background-color: #ffebee;
  color: #c62828;
}

.no-documents {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #eeeeee;
}

.btn-icon-delete {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-icon-delete:hover {
  background-color: #ffebee;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.upload-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1976d2;
}

.form-file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.form-help {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.upload-progress {
  margin-bottom: 20px;
}

.progress-bar {
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #1976d2;
  transition: width 0.3s;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
