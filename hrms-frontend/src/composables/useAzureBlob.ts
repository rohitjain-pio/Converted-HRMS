import { ref } from 'vue';
import { azureBlobService } from './azure-blob.service';

/**
 * Composable for Azure Blob Storage operations
 */
export function useAzureBlob() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);

  /**
   * Upload a single file
   */
  const uploadFile = async (file: File, folder: string = '') => {
    isUploading.value = true;
    error.value = null;
    uploadProgress.value = 0;

    try {
      const url = await azureBlobService.uploadFile(file, folder);
      uploadProgress.value = 100;
      return url;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed';
      throw err;
    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Upload multiple files
   */
  const uploadFiles = async (files: File[], folder: string = '') => {
    isUploading.value = true;
    error.value = null;
    uploadProgress.value = 0;

    try {
      const urls = await azureBlobService.uploadFiles(files, folder);
      uploadProgress.value = 100;
      return urls;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed';
      throw err;
    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Download a file
   */
  const downloadFile = async (blobName: string, fileName?: string) => {
    error.value = null;

    try {
      const blob = await azureBlobService.downloadFile(blobName);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || blobName.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Download failed';
      throw err;
    }
  };

  /**
   * Delete a file
   */
  const deleteFile = async (blobName: string) => {
    error.value = null;

    try {
      await azureBlobService.deleteFile(blobName);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Delete failed';
      throw err;
    }
  };

  /**
   * List files in a folder
   */
  const listFiles = async (prefix: string = '') => {
    error.value = null;

    try {
      return await azureBlobService.listFiles(prefix);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to list files';
      throw err;
    }
  };

  /**
   * Get file URL
   */
  const getFileUrl = (blobName: string) => {
    return azureBlobService.getFileUrl(blobName);
  };

  /**
   * Extract blob name from URL
   */
  const extractBlobName = (url: string) => {
    return azureBlobService.extractBlobName(url);
  };

  return {
    isUploading,
    uploadProgress,
    error,
    uploadFile,
    uploadFiles,
    downloadFile,
    deleteFile,
    listFiles,
    getFileUrl,
    extractBlobName,
  };
}
