<?php

namespace App\Services;

use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Blob\Models\CreateBlockBlobOptions;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;
use MicrosoftAzure\Storage\Blob\Models\BlobAccessPolicy;
use MicrosoftAzure\Storage\Blob\Models\BlobServiceOptions;
use MicrosoftAzure\Storage\Common\Internal\Resources;
use MicrosoftAzure\Storage\Blob\Models\PublicAccessType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class BlobStorageService
{
    protected $blobClient;
    protected $connectionString;
    protected $containerName;

    public function __construct()
    {
        $this->connectionString = config('services.azure.storage.connection_string');
        $this->containerName = config('services.azure.storage.container', 'user-documents');
        
        try {
            $this->blobClient = BlobRestProxy::createBlobService($this->connectionString);
        } catch (\Exception $e) {
            Log::error('Failed to initialize Azure Blob Storage client: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Upload file to Azure Blob Storage
     * 
     * @param UploadedFile $file
     * @param int|string $userId
     * @param string $containerName
     * @return string Filename stored in blob
     */
    public function uploadFile(UploadedFile $file, $userId, string $containerName = null): string
    {
        try {
            $container = $containerName ?? $this->containerName;
            
            // Ensure container exists
            $this->ensureContainerExists($container);
            
            // Generate unique filename
            $extension = $file->getClientOriginalExtension();
            $timestamp = now()->format('U'); // Unix timestamp in milliseconds
            $filename = $userId . '_' . $timestamp . '.' . $extension;
            
            // Get file content
            $content = file_get_contents($file->getRealPath());
            
            // Set blob options
            $options = new CreateBlockBlobOptions();
            $options->setContentType($file->getMimeType());
            
            // Set content disposition to inline for viewing in browser
            $options->setContentDisposition('inline');
            
            // Upload to blob
            $this->blobClient->createBlockBlob(
                $container,
                $filename,
                $content,
                $options
            );
            
            Log::info("File uploaded to Azure Blob Storage: {$filename} in container: {$container}");
            
            return $filename;
            
        } catch (ServiceException $e) {
            Log::error('Azure Blob Storage upload error: ' . $e->getMessage());
            throw new \Exception('Failed to upload file to blob storage: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('File upload error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete file from Azure Blob Storage
     * 
     * @param string $filename
     * @param string $containerName
     * @return bool
     */
    public function deleteFile(string $filename, string $containerName = null): bool
    {
        try {
            $container = $containerName ?? $this->containerName;
            
            $this->blobClient->deleteBlob($container, $filename);
            
            Log::info("File deleted from Azure Blob Storage: {$filename}");
            
            return true;
            
        } catch (ServiceException $e) {
            Log::warning('Azure Blob Storage delete error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate SAS URL for blob with read permission
     * Valid for 7 days (matching legacy implementation)
     * 
     * @param string $containerName
     * @param string $filename
     * @return string|null SAS URL or null if blob doesn't exist
     */
    public function getFileSasUrl(string $containerName, string $filename): ?string
    {
        try {
            // Check if blob exists
            $blobExists = $this->blobExists($containerName, $filename);
            
            if (!$blobExists) {
                Log::warning("Blob does not exist: {$filename} in container: {$containerName}");
                return null;
            }
            
            // Get blob URL
            $baseUrl = config('services.azure.storage.url');
            $blobUrl = "{$baseUrl}/{$containerName}/{$filename}";
            
            // Create SAS token parameters
            $sasToken = $this->generateSasToken($containerName, $filename);
            
            $sasUrl = $blobUrl . '?' . $sasToken;
            
            Log::info("Generated SAS URL for blob: {$filename}");
            
            return $sasUrl;
            
        } catch (\Exception $e) {
            Log::error('Failed to generate SAS URL: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate SAS token for blob access
     * 
     * @param string $containerName
     * @param string $filename
     * @return string
     */
    protected function generateSasToken(string $containerName, string $filename): string
    {
        // Set expiry time (7 days from now)
        $expiryTime = new \DateTime();
        $expiryTime->modify('+7 days');
        
        // Set start time (5 minutes ago for clock skew)
        $startTime = new \DateTime();
        $startTime->modify('-5 minutes');
        
        // Build the canonical resource string
        $accountName = $this->getAccountName();
        $canonicalResource = "/blob/{$accountName}/{$containerName}/{$filename}";
        
        // Permissions (r = read)
        $permissions = 'r';
        
        // Format times
        $startTimeStr = $startTime->format('Y-m-d\TH:i:s\Z');
        $expiryTimeStr = $expiryTime->format('Y-m-d\TH:i:s\Z');
        
        // String to sign
        $stringToSign = implode("\n", [
            $permissions,
            $startTimeStr,
            $expiryTimeStr,
            $canonicalResource,
            '',  // signedIdentifier
            '',  // signedIP
            'https',  // signedProtocol
            '2020-12-06',  // signedVersion
            '',  // signedResource
            '',  // signedSnapshotTime
            '',  // signedEncryptionScope
            '',  // rscc (Cache-Control)
            '',  // rscd (Content-Disposition)
            '',  // rsce (Content-Encoding)
            '',  // rscl (Content-Language)
            ''   // rsct (Content-Type)
        ]);
        
        // Get account key
        $accountKey = $this->getAccountKey();
        
        // Generate signature
        $signature = base64_encode(hash_hmac('sha256', $stringToSign, base64_decode($accountKey), true));
        
        // Build SAS token
        $sasToken = http_build_query([
            'sv' => '2020-12-06',
            'st' => $startTimeStr,
            'se' => $expiryTimeStr,
            'sr' => 'b',  // resource type: blob
            'sp' => $permissions,
            'spr' => 'https',
            'sig' => $signature
        ]);
        
        return $sasToken;
    }
    
    /**
     * Extract account name from connection string
     * 
     * @return string
     */
    protected function getAccountName(): string
    {
        preg_match('/AccountName=([^;]+)/', $this->connectionString, $matches);
        return $matches[1] ?? '';
    }
    
    /**
     * Extract account key from connection string
     * 
     * @return string
     */
    protected function getAccountKey(): string
    {
        preg_match('/AccountKey=([^;]+)/', $this->connectionString, $matches);
        return $matches[1] ?? '';
    }

    /**
     * Download file content from blob storage
     * 
     * @param string $containerName
     * @param string $filename
     * @return string|null File content
     */
    public function downloadFile(string $containerName, string $filename): ?string
    {
        try {
            $blob = $this->blobClient->getBlob($containerName, $filename);
            $content = stream_get_contents($blob->getContentStream());
            
            Log::info("File downloaded from Azure Blob Storage: {$filename}");
            
            return $content;
            
        } catch (ServiceException $e) {
            Log::error('Azure Blob Storage download error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if blob exists
     * 
     * @param string $containerName
     * @param string $filename
     * @return bool
     */
    protected function blobExists(string $containerName, string $filename): bool
    {
        try {
            $this->blobClient->getBlobMetadata($containerName, $filename);
            return true;
        } catch (ServiceException $e) {
            return false;
        }
    }

    /**
     * Ensure container exists, create if it doesn't
     * 
     * @param string $containerName
     * @return void
     */
    protected function ensureContainerExists(string $containerName): void
    {
        try {
            // Try to get container properties
            $this->blobClient->getContainerProperties($containerName);
        } catch (ServiceException $e) {
            // Container doesn't exist, create it
            if ($e->getCode() === 404) {
                try {
                    $this->blobClient->createContainer($containerName);
                    Log::info("Created Azure Blob Storage container: {$containerName}");
                } catch (ServiceException $createException) {
                    Log::error("Failed to create container {$containerName}: " . $createException->getMessage());
                    throw $createException;
                }
            } else {
                throw $e;
            }
        }
    }

    /**
     * Get blob URL (without SAS token)
     * 
     * @param string $containerName
     * @param string $filename
     * @return string
     */
    public function getBlobUrl(string $containerName, string $filename): string
    {
        $baseUrl = config('services.azure.storage.url');
        return "{$baseUrl}/{$containerName}/{$filename}";
    }
}
