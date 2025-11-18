# Module 1: Authentication & Authorization - Migration Plan

**Module Name:** Authentication & Authorization  
**Priority:** P0 (Highest - Foundation Module)  
**Dependencies:** None (Foundation for all other modules)  
**Estimated Effort:** 2-3 weeks  
**Documentation Reference:** `HRMS-Project-Documentation/modules/01-authentication-authorization.md`  
**Source Code Verification Path:**  
- Backend: `Backend/HRMSWebApi/HRMS.API/Controllers/AuthController.cs`
- Backend Services: `Backend/HRMSWebApi/HRMS.Application/Services/AuthService.cs`
- Backend Repository: `Backend/HRMSWebApi/HRMS.Infrastructure/Repositories/AuthRepository.cs`
- Frontend: `Frontend/HRMS-Frontend/source/src/pages/Login/`
- Frontend Store: `Frontend/HRMS-Frontend/source/src/store/` (Zustand stores)

**Migration Target:**  
- Laravel Backend: `app/Http/Controllers/AuthController.php`, `app/Services/AuthService.php`
- Vue Frontend: `src/views/auth/LoginView.vue`, `src/stores/auth.ts` (Pinia)

---

## 1. VERIFICATION CHECKLIST

### 1.1 Database Tables and Entities Verification
- [x] **EmployeeData** table confirmed in `02_HRMS_Table_Scripts.sql`
  - Fields: Id, FirstName, MiddleName, LastName, FatherName, FileName, BloodGroup, Gender, DOB, Phone, PersonalEmail, Nationality, Status, RefreshToken, RefreshTokenExpiryDate, EmployeeCode
  - Primary Key: Id (bigint IDENTITY)
  - Contains RefreshToken and RefreshTokenExpiryDate fields for token refresh mechanism
  
- [x] **EmploymentDetail** table confirmed in `02_HRMS_Table_Scripts.sql`
  - Fields: Id, EmployeeId, Email, JoiningDate, RoleId, ReportingMangerId, EmploymentStatus, DepartmentId, TeamId, Designation
  - Foreign Keys: EmployeeId → EmployeeData(Id), ReportingMangerId → EmployeeData(Id)
  - Contains RoleId field for role-based access control

- [x] **Role** table confirmed in `01_HRMS_MasterTable_Scripts.sql`
  - Fields: Id, Name, IsActive, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
  - Master data table for roles (8 roles documented: SuperAdmin, HR, Employee, Accounts, Manager, IT, Developer, TeamLead)

- [x] **Module** table confirmed in `02_HRMS_Table_Scripts.sql`
  - Fields: Id, ModuleName, IsActive, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn
  - Top-level permission grouping

- [x] **SubModule** table structure inferred from documentation
  - Expected structure: Id, ModuleId, SubModuleName
  - ⚠️ **UNDEFINED**: Exact table structure not found in database scripts - **Requires verification before migration**

- [x] **Permission** table structure inferred from documentation
  - Expected structure: Id, SubModuleId (or ModuleId), PermissionValue, Description
  - 160+ permissions documented in system
  - ⚠️ **UNDEFINED**: Exact table structure not found in database scripts - **Requires verification before migration**

- [x] **RolePermission** table (junction table) inferred from documentation
  - Expected structure: Id, RoleId, PermissionId
  - ⚠️ **UNDEFINED**: Exact table structure not found in database scripts - **Requires verification before migration**

- [x] **UserRoleMapping** table confirmed in documentation
  - Expected structure: Id, EmployeeId, RoleId
  - One role per user (as per documentation)
  - ⚠️ **UNDEFINED**: Exact table structure not found in database scripts - **Requires verification before migration**

### 1.2 Dependent Modules Verification
- [x] **No dependencies** - This is the foundation module
- [x] **Used by:** ALL other modules depend on authentication and authorization

### 1.3 Routes, Services, and API Calls Verification

#### Backend API Endpoints (Verified in AuthController.cs)
1. **POST /api/Auth** - SSO Login with Azure AD token
   - Request: `SSOLoginRequestDto` (contains Azure AD access token)
   - Response: `LoginResponseDto` (JWT, RefreshToken, User details, Permissions)
   - Authentication: No (public endpoint)
   - Permissions: None

2. **POST /api/Auth/Login** - Standard email/password login
   - Request: `LoginDto` (email, password)
   - Response: `LoginResponseDto`
   - Authentication: No (public endpoint)
   - Permissions: None

3. **POST /api/Auth/RefreshToken** - Token refresh
   - Request: `RefreshTokenRequest` (refresh token string)
   - Response: New JWT token
   - Authentication: No (refresh token validated instead)
   - Permissions: None

4. **GET /api/Auth/CheckHealth** - API health check
   - Request: None
   - Response: API status and version
   - Authentication: No (public endpoint)
   - Permissions: None

#### Backend Services (Verified in AuthService.cs)
- ValidateAzureToken() - Calls Microsoft Graph API to validate and fetch user profile
- ValidateCredentials() - Validates email/password (AES decryption for test users)
- GenerateJwtToken() - Creates JWT with claims (EmployeeId, Email, Role, Permissions)
- GenerateRefreshToken() - Creates refresh token and stores in database
- ValidateRefreshToken() - Validates refresh token against database

#### Backend Authorization Components (Verified in Authorization folder)
- **PermissionAuthorizationHandler.cs** - Checks if user has required permission
- **PermissionAuthorizationPolicyProvider.cs** - Dynamically creates authorization policies
- **PermissionRequirement.cs** - Defines permission requirement for policies
- **CustomAuthorizationMiddlewareResultHandler.cs** - Handles 403 Forbidden responses
- **HasPermission Attribute** - Controller action attribute for permission checking

#### Backend Middleware (Verified in Middlewares folder)
- **ApiKeyMiddleware.cs** - Validates X-API-Key header for external services

### 1.4 Frontend Components and Data Bindings Verification

#### React Components (Verified in source/src/pages/Login/)
- **Login page component** - Contains SSO and standard login forms
  - Azure AD SSO button
  - Email and password input fields
  - Login button
  - Error message display

#### React Routes (Verified in source/src/routes.tsx)
- **Public Routes:**
  - `/` - Login page
  - `/internal-login` - Internal user login page
  - `/unauthorized` - Access denied page
  
- **Protected Routes:**
  - All other routes protected by `ProtectedRoute` component
  - Route protection logic: Check isLoggedIn → Check hasPermission → Render or redirect

#### State Management (Verified in source/src/store/)
- **useUserStore** (Zustand)
  - State: isLoggedIn, userData (including roleName), permissions array
  - Actions: login, logout, setUser
  
- **useModulePermissionsStore** (Zustand)
  - State: permissions by module
  - Used for menu generation

#### API Integration (Verified in source/src/api/)
- **httpInstance.ts** - Axios instance with interceptors
  - Request interceptor: Attach JWT token from localStorage
  - Response interceptor: Handle 401 errors and trigger token refresh
  - Error handling: Logout user on token expiry

#### Authentication Flow (Verified in code)
- Azure AD authentication via @azure/msal-browser and @azure/msal-react
- JWT token stored in localStorage with key "token"
- Refresh token stored in localStorage
- Automatic token refresh on 401 response

### 1.5 Data Validation Logic Verification

#### Backend Validation (Verified in Validations folder)
- **LoginDto validation** (FluentValidation):
  - Email: Required, valid email format
  - Password: Required, minimum length
  
- **SSOLoginRequestDto validation**:
  - Access token: Required, non-empty

#### Frontend Validation (Verified in Login components)
- Client-side validation before API call:
  - Email format validation
  - Password required validation
  - Error message display
  - Loading state during authentication

---

## 2. MIGRATION PLAN FOR THIS MODULE

### 2.1 Backend Migration Steps (Laravel)

#### Step 1: Database Migration Files

**Create Laravel migrations for all tables:**

```bash
# Master table migrations
php artisan make:migration create_roles_table
php artisan make:migration create_modules_table
php artisan make:migration create_sub_modules_table  # ⚠️ Verify structure first
php artisan make:migration create_permissions_table  # ⚠️ Verify structure first

# Operational table migrations
php artisan make:migration create_employee_data_table
php artisan make:migration create_employment_details_table
php artisan make:migration create_role_permissions_table  # ⚠️ Verify structure first
php artisan make:migration create_user_role_mappings_table  # ⚠️ Verify structure first
```

**Migration File Example (create_employee_data_table.php):**

```php
Schema::create('employee_data', function (Blueprint $table) {
    $table->id(); // bigint unsigned auto_increment
    $table->string('first_name', 50);
    $table->string('middle_name', 50)->nullable();
    $table->string('last_name', 50);
    $table->string('father_name', 100)->nullable();
    $table->string('file_name', 100)->nullable();
    $table->string('file_original_name', 100)->nullable();
    $table->string('blood_group', 10)->nullable();
    $table->tinyInteger('gender')->nullable();
    $table->date('dob')->nullable();
    $table->string('phone', 20)->nullable();
    $table->string('alternate_phone', 20)->nullable();
    $table->string('personal_email', 100)->nullable();
    $table->string('nationality', 50)->nullable();
    $table->string('interest', 250)->nullable();
    $table->tinyInteger('marital_status')->nullable();
    $table->string('emergency_contact_person', 100)->nullable();
    $table->string('emergency_contact_no', 20)->nullable();
    $table->string('pan_number', 100)->nullable();
    $table->string('adhar_number', 100)->nullable();
    $table->string('pf_number', 100)->nullable();
    $table->string('esi_no', 100)->nullable();
    $table->boolean('has_esi')->nullable();
    $table->boolean('has_pf')->nullable();
    $table->string('uan_no', 100)->nullable();
    $table->string('passport_no', 100)->nullable();
    $table->dateTime('passport_expiry')->nullable();
    $table->dateTime('pf_date')->nullable();
    $table->tinyInteger('status')->nullable();
    $table->string('created_by', 250);
    $table->timestamp('created_on')->useCurrent();
    $table->string('modified_by', 250)->nullable();
    $table->timestamp('modified_on')->nullable();
    $table->boolean('is_deleted')->default(false);
    $table->string('refresh_token', 100)->nullable();
    $table->dateTime('refresh_token_expiry_date')->nullable();
    $table->string('employee_code', 20)->nullable()->unique();
    
    $table->index(['email']); // For authentication lookup
    $table->index(['employee_code']);
    $table->index(['is_deleted']);
});
```

**⚠️ ACTION REQUIRED:** Before creating SubModule, Permission, RolePermission, and UserRoleMapping migrations:
1. Search codebase for exact table structures
2. Verify column names, data types, and relationships
3. Document findings and adjust migrations accordingly

#### Step 2: Eloquent Models

**Create Laravel models:**

```bash
php artisan make:model EmployeeData
php artisan make:model EmploymentDetail
php artisan make:model Role
php artisan make:model Module
php artisan make:model SubModule  # After verification
php artisan make:model Permission  # After verification
php artisan make:model RolePermission  # After verification
php artisan make:model UserRoleMapping  # After verification
```

**Model Example (EmployeeData.php):**

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class EmployeeData extends Model
{
    use HasApiTokens, Notifiable;

    protected $table = 'employee_data';
    protected $primaryKey = 'id';
    public $timestamps = false; // Custom timestamp columns

    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'father_name',
        'file_name', 'blood_group', 'gender', 'dob', 'phone',
        'personal_email', 'nationality', 'status', 'employee_code',
        'refresh_token', 'refresh_token_expiry_date'
    ];

    protected $hidden = [
        'refresh_token',
    ];

    protected $casts = [
        'dob' => 'date',
        'has_esi' => 'boolean',
        'has_pf' => 'boolean',
        'is_deleted' => 'boolean',
        'refresh_token_expiry_date' => 'datetime',
        'passport_expiry' => 'datetime',
        'pf_date' => 'datetime',
    ];

    // Relationships
    public function employmentDetail()
    {
        return $this->hasOne(EmploymentDetail::class, 'employee_id');
    }

    public function userRoleMapping()
    {
        return $this->hasOne(UserRoleMapping::class, 'employee_id');
    }

    // Accessor for full name
    public function getFullNameAttribute()
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }
}
```

#### Step 3: Service Layer

**Create AuthService.php:**

```bash
php artisan make:service AuthService
# Or manually create: app/Services/AuthService.php
```

**AuthService.php Implementation:**

```php
namespace App\Services;

use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthService
{
    /**
     * Validate Azure AD token and get user profile
     */
    public function validateAzureToken(string $accessToken): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->get('https://graph.microsoft.com/v1.0/me');

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('Azure token validation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Authenticate user with Azure AD
     */
    public function authenticateWithAzure(string $accessToken): ?array
    {
        // Validate token with Microsoft Graph API
        $userProfile = $this->validateAzureToken($accessToken);

        if (!$userProfile) {
            return null;
        }

        $email = $userProfile['mail'] ?? $userProfile['userPrincipalName'] ?? null;

        if (!$email) {
            return null;
        }

        // Find employee by email in EmploymentDetail
        $employmentDetail = EmploymentDetail::where('email', $email)
            ->whereNull('is_deleted')
            ->first();

        if (!$employmentDetail) {
            return null;
        }

        $employee = EmployeeData::where('id', $employmentDetail->employee_id)
            ->where('is_deleted', false)
            ->first();

        if (!$employee) {
            return null;
        }

        return $this->generateAuthResponse($employee, $employmentDetail);
    }

    /**
     * Authenticate user with email and password
     */
    public function authenticateWithCredentials(string $email, string $password): ?array
    {
        // Find employment detail by email
        $employmentDetail = EmploymentDetail::where('email', $email)
            ->whereNull('is_deleted')
            ->first();

        if (!$employmentDetail) {
            return null;
        }

        $employee = EmployeeData::where('id', $employmentDetail->employee_id)
            ->where('is_deleted', false)
            ->first();

        if (!$employee) {
            return null;
        }

        // ⚠️ TODO: Implement actual password verification
        // Current system uses AES encryption for test users
        // Need to verify password hashing mechanism
        // For now, assuming bcrypt hashed passwords
        
        // Placeholder for password verification
        // $isValidPassword = $this->verifyPassword($employee, $password);
        // if (!$isValidPassword) {
        //     return null;
        // }

        return $this->generateAuthResponse($employee, $employmentDetail);
    }

    /**
     * Generate authentication response with JWT and refresh token
     */
    protected function generateAuthResponse(EmployeeData $employee, EmploymentDetail $employmentDetail): array
    {
        // Get user permissions
        $permissions = $this->getUserPermissions($employmentDetail->role_id);

        // Generate JWT token via Laravel Sanctum
        $token = $employee->createToken('auth_token', $permissions)->plainTextToken;

        // Generate refresh token
        $refreshToken = Str::random(100);
        $refreshTokenExpiry = Carbon::now()->addDays(7);

        // Store refresh token in database
        $employee->update([
            'refresh_token' => $refreshToken,
            'refresh_token_expiry_date' => $refreshTokenExpiry,
        ]);

        return [
            'employee_id' => $employee->id,
            'email' => $employmentDetail->email,
            'name' => $employee->full_name,
            'role' => $employmentDetail->role_id,
            'permissions' => $permissions,
            'token' => $token,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Get user permissions based on role
     */
    protected function getUserPermissions(int $roleId): array
    {
        // ⚠️ TODO: Implement actual permission fetching logic
        // After RolePermission and Permission tables are verified
        
        // Placeholder: Return empty array for now
        return [];
    }

    /**
     * Refresh JWT token using refresh token
     */
    public function refreshToken(string $refreshToken): ?array
    {
        $employee = EmployeeData::where('refresh_token', $refreshToken)
            ->where('is_deleted', false)
            ->first();

        if (!$employee) {
            return null;
        }

        // Check if refresh token expired
        if (Carbon::now()->gt($employee->refresh_token_expiry_date)) {
            return null;
        }

        $employmentDetail = $employee->employmentDetail;

        if (!$employmentDetail) {
            return null;
        }

        // Get permissions
        $permissions = $this->getUserPermissions($employmentDetail->role_id);

        // Generate new JWT token
        $token = $employee->createToken('auth_token', $permissions)->plainTextToken;

        return [
            'token' => $token,
        ];
    }
}
```

#### Step 4: Controllers

**Create AuthController.php:**

```bash
php artisan make:controller AuthController
```

**AuthController.php Implementation:**

```php
namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SSOLoginRequest;
use App\Http\Requests\RefreshTokenRequest;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * SSO Login with Azure AD
     * POST /api/Auth
     */
    public function ssoLogin(SSOLoginRequest $request)
    {
        $accessToken = $request->input('access_token');

        $authData = $this->authService->authenticateWithAzure($accessToken);

        if (!$authData) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid Azure AD token or user not found',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Login successful',
            'data' => $authData,
            'is_success' => true,
        ], 200);
    }

    /**
     * Standard Login with email and password
     * POST /api/Auth/Login
     */
    public function login(LoginRequest $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        $authData = $this->authService->authenticateWithCredentials($email, $password);

        if (!$authData) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid email or password',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Login successful',
            'data' => $authData,
            'is_success' => true,
        ], 200);
    }

    /**
     * Refresh JWT token
     * POST /api/Auth/RefreshToken
     */
    public function refreshToken(RefreshTokenRequest $request)
    {
        $refreshToken = $request->input('refresh_token');

        $tokenData = $this->authService->refreshToken($refreshToken);

        if (!$tokenData) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid or expired refresh token',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Token refreshed successfully',
            'data' => $tokenData,
            'is_success' => true,
        ], 200);
    }

    /**
     * API Health Check
     * GET /api/Auth/CheckHealth
     */
    public function checkHealth()
    {
        return response()->json([
            'status_code' => 200,
            'message' => 'API is healthy',
            'data' => [
                'version' => config('app.version', 'HRMV-0.2.2'),
                'timestamp' => now()->toDateTimeString(),
            ],
            'is_success' => true,
        ], 200);
    }
}
```

#### Step 5: Form Request Validation

**Create Form Request classes:**

```bash
php artisan make:request LoginRequest
php artisan make:request SSOLoginRequest
php artisan make:request RefreshTokenRequest
```

**LoginRequest.php:**

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // No authorization needed for login
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required',
            'email.email' => 'Please provide a valid email address',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
        ];
    }
}
```

#### Step 6: Routes Registration

**routes/api.php:**

```php
use App\Http\Controllers\AuthController;

// Authentication routes (no middleware)
Route::prefix('Auth')->group(function () {
    Route::post('/', [AuthController::class, 'ssoLogin']); // SSO Login
    Route::post('/Login', [AuthController::class, 'login']); // Standard Login
    Route::post('/RefreshToken', [AuthController::class, 'refreshToken']); // Token Refresh
    Route::get('/CheckHealth', [AuthController::class, 'checkHealth']); // Health Check
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Other module routes will go here
});
```

#### Step 7: Middleware and Authorization

**Create custom permission checking middleware:**

```bash
php artisan make:middleware CheckPermission
```

**CheckPermission.php:**

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        if (!$request->user()) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Unauthenticated',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        // Check if user has the required permission
        if (!$request->user()->tokenCan($permission)) {
            return response()->json([
                'status_code' => 403,
                'message' => 'You do not have permission to perform this action',
                'data' => null,
                'is_success' => false,
            ], 403);
        }

        return $next($request);
    }
}
```

**Register middleware in app/Http/Kernel.php:**

```php
protected $middlewareAliases = [
    // ... other middleware
    'permission' => \App\Http\Middleware\CheckPermission::class,
];
```

### 2.2 Frontend Migration Steps (Vue.js)

#### Step 1: Project Setup

```bash
# Create Vue 3 project with Vite
npm create vite@latest hrms-frontend -- --template vue-ts
cd hrms-frontend
npm install

# Install dependencies
npm install vuetify@next
npm install pinia
npm install vue-router@4
npm install axios
npm install @tanstack/vue-query
npm install @azure/msal-browser
npm install vee-validate yup
npm install vue-toastification
```

#### Step 2: Directory Structure

```
src/
├── assets/
├── components/
│   ├── common/
│   └── layout/
│       ├── AppHeader.vue
│       ├── AppSidebar.vue
│       └── AppLayout.vue
├── composables/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useAzureAuth.ts
├── router/
│   └── index.ts
├── services/
│   ├── api.ts
│   └── auth.service.ts
├── stores/
│   ├── auth.ts
│   ├── user.ts
│   └── permissions.ts
├── types/
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── views/
│   ├── auth/
│   │   ├── LoginView.vue
│   │   └── UnauthorizedView.vue
│   └── dashboard/
│       └── DashboardView.vue
├── App.vue
└── main.ts
```

#### Step 3: Type Definitions

**src/types/auth.types.ts:**

```typescript
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SSOLoginRequest {
  access_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthResponse {
  employee_id: number;
  email: string;
  name: string;
  role: number;
  permissions: string[];
  token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: number;
  roleName?: string;
}
```

#### Step 4: Pinia Stores

**src/stores/auth.ts:**

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthResponse } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));
  const user = ref<User | null>(null);
  const permissions = ref<string[]>([]);

  const isAuthenticated = computed(() => !!token.value);

  function setAuthData(data: AuthResponse) {
    token.value = data.token;
    refreshToken.value = data.refresh_token;
    user.value = {
      id: data.employee_id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
    permissions.value = data.permissions;

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(user.value));
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
  }

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials);
    setAuthData(response.data);
  }

  async function loginWithAzure(accessToken: string) {
    const response = await authService.ssoLogin(accessToken);
    setAuthData(response.data);
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    const response = await authService.refreshToken(refreshToken.value);
    token.value = response.data.token;
    localStorage.setItem('auth_token', response.data.token);
  }

  function logout() {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    permissions.value = [];

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission);
  }

  return {
    token,
    refreshToken,
    user,
    permissions,
    isAuthenticated,
    setAuthData,
    login,
    loginWithAzure,
    refreshAccessToken,
    logout,
    hasPermission,
  };
});
```

#### Step 5: API Service Layer

**src/services/api.ts (Axios instance with interceptors):**

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authStore.refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        authStore.logout();
        router.push({ name: 'Login' });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

**src/services/auth.service.ts:**

```typescript
import api from './api';
import type { LoginCredentials, SSOLoginRequest, RefreshTokenRequest, AuthResponse } from '@/types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials) {
    return api.post<{ data: AuthResponse }>('/Auth/Login', credentials);
  },

  async ssoLogin(accessToken: string) {
    return api.post<{ data: AuthResponse }>('/Auth', { access_token: accessToken });
  },

  async refreshToken(refreshToken: string) {
    return api.post<{ data: { token: string } }>('/Auth/RefreshToken', { refresh_token: refreshToken });
  },

  async checkHealth() {
    return api.get('/Auth/CheckHealth');
  },
};
```

#### Step 6: Vue Router Setup

**src/router/index.ts:**

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
    ],
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/auth/UnauthorizedView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
```

#### Step 7: Login View Component

**src/views/auth/LoginView.vue:**

```vue
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>HRMS Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <!-- SSO Login Button -->
            <v-btn
              block
              color="primary"
              class="mb-4"
              @click="handleAzureLogin"
              :loading="isLoading"
            >
              <v-icon left>mdi-microsoft</v-icon>
              Sign in with Microsoft
            </v-btn>

            <v-divider class="my-4">
              <span class="px-2 text-grey">OR</span>
            </v-divider>

            <!-- Standard Login Form -->
            <v-form @submit.prevent="handleLogin" ref="formRef">
              <v-text-field
                v-model="credentials.email"
                label="Email"
                type="email"
                prepend-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                required
              ></v-text-field>

              <v-text-field
                v-model="credentials.password"
                label="Password"
                type="password"
                prepend-icon="mdi-lock"
                :rules="[rules.required, rules.minLength]"
                required
              ></v-text-field>

              <v-btn
                block
                color="primary"
                type="submit"
                :loading="isLoading"
                class="mt-2"
              >
                Login
              </v-btn>
            </v-form>

            <!-- Error Message -->
            <v-alert
              v-if="errorMessage"
              type="error"
              class="mt-4"
              dismissible
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAzureAuth } from '@/composables/useAzureAuth';
import type { LoginCredentials } from '@/types/auth.types';

const router = useRouter();
const authStore = useAuthStore();
const { loginWithAzure } = useAzureAuth();

const formRef = ref();
const credentials = ref<LoginCredentials>({
  email: '',
  password: '',
});
const isLoading = ref(false);
const errorMessage = ref('');

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
  minLength: (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
};

const handleLogin = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login(credentials.value);
    router.push({ name: 'Dashboard' });
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleAzureLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await loginWithAzure();
    router.push({ name: 'Dashboard' });
  } catch (error: any) {
    errorMessage.value = error.message || 'Azure login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
```

#### Step 8: Azure AD Integration Composable

**src/composables/useAzureAuth.ts:**

```typescript
import { PublicClientApplication } from '@azure/msal-browser';
import { useAuthStore } from '@/stores/auth';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export function useAzureAuth() {
  const authStore = useAuthStore();

  const loginWithAzure = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['User.Read'],
      });

      const accessToken = loginResponse.accessToken;

      await authStore.loginWithAzure(accessToken);
    } catch (error) {
      console.error('Azure login error:', error);
      throw error;
    }
  };

  return {
    loginWithAzure,
  };
}
```

### 2.3 Database Migration Steps

#### Step 1: Verify Table Structures

**⚠️ ACTION REQUIRED before migration:**

1. **Search for SubModule table structure:**
   ```bash
   # Search in database scripts
   grep -r "SubModule" Backend/HRMSWebApi/DataBase/*.sql
   ```

2. **Search for Permission table structure:**
   ```bash
   grep -r "Permission" Backend/HRMSWebApi/DataBase/*.sql
   ```

3. **Search for RolePermission table structure:**
   ```bash
   grep -r "RolePermission" Backend/HRMSWebApi/DataBase/*.sql
   ```

4. **Search for UserRoleMapping table structure:**
   ```bash
   grep -r "UserRoleMapping" Backend/HRMSWebApi/DataBase/*.sql
   ```

5. **Document findings** and update migration files accordingly.

#### Step 2: Run Migrations

```bash
php artisan migrate
```

#### Step 3: Seed Master Data

**Create seeders:**

```bash
php artisan make:seeder RoleSeeder
php artisan make:seeder ModuleSeeder
# Add more seeders as needed after table verification
```

**RoleSeeder.php:**

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['id' => 1, 'name' => 'SuperAdmin', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 2, 'name' => 'HR', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 3, 'name' => 'Employee', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 4, 'name' => 'Accounts', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 5, 'name' => 'Manager', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 6, 'name' => 'IT', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 7, 'name' => 'Developer', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
            ['id' => 8, 'name' => 'TeamLead', 'is_active' => true, 'created_by' => 'System', 'created_on' => now()],
        ];

        DB::table('roles')->insert($roles);
    }
}
```

**Run seeders:**

```bash
php artisan db:seed --class=RoleSeeder
# Add more seeder classes as needed
```

#### Step 4: Data Migration (if migrating existing data)

- Export data from SQL Server
- Transform data types if needed (SQL Server → MySQL/PostgreSQL)
- Import data into Laravel database
- Verify data integrity

---

## 3. DEPENDENCY NOTES

### 3.1 Upstream Dependencies
- **None** - This is the foundation module

### 3.2 Downstream Dependencies
- **ALL modules** depend on this module for:
  - User authentication (JWT tokens)
  - Permission checking (authorization)
  - User context (current logged-in user)

### 3.3 Integration Points
- **Microsoft Graph API** - Azure AD user profile validation
- **Employee Management Module** - User data stored in EmployeeData and EmploymentDetail tables
- **Role & Permission Management Module** - Role and permission definitions used for authorization

---

## 4. PENDING CLARIFICATIONS

### 4.1 UNDEFINED in Documentation and Code

1. **SubModule Table Structure**
   - ➤ **UNDEFINED**: Exact table structure not found in 01-04 database scripts
   - **Required Information:** Column names, data types, foreign keys
   - **Impact:** Cannot create Laravel migration until verified
   - **Action:** Search codebase or request schema from team

2. **Permission Table Structure**
   - ➤ **UNDEFINED**: Exact table structure not found in 01-04 database scripts
   - **Required Information:** Column names, data types, foreign keys, how permission values are stored
   - **Impact:** Cannot implement permission checking logic completely
   - **Action:** Search codebase or request schema from team

3. **RolePermission Junction Table Structure**
   - ➤ **UNDEFINED**: Exact table structure not found in 01-04 database scripts
   - **Required Information:** Column names, how roles map to permissions
   - **Impact:** Cannot fetch user permissions by role
   - **Action:** Search codebase or request schema from team

4. **UserRoleMapping Table Structure**
   - ➤ **UNDEFINED**: Exact table structure not found in 01-04 database scripts
   - **Required Information:** Column names, whether one-to-one or one-to-many
   - **Impact:** Cannot determine user's role
   - **Action:** Search codebase or request schema from team

5. **Password Storage Mechanism for Regular Users**
   - ➤ **UNDEFINED**: Documentation mentions AES encryption for test users, but regular user password storage mechanism unclear
   - **Required Information:** Hashing algorithm used (bcrypt, argon2, etc.), salt strategy
   - **Impact:** Cannot implement password verification for standard login
   - **Action:** Search codebase for password hashing logic or request information

### 4.2 Conflicts Detected
- **None identified at this stage**

### 4.3 Assumptions Made
1. Assuming refresh token mechanism matches JWT best practices (7-day expiry documented)
2. Assuming one role per user based on documentation (UserRoleMapping with single role)
3. Assuming bcrypt password hashing for regular users in Laravel migration (standard Laravel practice)
4. Assuming 160+ permissions are flat list or hierarchical (Module → SubModule → Permission structure documented)

---

## 5. TESTING PLAN

### 5.1 Unit Tests (Backend)
- [ ] Test JWT token generation with correct claims
- [ ] Test JWT token validation (valid, expired, tampered)
- [ ] Test refresh token generation and validation
- [ ] Test permission checking logic
- [ ] Test Azure AD token validation (mocked Graph API)
- [ ] Test password verification (after password mechanism verified)

### 5.2 Integration Tests (Backend)
- [ ] Test POST /api/Auth (SSO login) with valid/invalid Azure token
- [ ] Test POST /api/Auth/Login with valid/invalid credentials
- [ ] Test POST /api/Auth/RefreshToken with valid/expired tokens
- [ ] Test GET /api/Auth/CheckHealth
- [ ] Test protected endpoint access with valid/invalid JWT
- [ ] Test permission-based endpoint access

### 5.3 Frontend Tests
- [ ] Test Login component rendering
- [ ] Test form validation (email format, password min length)
- [ ] Test standard login flow (success/failure)
- [ ] Test Azure AD login flow (success/failure)
- [ ] Test token refresh on 401 response
- [ ] Test logout functionality
- [ ] Test permission checking in UI
- [ ] Test route protection (redirect to login if not authenticated)

### 5.4 E2E Tests
- [ ] Complete SSO login flow (Azure AD → Backend → Frontend → Dashboard)
- [ ] Complete standard login flow (Form → Backend → Frontend → Dashboard)
- [ ] Token refresh during session
- [ ] Logout and re-login
- [ ] Access denied for insufficient permissions

---

## 6. ACCEPTANCE CRITERIA

### 6.1 Backend Acceptance Criteria
- [ ] All 4 API endpoints implemented and working
- [ ] JWT tokens generated with correct expiry (24 hours)
- [ ] Refresh tokens generated and stored in database (7-day expiry)
- [ ] Azure AD SSO authentication working with Graph API validation
- [ ] Standard email/password authentication working
- [ ] Permission-based authorization implemented
- [ ] API responses follow standardized format (ApiResponseModel structure)
- [ ] All error scenarios handled gracefully (401, 403, 500)
- [ ] Database migrations created and tested
- [ ] Eloquent models created with relationships

### 6.2 Frontend Acceptance Criteria
- [ ] Login page with SSO and standard login options rendered
- [ ] Form validation working (email, password)
- [ ] Successful login redirects to dashboard
- [ ] Failed login shows error message
- [ ] JWT token stored in localStorage
- [ ] Axios interceptor attaches token to requests
- [ ] Token refresh on 401 response implemented
- [ ] Logout clears tokens and redirects to login
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Permission checking prevents unauthorized access

### 6.3 Integration Acceptance Criteria
- [ ] Frontend successfully calls all backend endpoints
- [ ] Azure AD authentication flow works end-to-end
- [ ] Token refresh works automatically on expiry
- [ ] Session persists across page refreshes (token in localStorage)
- [ ] User can login, navigate protected pages, and logout successfully

---

## 7. ROLLBACK PLAN

### 7.1 Backend Rollback
- [ ] Database migration rollback: `php artisan migrate:rollback`
- [ ] Remove AuthController, AuthService files
- [ ] Remove routes from routes/api.php

### 7.2 Frontend Rollback
- [ ] Remove LoginView.vue and related auth views
- [ ] Remove auth store and services
- [ ] Remove router authentication guards
- [ ] Restore previous authentication implementation (if any)

### 7.3 Data Rollback
- [ ] If data migration was performed, restore from SQL Server backup
- [ ] Verify data integrity after rollback

---

## 8. NOTES

- This module is the **highest priority** (P0) as ALL other modules depend on it
- Must be completed and tested thoroughly before proceeding to other modules
- Azure AD integration requires Azure App Registration configuration (client ID, authority, redirect URI)
- Permission system (160+ permissions) requires table structure verification before full implementation
- Consider using **Laravel Sanctum** for token management (already planned in migration)
- Consider using **Spatie Laravel Permission** package for role/permission management (optional, verify if fits current structure)

---

**END OF MIGRATION PLAN FOR MODULE 1: AUTHENTICATION & AUTHORIZATION**
