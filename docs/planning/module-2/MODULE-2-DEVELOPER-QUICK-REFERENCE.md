# Module-2: Quick Developer Reference

## Backend API Endpoints

### Employee Management
```http
GET    /api/employees?search=john&department_id=1
POST   /api/employees
GET    /api/employees/{id}
PUT    /api/employees/{id}
DELETE /api/employees/{id}
GET    /api/employees/next-code/generate
GET    /api/employees/{id}/profile-completeness
```

### Documents
```http
GET    /api/employees/documents?employee_id=123
POST   /api/employees/documents (FormData: employee_id, document_type_id, document_no, document_expiry, file)
PUT    /api/employees/documents/{id}
DELETE /api/employees/documents/{id}
GET    /api/employees/documents/{id}/download
GET    /api/employees/documents/types?id_proof_for=1
```

### Qualifications & Certificates
```http
GET    /api/employees/qualifications?employee_id=123
POST   /api/employees/qualifications (FormData: employee_id, qualification_id, university_id, file)
PUT    /api/employees/qualifications/{id}
DELETE /api/employees/qualifications/{id}
GET    /api/employees/qualifications/masters/qualifications
GET    /api/employees/qualifications/masters/universities

GET    /api/employees/certificates?employee_id=123
POST   /api/employees/certificates (FormData: employee_id, certificate_name, certificate_expiry, file)
DELETE /api/employees/certificates/{id}
```

### Addresses
```http
GET  /api/employees/addresses?employee_id=123
POST /api/employees/addresses/current
POST /api/employees/addresses/permanent
POST /api/employees/addresses/copy-current-to-permanent
```

### Bank Details
```http
GET    /api/employees/bank-details?employee_id=123&show_masked=true
POST   /api/employees/bank-details
PUT    /api/employees/bank-details/{id}
DELETE /api/employees/bank-details/{id}
POST   /api/employees/bank-details/{id}/set-active
```

### Nominees
```http
GET  /api/employees/nominees?employee_id=123
POST /api/employees/nominees
PUT  /api/employees/nominees/{id}
DELETE /api/employees/nominees/{id}
POST /api/employees/nominees/verify-percentage
```

## Frontend Usage Examples

### Using Employee Store
```typescript
import { useEmployeeStore } from '@/stores/employeeStore';

const employeeStore = useEmployeeStore();

// Fetch employees
await employeeStore.fetchEmployees({ department_id: 1 });

// Create employee
const newEmp = await employeeStore.createEmployee({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@company.com'
});

// Upload document
const formData = new FormData();
formData.append('employee_id', employeeId);
formData.append('document_type_id', 1); // PAN Card
formData.append('document_no', 'ABCDE1234F');
formData.append('file', fileObject);
await employeeStore.uploadDocument(formData);

// Load master data
await employeeStore.loadDepartments();
await employeeStore.loadDesignations();
await employeeStore.loadDocumentTypes(1); // ID Proofs only
```

### Component Integration
```vue
<script setup lang="ts">
import { useEmployeeStore } from '@/stores/employeeStore';
import { onMounted } from 'vue';

const employeeStore = useEmployeeStore();

onMounted(async () => {
  await employeeStore.fetchEmployees();
  await employeeStore.loadDepartments();
});
</script>

<template>
  <div v-if="employeeStore.loading">Loading...</div>
  <div v-else>
    <div v-for="emp in employeeStore.employees" :key="emp.id">
      {{ emp.first_name }} {{ emp.last_name }}
    </div>
  </div>
</template>
```

## Service Usage

### Azure Blob Service
```php
use App\Services\AzureBlobService;

$azureBlob = new AzureBlobService();

// Upload
$fileName = $azureBlob->uploadFile(
    $request->file('file'),
    $userId,
    AzureBlobService::USER_DOCUMENT_CONTAINER
);

// Get SAS URL (7-day validity)
$url = $azureBlob->getFileSasUrl(
    AzureBlobService::USER_DOCUMENT_CONTAINER,
    $fileName
);

// Download
$content = $azureBlob->downloadFile(
    AzureBlobService::USER_DOCUMENT_CONTAINER,
    $fileName
);

// Delete
$azureBlob->deleteFile($fileName, AzureBlobService::USER_DOCUMENT_CONTAINER);
```

### Time Doctor Service
```php
use App\Services\TimeDoctorService;

$timeDoctor = new TimeDoctorService();

// Get user ID by email
$userId = $timeDoctor->getTimeDoctorUserIdByEmail('john.doe@company.com');

// Validate user ID
$isValid = $timeDoctor->isTimeDoctorUserIdValid('john.doe@company.com', 'user123');

// Get user details
$user = $timeDoctor->getTimeDoctorUserById('user123');

// Get all active users
$users = $timeDoctor->getActiveUsers();
```

## Configuration

### Backend (.env)
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hrms
DB_USERNAME=root
DB_PASSWORD=

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx;

# Time Doctor
TIMEDOCTOR_BASE_URL=https://api2.timedoctor.com/api/1.0/users
TIMEDOCTOR_API_TOKEN=your_token_here
TIMEDOCTOR_COMPANY_ID=YfQJah6-uiOk6nqu
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Common Code Patterns

### Document Upload with Validation
```php
// Controller
$validator = Validator::make($request->all(), [
    'employee_id' => 'required|integer|exists:employee_data,id',
    'document_type_id' => 'required|integer|exists:document_type,id',
    'file' => 'required|file|max:10240', // 10MB
]);

if ($validator->fails()) {
    return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
}

DB::beginTransaction();
try {
    $fileName = $this->azureBlobService->uploadFile(
        $request->file('file'),
        $request->employee_id,
        AzureBlobService::USER_DOCUMENT_CONTAINER
    );

    $document = UserDocument::create([
        'employee_id' => $request->employee_id,
        'document_type_id' => $request->document_type_id,
        'file_name' => $fileName,
        'created_by' => auth()->user()->email ?? 'system',
        'created_on' => now(),
    ]);

    DB::commit();
    return response()->json(['success' => true, 'data' => $document]);
} catch (\Exception $e) {
    DB::rollBack();
    return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
}
```

### Profile Completeness Calculation
```php
// In EmployeeData model
public function calculateProfileCompleteness(): array
{
    $sections = [
        'personal_info' => $this->calculatePersonalInfoCompleteness(),    // 12.5%
        'contact_info' => $this->calculateContactInfoCompleteness(),      // 12.5%
        'employment_details' => $this->calculateEmploymentCompleteness(), // 12.5%
        'address' => $this->calculateAddressCompleteness(),               // 12.5%
        'bank_details' => $this->calculateBankDetailsCompleteness(),      // 12.5%
        'documents' => $this->calculateDocumentsCompleteness(),           // 12.5%
        'qualifications' => $this->calculateQualificationsCompleteness(), // 12.5%
        'nominees' => $this->calculateNomineesCompleteness(),             // 12.5%
    ];

    $overall = array_sum($sections);

    return [
        'overall_percentage' => round($overall, 2),
        'sections' => $sections,
    ];
}
```

### Nominee Percentage Validation
```php
// Service
public function validateNominee(int $employeeId, float $percentage, ?int $excludeNomineeId = null): array
{
    $existingTotal = UserNomineeInfo::where('employee_id', $employeeId)
        ->where('is_deleted', 0)
        ->when($excludeNomineeId, fn($q) => $q->where('id', '!=', $excludeNomineeId))
        ->sum('percentage');

    $newTotal = $existingTotal + $percentage;

    if ($newTotal > 100) {
        return [
            'is_valid' => false,
            'message' => "Total percentage ({$newTotal}%) exceeds 100%",
            'remaining' => max(0, 100 - $existingTotal),
        ];
    }

    return [
        'is_valid' => true,
        'remaining' => 100 - $newTotal,
    ];
}
```

## Artisan Commands

```bash
# Clear all caches
php artisan route:clear
php artisan config:clear
php artisan cache:clear

# View routes
php artisan route:list --path=api/employees

# Run specific seeder
php artisan db:seed --class=CountrySeeder
php artisan db:seed --class=DepartmentSeeder
php artisan db:seed --class=DesignationSeeder
php artisan db:seed --class=DocumentTypeSeeder
php artisan db:seed --class=QualificationSeeder

# Run all seeders
php artisan db:seed

# Create test data
php artisan tinker
>>> \App\Models\EmployeeData::factory()->count(50)->create();
```

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"email":"admin@company.com","password":"password"}'

# Get employees
curl http://localhost:8000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload document
curl -X POST http://localhost:8000/api/employees/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "employee_id=1" \
  -F "document_type_id=1" \
  -F "document_no=ABCDE1234F" \
  -F "file=@/path/to/file.pdf"

# Get profile completeness
curl http://localhost:8000/api/employees/1/profile-completeness \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Queries

```sql
-- Get employee with all related data
SELECT e.*, ed.email, ed.designation 
FROM employee_data e 
LEFT JOIN employment_details ed ON e.id = ed.employee_id 
WHERE e.is_deleted = 0;

-- Check nominee percentage total
SELECT employee_id, SUM(percentage) as total_percentage 
FROM user_nominee_info 
WHERE is_deleted = 0 
GROUP BY employee_id 
HAVING total_percentage != 100;

-- Find expiring documents (next 30 days)
SELECT * FROM user_document 
WHERE document_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
AND is_deleted = 0;

-- Get employees without documents
SELECT e.* FROM employee_data e 
LEFT JOIN user_document d ON e.id = d.employee_id AND d.is_deleted = 0 
WHERE d.id IS NULL AND e.is_deleted = 0;

-- Master data counts
SELECT 
  (SELECT COUNT(*) FROM country WHERE is_deleted = 0) as countries,
  (SELECT COUNT(*) FROM state WHERE is_deleted = 0) as states,
  (SELECT COUNT(*) FROM department WHERE is_deleted = 0) as departments,
  (SELECT COUNT(*) FROM designation WHERE is_deleted = 0) as designations,
  (SELECT COUNT(*) FROM document_type WHERE is_deleted = 0) as document_types;
```

## Troubleshooting

### Azure Blob Issues
```php
// Check configuration
php artisan tinker
>>> config('services.azure.storage_connection_string');

// Test connection
$service = new \App\Services\AzureBlobService();
// If null, check .env file
```

### Time Doctor Issues
```php
// Check configuration
php artisan tinker
>>> config('services.timedoctor.api_token');
>>> config('services.timedoctor.company_id');

// Test API
$service = new \App\Services\TimeDoctorService();
$result = $service->getTimeDoctorUserIdByEmail('test@company.com');
dd($result);
```

### Route Not Found
```bash
# Clear route cache
php artisan route:clear

# Verify route exists
php artisan route:list | grep "employees/documents"
```

### CORS Issues (Frontend)
```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173'], // Vite dev server
```
