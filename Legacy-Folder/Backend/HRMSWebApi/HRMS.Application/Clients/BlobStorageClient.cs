using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace HRMS.Application.Clients
{
    public class BlobStorageClient
    {
        private readonly string _connectionString;
        private readonly BlobServiceClient _blobServiceClient;
        public BlobStorageClient(IConfiguration configuration)
        {
            _connectionString = configuration["AzureBlobStorageConnectionString"];
            _blobServiceClient = new BlobServiceClient(_connectionString);
        }

      public async Task<string> UploadFile(IFormFile file, long userId, string containerName)
{
    string extention = Path.GetExtension(file.FileName);
    string fileName = userId + "_" + DateTime.UtcNow.Millisecond + extention;
    BlobContainerClient containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                memoryStream.Position = 0;
                BlobClient blobClient = containerClient.GetBlobClient(fileName);
                string contentType = file.ContentType;
                var headers = new BlobHttpHeaders
                {
                    ContentType = contentType,
                    ContentDisposition = "inline"
                };

                await blobClient.UploadAsync(memoryStream, new BlobUploadOptions
                {
                    HttpHeaders = headers

                });
                return fileName;
    }
  
}
        
        public async Task<bool> DeleteFile(string fileName, string containerName)
        {
            BlobContainerClient cont = _blobServiceClient.GetBlobContainerClient(containerName);
            BlobClient blobClient = cont.GetBlobClient(fileName);
            await blobClient.DeleteIfExistsAsync();
            return true;
        }
        
        public async Task<byte[]?> DownloadFile(string containerName, string filename)
        {
            try
            {
                if (_blobServiceClient != null)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        BlobContainerClient containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                        BlobClient blobContent = containerClient.GetBlobClient(filename);
                        await blobContent.DownloadToAsync(memoryStream);
                        return memoryStream.ToArray();
                    }
                }

                return null;
            }
            catch (Exception)
            {

                return null;
            }
        }

        public async Task<string?> GetFileSasUrl(string containerName, string filename)
        {
            try
            {
                if (_blobServiceClient != null)
                {
                    BlobContainerClient containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                    BlobClient blobClient = containerClient.GetBlobClient(filename);
                    if (!await blobClient.ExistsAsync()) { 
                        return null;
                    }
                    // Set the SAS token parameters
                    var sasBuilder = new BlobSasBuilder
                    {
                        BlobContainerName = containerName,
                        BlobName = filename,
                        Resource = "b", // "b" for blob, "c" for container
                        ExpiresOn = DateTimeOffset.UtcNow.AddDays(7),
                        StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5)
                    };

                    // Set the permissions
                    sasBuilder.SetPermissions(BlobSasPermissions.Read);

                    Uri sasUri = blobClient.GenerateSasUri(sasBuilder);
                    return sasUri.ToString();
                }

                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
