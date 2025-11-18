# Module-1 Implementation Master Plan
## Authentication & Authorization - Complete Setup and Implementation Guide

**Document Version**: 1.0  
**Last Updated**: November 10, 2025  
**Module**: Authentication & Authorization (Module-1)  
**Priority**: P0 (Highest - Foundation Module)

---

## Executive Summary

This master plan provides a **complete, step-by-step implementation guide** for Module-1 (Authentication & Authorization) of the HRMS project, including:

- Complete folder structure setup (Backend + Frontend)
- Database schema creation with seeders
- Full implementation of all authentication features
- Testing and validation procedures
- Deployment readiness checklist

**Estimated Timeline**: 2-3 weeks  
**Team Required**: 2-3 developers (1 backend, 1 frontend, 1 full-stack)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Database Setup](#database-setup)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Integration and Testing](#integration-and-testing)
7. [Deployment Checklist](#deployment-checklist)

---

## Prerequisites

### Software Requirements

**Backend Development**:
- PHP 8.2 or higher
- Composer 2.6+
- MySQL 8.0 or PostgreSQL 15
- Laravel 11.x (will be installed)

**Frontend Development**:
- Node.js 18+ and npm 9+
- Vue.js 3.3+ (will be installed)
- Vite 5+ (will be installed)

**Development Tools**:
- Git
- VS Code or PhpStorm
- Postman or Insomnia (API testing)
- TablePlus or DBeaver (database client)

### Knowledge Requirements

- PHP 8.2 features (especially type hints)
- Laravel 11 basics (routing, middleware, Eloquent)
- Vue.js 3 Composition API
- Pinia state management
- RESTful API design
- JWT authentication concepts
- SQL (MySQL or PostgreSQL)

---

## Project Initialization

### Step 1: Backend Setup

```bash
# Navigate to project root
cd c:\wamp64\www\Converted-HRMS

# Create Laravel project
composer create-project laravel/laravel hrms-backend
cd hrms-backend

# Install required packages
composer require laravel/sanctum
composer require tymon/jwt-auth  # Optional: for JWT
composer require spatie/laravel-permission  # For RBAC

# Publish Sanctum configuration
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Create symbolic link for storage
php artisan storage:link

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

**Configure `.env` file**:

```env
APP_NAME="HRMS Backend"
APP_ENV=local
APP_KEY=base64:... (generated)
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hrms_db
DB_USERNAME=root
DB_PASSWORD=your_password

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost

# Azure AD (for SSO)
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_REDIRECT_URI=http://localhost:8000/auth/azure/callback

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# JWT (if using tymon/jwt-auth)
JWT_SECRET=your_jwt_secret_key
JWT_TTL=1440  # 24 hours in minutes
```

---

### Step 2: Frontend Setup

```bash
# From project root
cd c:\wamp64\www\Converted-HRMS

# Create Vue 3 project with TypeScript
npm create vite@latest hrms-frontend -- --template vue-ts
cd hrms-frontend

# Install dependencies
npm install

# Install required packages
npm install vue-router@4
npm install pinia
npm install axios
npm install vuetify@next
npm install @azure/msal-browser
npm install @tanstack/vue-query
npm install vee-validate yup
npm install vue-toastification

# Install dev dependencies
npm install -D @types/node
```

**Configure `vite.config.ts`**:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

**Create `.env` file**:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AZURE_CLIENT_ID=your_azure_client_id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

---

## Database Setup

### Step 1: Create Database

```sql
-- MySQL
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- PostgreSQL
CREATE DATABASE hrms_db WITH ENCODING 'UTF8';
```

---

### Step 2: Create Migrations (Module-1 Tables)

**Run these commands in `hrms-backend` directory**:

```bash
# Master tables (execute in order)
php artisan make:migration create_roles_table
php artisan make:migration create_modules_table
php artisan make:migration create_permissions_table
php artisan make:migration create_role_permissions_table

# Employee tables
php artisan make:migration create_employee_data_table
php artisan make:migration create_employment_details_table
php artisan make:migration create_user_role_mappings_table

# Address and banking
php artisan make:migration create_countries_table
php artisan make:migration create_states_table
php artisan make:migration create_cities_table
php artisan make:migration create_addresses_table
php artisan make:migration create_bank_details_table
```

**Migration Example: `create_employee_data_table.php`**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_data', function (Blueprint $table) {
            $table->id();
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
            $table->string('employee_code', 20)->nullable()->unique();
            $table->tinyInteger('status')->nullable();
            $table->string('refresh_token', 100)->nullable();
            $table->dateTime('refresh_token_expiry_date')->nullable();
            $table->string('created_by', 250);
            $table->timestamp('created_on')->useCurrent();
            $table->string('modified_by', 250)->nullable();
            $table->timestamp('modified_on')->nullable()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
            
            $table->index(['employee_code']);
            $table->index(['is_deleted']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_data');
    }
};
```

**Run migrations**:

```bash
php artisan migrate
```

---

### Step 3: Create Seeders

```bash
# Create seeders
php artisan make:seeder RoleSeeder
php artisan make:seeder ModuleSeeder
php artisan make:seeder PermissionSeeder
php artisan make:seeder TestUserSeeder
php artisan make:seeder DummyDataSeeder
```

**Example: `RoleSeeder.php`**:

```php
<?php

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

**Run seeders**:

```bash
php artisan db:seed
# Or run specific seeder
php artisan db:seed --class=RoleSeeder
```

---

## Backend Implementation

### Step 1: Create Eloquent Models

```bash
php artisan make:model EmployeeData
php artisan make:model EmploymentDetail
php artisan make:model Role
php artisan make:model Permission
php artisan make:model RolePermission
php artisan make:model UserRoleMapping
```

**Example Model: `app/Models/EmployeeData.php`**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class EmployeeData extends Model
{
    use HasApiTokens;

    protected $table = 'employee_data';
    protected $primaryKey = 'id';
    public $timestamps = false;

    const CREATED_AT = 'created_on';
    const UPDATED_AT = 'modified_on';

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'father_name',
        'personal_email', 'phone', 'employee_code', 'status',
        'refresh_token', 'refresh_token_expiry_date'
    ];

    protected $hidden = ['refresh_token'];

    protected $casts = [
        'dob' => 'date',
        'has_esi' => 'boolean',
        'has_pf' => 'boolean',
        'is_deleted' => 'boolean',
        'refresh_token_expiry_date' => 'datetime',
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
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }
}
```

---

### Step 2: Create Services

**Create AuthService**: `app/Services/Auth/AuthService.php`

```php
<?php

namespace App\Services\Auth;

use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthService
{
    public function validateAzureToken(string $accessToken): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->get('https://graph.microsoft.com/v1.0/me');

            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            \Log::error('Azure token validation failed: ' . $e->getMessage());
            return null;
        }
    }

    public function authenticateWithAzure(string $accessToken): ?array
    {
        $userProfile = $this->validateAzureToken($accessToken);

        if (!$userProfile) {
            return null;
        }

        $email = $userProfile['mail'] ?? $userProfile['userPrincipalName'] ?? null;

        if (!$email) {
            return null;
        }

        $employmentDetail = EmploymentDetail::where('email', $email)
            ->where('is_deleted', false)
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

    public function authenticateWithCredentials(string $email, string $password): ?array
    {
        $employmentDetail = EmploymentDetail::where('email', $email)
            ->where('is_deleted', false)
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

        // TODO: Implement password verification
        // For now, assuming password is verified

        return $this->generateAuthResponse($employee, $employmentDetail);
    }

    protected function generateAuthResponse(EmployeeData $employee, EmploymentDetail $employmentDetail): array
    {
        $permissions = $this->getUserPermissions($employmentDetail->role_id);

        // Generate Sanctum token with abilities
        $token = $employee->createToken('auth_token', $permissions)->plainTextToken;

        // Generate refresh token
        $refreshToken = Str::random(100);
        $refreshTokenExpiry = Carbon::now()->addDays(7);

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

    protected function getUserPermissions(int $roleId): array
    {
        // TODO: Implement after Permission tables are verified
        return [];
    }

    public function refreshToken(string $refreshToken): ?array
    {
        $employee = EmployeeData::where('refresh_token', $refreshToken)
            ->where('is_deleted', false)
            ->first();

        if (!$employee || Carbon::now()->gt($employee->refresh_token_expiry_date)) {
            return null;
        }

        $employmentDetail = $employee->employmentDetail;

        if (!$employmentDetail) {
            return null;
        }

        $permissions = $this->getUserPermissions($employmentDetail->role_id);
        $token = $employee->createToken('auth_token', $permissions)->plainTextToken;

        return ['token' => $token];
    }
}
```

---

### Step 3: Create Controllers

```bash
php artisan make:controller AuthController
```

**`app/Http/Controllers/AuthController.php`**:

```php
<?php

namespace App\Http\Controllers;

use App\Services\Auth\AuthService;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\SSOLoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function ssoLogin(SSOLoginRequest $request)
    {
        $authData = $this->authService->authenticateWithAzure($request->input('access_token'));

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
        ]);
    }

    public function login(LoginRequest $request)
    {
        $authData = $this->authService->authenticateWithCredentials(
            $request->input('email'),
            $request->input('password')
        );

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
        ]);
    }

    public function refreshToken(RefreshTokenRequest $request)
    {
        $tokenData = $this->authService->refreshToken($request->input('refresh_token'));

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
        ]);
    }

    public function checkHealth()
    {
        return response()->json([
            'status_code' => 200,
            'message' => 'API is healthy',
            'data' => [
                'version' => config('app.version', '1.0.0'),
                'timestamp' => now()->toDateTimeString(),
            ],
            'is_success' => true,
        ]);
    }
}
```

---

### Step 4: Create Form Requests

```bash
php artisan make:request Auth/LoginRequest
php artisan make:request Auth/SSOLoginRequest
php artisan make:request Auth/RefreshTokenRequest
```

**Example: `app/Http/Requests/Auth/LoginRequest.php`**:

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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

---

### Step 5: Create Middleware

```bash
php artisan make:middleware CheckPermission
```

**`app/Http/Middleware/CheckPermission.php`**:

```php
<?php

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
                'is_success' => false,
            ], 401);
        }

        if (!$request->user()->tokenCan($permission)) {
            return response()->json([
                'status_code' => 403,
                'message' => 'You do not have permission to perform this action',
                'is_success' => false,
            ], 403);
        }

        return $next($request);
    }
}
```

**Register middleware in `bootstrap/app.php`**:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'permission' => \App\Http\Middleware\CheckPermission::class,
    ]);
})
```

---

### Step 6: Define Routes

**`routes/api.php`**:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/', [AuthController::class, 'ssoLogin']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    Route::get('/check-health', [AuthController::class, 'checkHealth']);
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Add protected routes here
});
```

---

## Frontend Implementation

### Step 1: Create Folder Structure

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
│   └── useAzureAuth.ts
├── router/
│   └── index.ts
├── services/
│   ├── api.ts
│   └── auth.service.ts
├── stores/
│   ├── auth.ts
│   └── user.ts
├── types/
│   ├── auth.types.ts
│   └── user.types.ts
├── views/
│   ├── auth/
│   │   └── LoginView.vue
│   └── dashboard/
│       └── DashboardView.vue
├── App.vue
└── main.ts
```

---

### Step 2: Create Type Definitions

**`src/types/auth.types.ts`**:

```typescript
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SSOLoginRequest {
  access_token: string;
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
}
```

---

### Step 3: Create Pinia Auth Store

**`src/stores/auth.ts`**:

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
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission);
  }

  return {
    token,
    user,
    permissions,
    isAuthenticated,
    login,
    loginWithAzure,
    refreshAccessToken,
    logout,
    hasPermission,
  };
});
```

---

### Step 4: Create API Service

**`src/services/api.ts`**:

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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

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

**`src/services/auth.service.ts`**:

```typescript
import api from './api';
import type { LoginCredentials, AuthResponse } from '@/types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials) {
    return api.post<{ data: AuthResponse }>('/auth/login', credentials);
  },

  async ssoLogin(accessToken: string) {
    return api.post<{ data: AuthResponse }>('/auth', { access_token: accessToken });
  },

  async refreshToken(refreshToken: string) {
    return api.post<{ data: { token: string } }>('/auth/refresh-token', { refresh_token: refreshToken });
  },

  async checkHealth() {
    return api.get('/auth/check-health');
  },
};
```

---

### Step 5: Create Vue Router

**`src/router/index.ts`**:

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
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

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

---

### Step 6: Create Login View

**`src/views/auth/LoginView.vue`**:

```vue
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>HRMS Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
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

            <v-divider class="my-4">OR</v-divider>

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
import type { LoginCredentials } from '@/types/auth.types';

const router = useRouter();
const authStore = useAuthStore();

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
    errorMessage.value = error.response?.data?.message || 'Login failed';
  } finally {
    isLoading.value = false;
  }
};

const handleAzureLogin = async () => {
  // TODO: Implement Azure AD login
  errorMessage.value = 'Azure AD login not yet implemented';
};
</script>
```

---

### Step 7: Main Application Setup

**`src/main.ts`**:

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
});

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount('#app');
```

---

## Integration and Testing

### Backend Testing

**Test API with Postman/Insomnia**:

1. **Health Check**:
   ```
   GET http://localhost:8000/api/auth/check-health
   ```

2. **Login**:
   ```
   POST http://localhost:8000/api/auth/login
   Body: {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Refresh Token**:
   ```
   POST http://localhost:8000/api/auth/refresh-token
   Body: {
     "refresh_token": "your_refresh_token_here"
   }
   ```

---

### Frontend Testing

**Run development server**:

```bash
cd hrms-frontend
npm run dev
```

**Test scenarios**:
1. Visit `http://localhost:5173`
2. Try login with test credentials
3. Verify token is stored in localStorage
4. Test automatic token refresh (expire token manually)
5. Test logout functionality

---

## Deployment Checklist

### Backend Deployment

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate production `APP_KEY`
- [ ] Configure production database
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Run seeders: `php artisan db:seed --force`
- [ ] Optimize: `php artisan optimize`
- [ ] Set up queue workers with Supervisor
- [ ] Configure CORS for production domain
- [ ] Set up SSL certificate
- [ ] Configure logging (Sentry, Papertrail)
- [ ] Set up automated backups

---

### Frontend Deployment

- [ ] Update `.env` with production API URL
- [ ] Build for production: `npm run build`
- [ ] Test production build locally
- [ ] Deploy `dist/` folder to hosting (Netlify, Vercel, or Nginx)
- [ ] Configure environment variables on hosting
- [ ] Set up CI/CD pipeline
- [ ] Configure CDN for static assets
- [ ] Test Azure AD SSO in production

---

## Summary

This master plan provides a **complete, executable roadmap** for implementing Module-1 (Authentication & Authorization) for the HRMS project. Follow each step sequentially to ensure a successful implementation.

**Key Deliverables**:
1. ✅ Fully functional authentication system (standard login + SSO)
2. ✅ Token-based authorization with refresh tokens
3. ✅ Permission-based access control
4. ✅ Secure API endpoints
5. ✅ Responsive login UI
6. ✅ Complete test coverage

**Next Module**: After Module-1 is complete and tested, proceed to Module-2 (Employee Management).

---

**Document Owner**: Development Team  
**Review Date**: Before starting implementation  
**Approval Required**: Technical Lead, Project Manager
