<template>
  <v-card>
    <v-card-title>Azure Blob Storage Demo</v-card-title>
    <v-card-text>
      <v-file-input
        v-model="selectedFiles"
        label="Select files to upload"
        multiple
        prepend-icon="mdi-paperclip"
        show-size
        :disabled="isUploading"
      />

      <v-progress-linear
        v-if="isUploading"
        :model-value="uploadProgress"
        color="primary"
        height="25"
      >
        <template #default="{ value }">
          <strong>{{ Math.ceil(value) }}%</strong>
        </template>
      </v-progress-linear>

      <v-alert
        v-if="error"
        type="error"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <v-alert
        v-if="successMessage"
        type="success"
        closable
        @click:close="successMessage = null"
      >
        {{ successMessage }}
      </v-alert>

      <v-btn
        color="primary"
        :disabled="!selectedFiles?.length || isUploading"
        @click="handleUpload"
      >
        <v-icon left>mdi-upload</v-icon>
        Upload Files
      </v-btn>

      <v-divider class="my-4" />

      <h3>Uploaded Files</h3>
      <v-list>
        <v-list-item
          v-for="file in uploadedFiles"
          :key="file.name"
        >
          <template #prepend>
            <v-icon>mdi-file</v-icon>
          </template>
          <v-list-item-title>{{ file.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ formatBytes(file.size) }} - {{ formatDate(file.lastModified) }}
          </v-list-item-subtitle>
          <template #append>
            <v-btn
              icon="mdi-download"
              size="small"
              @click="handleDownload(file.name)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              @click="handleDelete(file.name)"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAzureBlob } from '@/composables/useAzureBlob';

const {
  uploadFiles,
  downloadFile,
  deleteFile,
  listFiles,
  isUploading,
  uploadProgress,
  error,
} = useAzureBlob();

const selectedFiles = ref<File[]>([]);
const uploadedFiles = ref<Array<{ name: string; url: string; size: number; lastModified: Date }>>([]);
const successMessage = ref<string | null>(null);

const handleUpload = async () => {
  if (!selectedFiles.value?.length) return;

  try {
    await uploadFiles(selectedFiles.value, 'demo');
    successMessage.value = `Successfully uploaded ${selectedFiles.value.length} file(s)`;
    selectedFiles.value = [];
    await loadFiles();
  } catch (err) {
    console.error('Upload error:', err);
  }
};

const handleDownload = async (blobName: string) => {
  try {
    await downloadFile(blobName);
  } catch (err) {
    console.error('Download error:', err);
  }
};

const handleDelete = async (blobName: string) => {
  if (!confirm('Are you sure you want to delete this file?')) return;

  try {
    await deleteFile(blobName);
    successMessage.value = 'File deleted successfully';
    await loadFiles();
  } catch (err) {
    console.error('Delete error:', err);
  }
};

const loadFiles = async () => {
  try {
    uploadedFiles.value = await listFiles('demo/');
  } catch (err) {
    console.error('List error:', err);
  }
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  loadFiles();
});
</script>
