<?php

namespace App\Services;

use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Blob\Models\CreateBlockBlobOptions;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;
use Illuminate\Support\Facades\Log;

class AzureBlobService
{
    private $blobClient;
    private $connectionString;

    public function __construct()
    {
        $this->connectionString = config('services.azure.storage_connection_string');
        
        if (!empty($this->connectionString)) {
            // Create blob client with custom HTTP client options to disable SSL verification
            $options = [
                'http' => [
                    'verify' => false, // Disable SSL verification for development
                ]
            ];
            $this->blobClient = BlobRestProxy::createBlobService($this->connectionString, $options);
        }
    }

    /**
     * Upload file to Azure Blob Storage
     * Legacy: BlobStorageClient.UploadFile
     */
    public function uploadFile($file, int $userId, string $containerName): ?string
    {
        try {
            if (!$this->blobClient) {
                Log::error('Azure Blob Storage not configured');
                return null;
            }

            $extension = $file->getClientOriginalExtension();
            $fileName = $userId . '_' . now()->format('Uv') . '.' . $extension;

            $content = fopen($file->getRealPath(), 'r');
            
            $options = new CreateBlockBlobOptions();
            $options->setContentType($file->getMimeType());

            $this->blobClient->createBlockBlob(
                $containerName,
                $fileName,
                $content,
                $options
            );

            fclose($content);

            return $fileName;
        } catch (ServiceException $e) {
            Log::error('Azure Blob upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete file from Azure Blob Storage
     * Legacy: BlobStorageClient.DeleteFile
     */
    public function deleteFile(string $fileName, string $containerName): bool
    {
        try {
            if (!$this->blobClient) {
                return false;
            }

            $this->blobClient->deleteBlob($containerName, $fileName);
            return true;
        } catch (ServiceException $e) {
            Log::error('Azure Blob delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Download file from Azure Blob Storage
     * Legacy: BlobStorageClient.DownloadFile
     */
    public function downloadFile(string $containerName, string $fileName): ?string
    {
        try {
            if (!$this->blobClient) {
                return null;
            }

            $blob = $this->blobClient->getBlob($containerName, $fileName);
            return stream_get_contents($blob->getContentStream());
        } catch (ServiceException $e) {
            Log::error('Azure Blob download failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate SAS URL for file access
     * Legacy: BlobStorageClient.GetFileSasUrl
     * Returns a URL valid for 7 days
     * 
     * DISABLED: Azure Blob Storage SAS token generation disabled for now
     * TODO: Implement proper Azure Blob Storage or use local storage
     */
    public function getFileSasUrl(string $containerName, string $fileName): ?string
    {
        // Temporarily disabled - return null to prevent errors
        // TODO: Implement proper Azure Blob Storage SAS token generation
        Log::warning('Azure Blob SAS token generation is disabled', [
            'container' => $containerName,
            'file' => $fileName
        ]);
        return null;
        
        /* COMMENTED OUT - OLD IMPLEMENTATION WITH SDK ISSUES
        try {
            if (!$this->blobClient) {
                return null;
            }

            // Check if blob exists
            try {
                $this->blobClient->getBlobMetadata($containerName, $fileName);
            } catch (ServiceException $e) {
                return null;
            }

            // Generate SAS token
            $sas = $this->blobClient->generateBlobSharedAccessSignatureToken(
                $containerName,
                $fileName,
                'r', // read permission
                now()->addDays(7)->toIso8601String(),
                now()->subMinutes(5)->toIso8601String()
            );

            $blobUrl = $this->blobClient->getBlobUrl($containerName, $fileName);
            return $blobUrl . '?' . $sas;
        } catch (ServiceException $e) {
            Log::error('Azure Blob SAS generation failed: ' . $e->getMessage());
            return null;
        }
        */
    }

    /**
     * Container constants from legacy system
     */
    public const USER_DOCUMENT_CONTAINER = 'userdocuments';
    public const EMPLOYER_DOCUMENT_CONTAINER = 'employerdocuments';
}
