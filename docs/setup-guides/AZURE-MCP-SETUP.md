# Azure MCP Server Configuration

This project is configured with Azure MCP (Model Context Protocol) Server for Azure services integration, including Azure Blob Storage, Azure AD authentication, and Microsoft Graph API.

## What is Azure MCP Server?

The Azure MCP Server provides AI assistants and tools with access to Azure services through the Model Context Protocol. It enables:
- Azure Blob Storage operations (upload, download, list, delete)
- Azure AD authentication validation
- Integration with Microsoft Graph API
- Secure credential management

## Architecture

### Backend (Laravel)
- Azure AD SSO authentication
- Azure Blob Storage for document management
- Microsoft Graph API integration
- Email notifications via Office 365

### Frontend (Vue 3)
- Azure AD authentication via MSAL
- Azure Blob Storage service for file uploads
- TypeScript composables for Azure operations

## Configuration

### MCP Settings
Located in `.vscode/mcp-settings.json`:

```json
{
  "mcpServers": {
    "azure": {
      "command": "node",
      "args": [".vscode/azure-mcp-server.js"],
      "env": {
        "AZURE_TENANT_ID": "273f45e0-e235-4dde-ab7a-fd3e631a88e0",
        "AZURE_CLIENT_ID": "6ed43a0e-0860-4f9e-9410-459795ff6c03",
        "AZURE_STORAGE_ACCOUNT": "hrmsteststorage77",
        "AZURE_STORAGE_CONTAINER": "hrms-documents"
      }
    }
  }
}
```

### Environment Variables

#### Frontend (.env)
```env
VITE_AZURE_CLIENT_ID=6ed43a0e-0860-4f9e-9410-459795ff6c03
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/273f45e0-e235-4dde-ab7a-fd3e631a88e0
VITE_AZURE_REDIRECT_URI=http://localhost:5173/
VITE_AZURE_STORAGE_ACCOUNT=hrmsteststorage77
VITE_AZURE_STORAGE_CONTAINER=hrms-documents
```

#### Backend (.env)
```env
AZURE_CLIENT_ID=6ed43a0e-0860-4f9e-9410-459795ff6c03
AZURE_CLIENT_SECRET=<your-secret>
AZURE_TENANT_ID=273f45e0-e235-4dde-ab7a-fd3e631a88e0
AZURE_REDIRECT_URI=http://localhost:5173/

AZURE_STORAGE_ACCOUNT_NAME=hrmsteststorage77
AZURE_STORAGE_ACCOUNT_KEY=<your-storage-key>
AZURE_STORAGE_CONTAINER=hrms-documents
```

## Azure Services Setup

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Create new registration or use existing: `HRMS Application`
4. Configure settings:
   - **Redirect URIs**: Add `http://localhost:5173/` and production URL
   - **API permissions**: Add required Microsoft Graph permissions
   - **Certificates & secrets**: Create client secret

### 2. Azure Blob Storage

1. Navigate to **Storage accounts** in Azure Portal
2. Use existing account: `hrmsteststorage77`
3. Create container: `hrms-documents`
4. Set access level: Private (authenticate via Azure AD or access keys)
5. Copy access keys for configuration

### 3. Microsoft Graph API

- Already configured in tenant
- Base URL: `https://graph.microsoft.com/v1.0`
- Used for user management and Azure AD operations

## Installation

### Dependencies Installed
```bash
# Frontend
npm install @azure/storage-blob @azure/identity @azure/msal-browser

# Backend (Laravel)
composer require microsoft/microsoft-graph league/oauth2-client
```

## Usage

### Frontend - Azure Blob Storage

#### Using the Composable
```typescript
import { useAzureBlob } from '@/composables/useAzureBlob';

const { uploadFile, downloadFile, listFiles, isUploading, error } = useAzureBlob();

// Upload a file
const handleUpload = async (file: File) => {
  try {
    const url = await uploadFile(file, 'documents');
    console.log('File uploaded:', url);
  } catch (err) {
    console.error('Upload failed:', err);
  }
};

// Download a file
const handleDownload = async (blobName: string) => {
  await downloadFile(blobName, 'my-document.pdf');
};

// List files
const files = await listFiles('documents/');
```

#### Using the Service Directly
```typescript
import { azureBlobService } from '@/services/azure-blob.service';

// Upload
const url = await azureBlobService.uploadFile(file, 'folder');

// Download
const blob = await azureBlobService.downloadFile('folder/file.pdf');

// List
const files = await azureBlobService.listFiles('folder/');

// Delete
await azureBlobService.deleteFile('folder/file.pdf');
```

### Backend - Azure Blob Storage (Laravel)

```php
use Illuminate\Support\Facades\Storage;

// Upload
$path = Storage::disk('azure')->put('documents', $file);

// Download
$contents = Storage::disk('azure')->get($path);

// Delete
Storage::disk('azure')->delete($path);

// List
$files = Storage::disk('azure')->files('documents');
```

## MCP Server Tools

The Azure MCP Server provides the following tools:

### 1. azure-blob-upload
Upload a file to Azure Blob Storage
```json
{
  "fileName": "document.pdf",
  "content": "base64-encoded-content",
  "containerName": "hrms-documents"
}
```

### 2. azure-blob-download
Download a file from Azure Blob Storage
```json
{
  "fileName": "document.pdf",
  "containerName": "hrms-documents"
}
```

### 3. azure-blob-list
List files in a container
```json
{
  "containerName": "hrms-documents",
  "prefix": "documents/"
}
```

### 4. azure-blob-delete
Delete a file from storage
```json
{
  "fileName": "document.pdf",
  "containerName": "hrms-documents"
}
```

### 5. azure-auth-validate
Validate an Azure AD token
```json
{
  "token": "Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## File Structure

```
.vscode/
├── mcp-settings.json           # MCP server configuration
└── azure-mcp-server.js         # Azure MCP server implementation

hrms-frontend/
├── src/
│   ├── services/
│   │   ├── auth.service.ts            # Azure AD authentication
│   │   └── azure-blob.service.ts      # Azure Blob Storage service
│   └── composables/
│       └── useAzureBlob.ts            # Vue composable for Azure Blob

hrms-backend/
├── config/
│   ├── azure.php                      # Azure configuration
│   └── filesystems.php                # Storage disk configuration
└── app/
    └── Services/
        └── AzureStorageService.php    # Azure Storage service
```

## Security Best Practices

### 1. Credentials Management
- Never commit Azure credentials to version control
- Use environment variables for sensitive data
- Use Azure Key Vault for production secrets
- Rotate access keys regularly

### 2. Authentication
- Always validate Azure AD tokens
- Implement proper RBAC (Role-Based Access Control)
- Use managed identities in production Azure environments
- Enable MFA for Azure AD users

### 3. Storage Access
- Use SAS tokens for temporary access
- Implement proper CORS policies
- Enable blob soft delete for data protection
- Use Azure Private Endpoints for production

### 4. Network Security
- Restrict storage account to specific VNets
- Enable Azure Firewall rules
- Use HTTPS only
- Implement IP restrictions

## Testing

### Test Azure Blob Upload
```typescript
import { azureBlobService } from '@/services/azure-blob.service';

const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
const url = await azureBlobService.uploadFile(testFile, 'test');
console.log('Uploaded to:', url);
```

### Test MCP Server
```bash
# Test the MCP server directly
echo '{"method":"tools/list","params":{}}' | node .vscode/azure-mcp-server.js
```

## Common Issues

### Issue: "Storage account not found"
**Solution**: Verify `AZURE_STORAGE_ACCOUNT` is correctly set in environment variables

### Issue: "Authentication failed"
**Solution**: Check if Azure AD credentials are valid and client secret hasn't expired

### Issue: "CORS error"
**Solution**: Configure CORS rules in Azure Storage account settings

### Issue: "Container not found"
**Solution**: Ensure the container exists or enable auto-creation in code

## Azure Portal Links

- [Azure Active Directory](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview)
- [Storage Account](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts)
- [App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

## Resources

- [Azure Storage Documentation](https://docs.microsoft.com/azure/storage/)
- [Azure AD Documentation](https://docs.microsoft.com/azure/active-directory/)
- [Microsoft Graph API](https://docs.microsoft.com/graph/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Monitoring and Logging

### Azure Portal Monitoring
- Storage Account Metrics
- Blob Service Logs
- Azure AD Sign-in Logs
- Application Insights (recommended for production)

### Application Logging
```typescript
// Frontend
console.log('Azure operation:', { operation, status, timestamp });

// Backend
Log::info('Azure blob operation', [
    'operation' => 'upload',
    'file' => $filename,
    'status' => 'success'
]);
```

## Next Steps

1. Configure Azure Key Vault for secrets management
2. Set up Azure Application Insights for monitoring
3. Implement SAS token generation for temporary access
4. Add Azure CDN for blob storage performance
5. Configure Azure Backup for blob storage
6. Set up Azure Monitor alerts
7. Implement blob lifecycle management policies
8. Add support for Azure Active Directory B2C for external users

## Production Checklist

- [ ] Use managed identities instead of access keys
- [ ] Enable soft delete on blob storage
- [ ] Configure blob lifecycle policies
- [ ] Set up Azure CDN for static assets
- [ ] Enable Azure Storage Analytics
- [ ] Configure Azure Monitor alerts
- [ ] Implement proper error handling and retry logic
- [ ] Use Azure Key Vault for secrets
- [ ] Enable Azure AD Conditional Access
- [ ] Configure backup and disaster recovery
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Set up Azure Application Gateway for security
