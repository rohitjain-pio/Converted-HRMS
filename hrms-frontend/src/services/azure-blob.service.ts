import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Azure Blob Storage Service
 * Handles file uploads and downloads to Azure Blob Storage
 */
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT || 'hrmsteststorage77';
    const accountKey = import.meta.env.VITE_AZURE_STORAGE_KEY;
    this.containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER || 'hrms-documents';

    if (accountKey) {
      // Use account key authentication
      const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else {
      // Use DefaultAzureCredential for production
      const blobServiceUrl = `https://${accountName}.blob.core.windows.net`;
      const credential = new DefaultAzureCredential();
      this.blobServiceClient = new BlobServiceClient(blobServiceUrl, credential);
    }
  }

  /**
   * Upload a file to Azure Blob Storage
   */
  async uploadFile(file: File, folder: string = ''): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob',
      });

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = folder 
        ? `${folder}/${timestamp}-${file.name}`
        : `${timestamp}-${file.name}`;

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      // Upload file
      await blockBlobClient.uploadData(await file.arrayBuffer(), {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure:', error);
      throw new Error('Failed to upload file to Azure Blob Storage');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], folder: string = ''): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Download a file from Azure Blob Storage
   */
  async downloadFile(blobName: string): Promise<Blob> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadResponse = await blockBlobClient.download();
      if (!downloadResponse.blobBody) {
        throw new Error('No blob body in response');
      }
      
      return await downloadResponse.blobBody;
    } catch (error) {
      console.error('Error downloading file from Azure:', error);
      throw new Error('Failed to download file from Azure Blob Storage');
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   */
  async deleteFile(blobName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      await blockBlobClient.delete();
    } catch (error) {
      console.error('Error deleting file from Azure:', error);
      throw new Error('Failed to delete file from Azure Blob Storage');
    }
  }

  /**
   * List files in a container or folder
   */
  async listFiles(prefix: string = ''): Promise<Array<{ name: string; url: string; size: number; lastModified: Date }>> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const files: Array<{ name: string; url: string; size: number; lastModified: Date }> = [];

      const options = prefix ? { prefix } : {};
      
      for await (const blob of containerClient.listBlobsFlat(options)) {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        files.push({
          name: blob.name,
          url: blockBlobClient.url,
          size: blob.properties.contentLength || 0,
          lastModified: blob.properties.lastModified || new Date(),
        });
      }

      return files;
    } catch (error) {
      console.error('Error listing files from Azure:', error);
      throw new Error('Failed to list files from Azure Blob Storage');
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(blobName: string): string {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  /**
   * Extract blob name from URL
   */
  extractBlobName(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Remove empty parts and container name
    return pathParts.slice(2).join('/');
  }
}

export const azureBlobService = new AzureBlobService();
