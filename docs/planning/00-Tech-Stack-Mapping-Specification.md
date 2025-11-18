# Tech Stack Mapping Specification
## Source vs Target Technology Comparison & Migration Strategy

**Document Version**: 1.0  
**Last Updated**: November 10, 2025  
**Project**: HRMS Conversion (ASP.NET Core + React → Laravel + Vue.js)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Comparison](#architecture-comparison)
3. [Technology Stack Mapping](#technology-stack-mapping)
4. [Framework Feature Mapping](#framework-feature-mapping)
5. [Database Layer Mapping](#database-layer-mapping)
6. [Authentication & Authorization Mapping](#authentication--authorization-mapping)
7. [Frontend Technology Mapping](#frontend-technology-mapping)
8. [Development Tools & Workflow](#development-tools--workflow)
9. [Migration Strategy](#migration-strategy)
10. [Risk Assessment & Mitigation](#risk-assessment--mitigation)

---

## Executive Summary

This document provides a comprehensive mapping between the **source technology stack** (ASP.NET Core + React) and the **target technology stack** (Laravel + Vue.js) for the HRMS project conversion. It defines equivalent technologies, architectural patterns, and migration strategies to ensure a smooth transition while maintaining feature parity and improving maintainability.

### Conversion Overview

| Aspect | Source Stack | Target Stack | Migration Complexity |
|--------|-------------|-------------|---------------------|
| **Backend Framework** | ASP.NET Core 6.0 | Laravel 11.x | Medium |
| **Frontend Framework** | React 18 | Vue.js 3 | Medium |
| **Programming Language (Backend)** | C# | PHP 8.2+ | High |
| **State Management** | Zustand | Pinia | Low |
| **ORM** | Entity Framework Core | Eloquent ORM | Medium |
| **API Architecture** | RESTful Web API | RESTful API | Low |
| **Authentication** | JWT + Azure AD | Laravel Sanctum + JWT | Medium |
| **Database** | SQL Server | MySQL/PostgreSQL | Low |
| **Build Tools** | .NET CLI, Webpack | Composer, Vite | Low |

---

## Architecture Comparison

### Source Architecture (ASP.NET Core + React)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React SPA (Frontend)                   │    │
│  │  - React Router                                      │    │
│  │  - Zustand (State Management)                        │    │
│  │  - Axios (HTTP Client)                               │    │
│  │  - @azure/msal-react (Azure AD)                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼ HTTP/HTTPS (REST API)
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │         ASP.NET Core Web API (Backend)              │    │
│  │  Controllers (AuthController, EmployeeController)   │    │
│  │  ├─ Routing: Attribute-based routing                │    │
│  │  ├─ Middleware: JWT validation, Logging, CORS       │    │
│  │  ├─ Authorization: Custom Permission Handler        │    │
│  │  └─ Dependency Injection: Built-in DI container     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Application Services (C#)                  │    │
│  │  - AuthService: Authentication logic                │    │
│  │  - EmployeeService: Business operations             │    │
│  │  - TokenService: JWT generation/validation          │    │
│  │  └─ DTOs: Request/Response models                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Entity Framework Core (ORM)                 │    │
│  │  - Repositories: Data access abstraction            │    │
│  │  - DbContext: Database connection management        │    │
│  │  - Entities: Data models                             │    │
│  │  - Migrations: Database versioning                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
│                      SQL Server 2019                         │
└─────────────────────────────────────────────────────────────┘
```

### Target Architecture (Laravel + Vue.js)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Vue.js 3 SPA (Frontend)                │    │
│  │  - Vue Router                                        │    │
│  │  - Pinia (State Management)                          │    │
│  │  - Axios (HTTP Client)                               │    │
│  │  - @azure/msal-browser (Azure AD)                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼ HTTP/HTTPS (REST API)
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Laravel 11.x Web API (Backend)             │    │
│  │  Controllers (AuthController, EmployeeController)   │    │
│  │  ├─ Routing: routes/api.php                          │    │
│  │  ├─ Middleware: Sanctum, Logging, CORS              │    │
│  │  ├─ Authorization: Gates, Policies, Middleware      │    │
│  │  └─ Dependency Injection: Service Container         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Application Services (PHP)                 │    │
│  │  - AuthService: Authentication logic                │    │
│  │  - EmployeeService: Business operations             │    │
│  │  - TokenService: JWT generation/validation          │    │
│  │  └─ Resources: API response formatting              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Eloquent ORM (Laravel)                   │    │
│  │  - Models: Eloquent models (EmployeeData, etc.)     │    │
│  │  - Relationships: Eloquent relationships            │    │
│  │  - Query Builder: Fluent query interface            │    │
│  │  - Migrations: Database versioning                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
│                 MySQL 8.0 / PostgreSQL 15                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Mapping

### Backend Framework Layer

| Component | Source (ASP.NET Core) | Target (Laravel) | Migration Notes |
|-----------|---------------------|------------------|-----------------|
| **Framework** | ASP.NET Core 6.0 | Laravel 11.x | Both follow MVC pattern; Laravel has more opinionated structure |
| **Language** | C# 10 | PHP 8.2+ | Strong typing in C# → PHP 8.2 type hints |
| **Routing** | Attribute-based routing in controllers | Route definitions in `routes/api.php` | Laravel uses centralized routing files |
| **Controllers** | `ApiController` base class | `Controller` base class | Similar structure, but Laravel uses traits for common functionality |
| **Middleware** | Pipeline-based middleware | HTTP Middleware | Functionally equivalent, different registration syntax |
| **Dependency Injection** | Built-in DI container with constructor injection | Service Container with constructor injection | Both support auto-resolution |
| **Configuration** | `appsettings.json` | `.env` file + config files | Laravel uses `.env` for environment-specific, config files for defaults |
| **Validation** | FluentValidation or Data Annotations | Form Request Validation | Laravel validation is more concise, built-in |
| **HTTP Responses** | ActionResult, IActionResult | JsonResponse, Response facade | Laravel has simpler response helpers |
| **Error Handling** | Exception filters, middleware | Exception Handler class | Laravel has centralized exception handling |

**Migration Strategy**:
- Convert C# classes to PHP classes (manual conversion required)
- Map ASP.NET Core attributes to Laravel routes
- Replace FluentValidation with Laravel Form Requests
- Convert DI container registrations to Laravel Service Providers

---

### ORM & Data Access Layer

| Component | Source (Entity Framework Core) | Target (Eloquent ORM) | Migration Notes |
|-----------|-------------------------------|----------------------|-----------------|
| **ORM Framework** | Entity Framework Core 6.0 | Eloquent ORM | Both provide full ORM capabilities |
| **Entity Models** | C# classes with attributes | PHP classes extending `Model` | Similar concept, different syntax |
| **Database Context** | `DbContext` class | Automatic via `Model` base class | Laravel models auto-connect to DB |
| **Migrations** | Code-first migrations with `DbContext` | Migration files in `database/migrations/` | Both support version control of schema |
| **Relationships** | Navigation properties with `[ForeignKey]` | Eloquent relationship methods | Laravel uses methods: `hasMany()`, `belongsTo()` |
| **Query Syntax** | LINQ to Entities | Eloquent query builder | Different syntax, similar capabilities |
| **Lazy Loading** | Supported with virtual properties | Supported by default | Laravel can be configured to disable lazy loading |
| **Eager Loading** | `.Include()` method | `.with()` method | Functionally equivalent |
| **Soft Deletes** | Manual implementation with `IsDeleted` | Built-in `SoftDeletes` trait | Laravel has native support |
| **Timestamps** | Manual `CreatedOn`, `ModifiedOn` | Automatic `created_at`, `updated_at` | Laravel handles automatically |
| **Transactions** | `BeginTransaction()`, `Commit()`, `Rollback()` | `DB::transaction()` closure | Laravel syntax is simpler |
| **Raw Queries** | `.FromSqlRaw()` | `DB::raw()`, `DB::statement()` | Both support raw SQL |

**Code Comparison**:

**Entity Framework Core (C#)**:
```csharp
public class EmployeeData
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; }
    
    public virtual ICollection<Address> Addresses { get; set; }
}

// Query
var employees = await _context.EmployeeData
    .Include(e => e.Addresses)
    .Where(e => !e.IsDeleted)
    .ToListAsync();
```

**Eloquent ORM (PHP)**:
```php
class EmployeeData extends Model
{
    protected $table = 'employee_data';
    protected $fillable = ['first_name'];
    
    public function addresses()
    {
        return $this->hasMany(Address::class, 'employee_id');
    }
}

// Query
$employees = EmployeeData::with('addresses')
    ->where('is_deleted', false)
    ->get();
```

---

### Authentication & Authorization Layer

| Component | Source (ASP.NET Core) | Target (Laravel) | Migration Notes |
|-----------|---------------------|------------------|-----------------|
| **JWT Library** | `System.IdentityModel.Tokens.Jwt` | `tymon/jwt-auth` or `firebase/php-jwt` | Laravel Sanctum is alternative (token-based) |
| **Token Generation** | Manual JWT generation with symmetric key | JWT package or Sanctum tokens | Laravel Sanctum simpler for SPA authentication |
| **Token Validation** | JWT middleware with signature validation | Sanctum middleware or JWT middleware | Sanctum validates tokens against database |
| **Refresh Tokens** | Manual implementation with database storage | Manual or Sanctum personal access tokens | Sanctum supports token revocation natively |
| **Azure AD Integration** | Microsoft.Identity.Web | Laravel Socialite or manual Graph API | Socialite supports Azure AD OAuth |
| **Permission System** | Custom `PermissionAuthorizationHandler` | Gates, Policies, or Spatie Permission package | Laravel has built-in Gates/Policies |
| **Role-Based Access** | Custom `HasPermission` attribute | Middleware, Gates, or Spatie Roles | Spatie package provides full RBAC |
| **Authorization Middleware** | `IAuthorizationMiddleware` | Custom middleware or Gate checks | Laravel middleware can check permissions |
| **Claims-Based Auth** | ClaimsPrincipal with custom claims | Token abilities (Sanctum) or JWT claims | Sanctum abilities similar to claims |

**Code Comparison**:

**ASP.NET Core JWT (C#)**:
```csharp
[HasPermission(Permissions.Employee.View)]
public async Task<IActionResult> GetEmployees()
{
    var employees = await _service.GetAllAsync();
    return Ok(employees);
}
```

**Laravel with Sanctum (PHP)**:
```php
Route::middleware(['auth:sanctum', 'permission:employee.view'])
    ->get('/employees', [EmployeeController::class, 'index']);
```

---

### Frontend Framework Layer

| Component | Source (React) | Target (Vue.js 3) | Migration Notes |
|-----------|---------------|-------------------|-----------------|
| **Framework** | React 18 | Vue.js 3 (Composition API) | Both component-based, different reactivity models |
| **Component Syntax** | JSX (JavaScript XML) | Single File Components (SFC) `.vue` files | Vue uses template syntax, React uses JSX |
| **State Management** | Zustand | Pinia | Both lightweight, Pinia is Vue's official store |
| **Routing** | React Router v6 | Vue Router v4 | Similar API, different setup |
| **HTTP Client** | Axios | Axios (same library) | No migration needed |
| **Form Handling** | Controlled components | v-model directive | Vue's v-model is more concise |
| **Validation** | Custom or libraries (Yup) | VeeValidate or custom | VeeValidate is Vue-specific |
| **UI Framework** | Material-UI or custom | Vuetify 3 | Both Material Design implementations |
| **Build Tool** | Webpack/Create React App | Vite | Vite is faster, modern build tool |
| **TypeScript Support** | Full support | Full support | Both have excellent TS integration |
| **Reactivity** | useState, useEffect hooks | ref, reactive, computed | Different reactivity systems |
| **Lifecycle Hooks** | useEffect, useLayoutEffect | onMounted, onUnmounted | Similar concepts, different syntax |

**Code Comparison**:

**React Component**:
```jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Vue 3 Component (Composition API)**:
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" />
    <input v-model="password" type="password" />
    <button type="submit">Login</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();

const handleSubmit = async () => {
  await authStore.login({ email: email.value, password: password.value });
};
</script>
```

---

### State Management Mapping

| Feature | Zustand (React) | Pinia (Vue.js) | Migration Notes |
|---------|----------------|----------------|-----------------|
| **Store Definition** | `create()` function | `defineStore()` function | Similar API, different syntax |
| **State** | Properties in store object | `state: () => ({})` function | Pinia uses function for reactivity |
| **Getters** | Computed properties | `getters: {}` object | Same concept |
| **Actions** | Methods in store | `actions: {}` object | Functionally identical |
| **DevTools** | Redux DevTools | Vue DevTools | Different tools |
| **TypeScript** | Manual typing | Strong type inference | Pinia has better TS support |
| **Persistence** | zustand/middleware | pinia-plugin-persistedstate | Plugins available for both |

**Code Comparison**:

**Zustand Store (React)**:
```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    const response = await authService.login(credentials);
    set({ 
      token: response.token, 
      user: response.user, 
      isAuthenticated: true 
    });
  },
  
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));
```

**Pinia Store (Vue.js)**:
```javascript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null);
  const user = ref(null);
  
  const isAuthenticated = computed(() => !!token.value);
  
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    token.value = response.token;
    user.value = response.user;
  };
  
  const logout = () => {
    token.value = null;
    user.value = null;
  };
  
  return { token, user, isAuthenticated, login, logout };
});
```

---

## Framework Feature Mapping

### Middleware & Request Pipeline

| Feature | ASP.NET Core | Laravel | Equivalent Implementation |
|---------|-------------|---------|--------------------------|
| **JWT Authentication** | `UseAuthentication()` middleware | `auth:sanctum` middleware | Both validate tokens before controller |
| **CORS Configuration** | `UseCors()` middleware | `cors` middleware | Laravel config in `config/cors.php` |
| **Logging** | `ILogger` injection | `Log` facade | Both provide log levels (Info, Error, etc.) |
| **Rate Limiting** | Custom middleware or AspNetCoreRateLimit | `throttle` middleware | Laravel built-in, ASP.NET needs package |
| **Exception Handling** | Exception filter or middleware | `App\Exceptions\Handler` | Laravel centralizes all exceptions |
| **Request Validation** | ModelState validation | Form Request validation | Laravel validation more concise |

---

### Database Migrations

| Feature | Entity Framework Core | Laravel Migrations | Migration Strategy |
|---------|---------------------|-------------------|-------------------|
| **Create Migration** | `dotnet ef migrations add` | `php artisan make:migration` | Manual recreation required |
| **Apply Migration** | `dotnet ef database update` | `php artisan migrate` | Same concept |
| **Rollback** | `dotnet ef database update <previous>` | `php artisan migrate:rollback` | Laravel simpler |
| **Schema Definition** | Fluent API in `OnModelCreating()` | Schema builder in migration | Laravel uses fluent methods |
| **Data Seeding** | `OnModelCreating()` or separate seeder | `database/seeders/` classes | Laravel has structured approach |

**Code Comparison**:

**Entity Framework Core Migration (C#)**:
```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateTable(
        name: "EmployeeData",
        columns: table => new
        {
            Id = table.Column<long>(nullable: false)
                .Annotation("SqlServer:Identity", "1, 1"),
            FirstName = table.Column<string>(maxLength: 50, nullable: false),
            Email = table.Column<string>(maxLength: 100, nullable: true),
            CreatedOn = table.Column<DateTime>(nullable: false, defaultValueSql: "GETDATE()")
        },
        constraints: table =>
        {
            table.PrimaryKey("PK_EmployeeData", x => x.Id);
        });
}
```

**Laravel Migration (PHP)**:
```php
public function up()
{
    Schema::create('employee_data', function (Blueprint $table) {
        $table->id(); // bigint unsigned auto_increment primary key
        $table->string('first_name', 50);
        $table->string('email', 100)->nullable();
        $table->timestamp('created_on')->useCurrent();
    });
}
```

---

### API Response Formatting

| Feature | ASP.NET Core | Laravel | Migration Notes |
|---------|-------------|---------|-----------------|
| **Success Response** | `return Ok(data)` | `return response()->json($data)` | Laravel uses response() helper |
| **Error Response** | `return BadRequest(error)` | `return response()->json($error, 400)` | Same concept, different syntax |
| **Resource Transformation** | Custom DTOs | API Resources | Laravel Resources map models to JSON |
| **Pagination** | Manual or PagedList package | `->paginate()` method | Laravel has built-in pagination |
| **Status Codes** | Enum or constants | Constants or helpers | Both support HTTP status codes |

**Code Comparison**:

**ASP.NET Core Response**:
```csharp
public IActionResult GetEmployee(long id)
{
    var employee = _service.GetById(id);
    if (employee == null)
        return NotFound(new { message = "Employee not found" });
    
    return Ok(new { 
        status_code = 200,
        data = employee,
        is_success = true 
    });
}
```

**Laravel Response**:
```php
public function show($id)
{
    $employee = Employee::find($id);
    if (!$employee) {
        return response()->json([
            'status_code' => 404,
            'message' => 'Employee not found',
            'is_success' => false
        ], 404);
    }
    
    return response()->json([
        'status_code' => 200,
        'data' => $employee,
        'is_success' => true
    ]);
}
```

---

## Database Layer Mapping

### SQL Server vs MySQL/PostgreSQL

| Feature | SQL Server (Source) | MySQL 8.0 (Target) | PostgreSQL 15 (Alternative) | Migration Notes |
|---------|---------------------|-------------------|----------------------------|-----------------|
| **Data Types** | BIGINT, VARCHAR, DATETIME, BIT | BIGINT, VARCHAR, DATETIME, TINYINT(1) | BIGINT, VARCHAR, TIMESTAMP, BOOLEAN | Minor adjustments needed |
| **Identity Columns** | `IDENTITY(1,1)` | `AUTO_INCREMENT` | `SERIAL` or `GENERATED` | Laravel handles automatically |
| **Date Functions** | `GETDATE()`, `GETUTCDATE()` | `NOW()`, `UTC_TIMESTAMP()` | `NOW()`, `CURRENT_TIMESTAMP` | Laravel uses DB-agnostic methods |
| **String Functions** | `CONCAT()`, `SUBSTRING()` | `CONCAT()`, `SUBSTRING()` | `CONCAT()`, `SUBSTRING()` | Same functions |
| **JSON Support** | JSON type | JSON type | JSONB type (better performance) | All support JSON |
| **Full-Text Search** | Full-Text Index | Full-Text Index | TSVector, TSQuery | Different implementations |
| **Stored Procedures** | Transact-SQL | MySQL procedures | PL/pgSQL | Laravel prefers Eloquent over stored procs |
| **Transactions** | BEGIN TRANSACTION, COMMIT, ROLLBACK | START TRANSACTION, COMMIT, ROLLBACK | BEGIN, COMMIT, ROLLBACK | Laravel abstracts differences |

**Recommendation**: Use **MySQL 8.0** for easier hosting compatibility, or **PostgreSQL 15** for advanced features (JSONB, better concurrency).

---

### Data Type Conversion Table

| SQL Server | MySQL 8.0 | PostgreSQL 15 | Laravel Migration |
|-----------|----------|--------------|-------------------|
| `BIGINT` | `BIGINT` | `BIGINT` | `$table->bigInteger()` or `$table->id()` |
| `INT` | `INT` | `INTEGER` | `$table->integer()` |
| `TINYINT` | `TINYINT` | `SMALLINT` | `$table->tinyInteger()` |
| `BIT` | `TINYINT(1)` | `BOOLEAN` | `$table->boolean()` |
| `VARCHAR(n)` | `VARCHAR(n)` | `VARCHAR(n)` | `$table->string('col', n)` |
| `NVARCHAR(n)` | `VARCHAR(n)` | `VARCHAR(n)` | `$table->string('col', n)` |
| `TEXT` | `TEXT` | `TEXT` | `$table->text()` |
| `DATETIME` | `DATETIME` | `TIMESTAMP` | `$table->dateTime()` |
| `DATE` | `DATE` | `DATE` | `$table->date()` |
| `TIME` | `TIME` | `TIME` | `$table->time()` |
| `DECIMAL(p,s)` | `DECIMAL(p,s)` | `NUMERIC(p,s)` | `$table->decimal('col', p, s)` |
| `FLOAT` | `FLOAT` | `REAL` | `$table->float()` |
| `UNIQUEIDENTIFIER` | `CHAR(36)` | `UUID` | `$table->uuid()` |
| `VARBINARY` | `VARBINARY` | `BYTEA` | `$table->binary()` |

---

## Development Tools & Workflow

### Build & Package Management

| Tool | Source Stack | Target Stack | Migration Notes |
|------|-------------|-------------|-----------------|
| **Backend Package Manager** | NuGet | Composer | PHP equivalent of NuGet |
| **Frontend Package Manager** | npm/yarn | npm/yarn (same) | No change |
| **Backend Build Tool** | .NET CLI (`dotnet build`) | N/A (PHP is interpreted) | No build step needed |
| **Frontend Build Tool** | Webpack/CRA | Vite | Vite is faster |
| **Code Formatting** | .editorconfig, StyleCop | PHP CS Fixer, Laravel Pint | Laravel Pint is official |
| **Linting** | Roslyn analyzers | PHPStan, Larastan | Larastan for Laravel-specific rules |
| **Testing Framework** | xUnit, NUnit | PHPUnit, Pest | Pest is modern Laravel testing |
| **API Documentation** | Swagger/OpenAPI | Swagger via l5-swagger | Same OpenAPI standard |
| **Dependency Injection** | Built-in DI container | Laravel Service Container | Both auto-resolve dependencies |

---

### Development Environment

| Component | Source Stack | Target Stack | Notes |
|-----------|-------------|-------------|-------|
| **IDE** | Visual Studio 2022, VS Code | VS Code, PhpStorm | PhpStorm best for Laravel |
| **Debugging** | Visual Studio Debugger, xdebug | Xdebug, Laravel Debugbar | Xdebug for PHP step debugging |
| **Local Server** | IIS Express, Kestrel | Laravel Valet, XAMPP, Docker | Valet for macOS, XAMPP for Windows |
| **Database Client** | SQL Server Management Studio | TablePlus, DBeaver | Cross-platform clients |
| **API Testing** | Postman, Insomnia | Postman, Insomnia (same) | No change |
| **Version Control** | Git | Git (same) | No change |

---

## Migration Strategy

### Phase 1: Infrastructure Setup

1. **Backend Setup**:
   - Install Laravel 11.x: `composer create-project laravel/laravel hrms-backend`
   - Configure `.env` file with database credentials
   - Install Laravel Sanctum: `composer require laravel/sanctum`
   - Install JWT package (optional): `composer require tymon/jwt-auth`
   - Configure CORS in `config/cors.php`

2. **Frontend Setup**:
   - Create Vue 3 project: `npm create vite@latest hrms-frontend -- --template vue-ts`
   - Install Pinia: `npm install pinia`
   - Install Vue Router: `npm install vue-router@4`
   - Install Vuetify 3: `npm install vuetify@next`
   - Install Axios: `npm install axios`

3. **Database Setup**:
   - Export SQL Server schema
   - Convert to MySQL/PostgreSQL compatible schema
   - Create Laravel migrations from schema
   - Create seeders for master data

---

### Phase 2: Core Module Migration (Module 1 - Authentication)

1. **Backend Migration**:
   - Create Eloquent models (EmployeeData, EmploymentDetail, etc.)
   - Create AuthService with login, SSO, refresh token logic
   - Create AuthController with endpoints
   - Implement Sanctum token authentication
   - Create permission checking middleware
   - Create Form Request validators

2. **Frontend Migration**:
   - Convert React login component to Vue SFC
   - Create Pinia auth store
   - Implement Azure AD integration with @azure/msal-browser
   - Create Axios interceptors for token attachment
   - Implement protected routes with Vue Router

3. **Testing**:
   - Write PHPUnit tests for AuthService
   - Write Pest tests for API endpoints
   - Write Vitest tests for Vue components
   - Test E2E with Cypress or Playwright

---

### Phase 3: Incremental Module Migration

- **Order**: Follow module dependencies (Auth → Employee → Leave → etc.)
- **Strategy**: Migrate one module at a time
- **Validation**: Test each module thoroughly before proceeding
- **Rollback Plan**: Keep source code accessible for reference

---

## Risk Assessment & Mitigation

### High-Risk Areas

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **C# to PHP Conversion Errors** | High | Use automated tools where possible, thorough code review |
| **Database Type Incompatibility** | Medium | Use Laravel's database abstraction, test migrations thoroughly |
| **Business Logic Translation** | High | Document complex logic, unit test extensively |
| **Performance Degradation** | Medium | Profile both stacks, optimize queries, use caching (Redis) |
| **Azure AD Integration Complexity** | Medium | Use Laravel Socialite, test SSO flow early |
| **Permission System Complexity** | High | Use Spatie Laravel Permission package or custom middleware |

---

### Medium-Risk Areas

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **JWT Token Compatibility** | Medium | Ensure same signing algorithm (HS256), validate claims structure |
| **Stored Procedure Conversion** | Medium | Convert to Eloquent queries or keep as raw queries |
| **Date/Time Handling** | Low | Use Carbon (PHP) vs DateTime (C#), test timezone handling |
| **File Upload Handling** | Low | Laravel has robust file handling, test large file uploads |
| **API Response Format Changes** | Low | Maintain consistent response structure, use API Resources |

---

## Technology Recommendation Summary

### Recommended Stack

```
Frontend:
- Vue.js 3.3+ (Composition API)
- Pinia 2.1+ (state management)
- Vue Router 4
- Vuetify 3 (Material Design)
- Axios
- Vite (build tool)
- TypeScript (optional but recommended)

Backend:
- Laravel 11.x
- PHP 8.2+
- Laravel Sanctum (SPA authentication)
- Laravel Horizon (queue management)
- Laravel Telescope (debugging)
- Spatie Laravel Permission (RBAC)
- Laravel Pint (code formatting)
- Pest (testing)

Database:
- MySQL 8.0 (recommended for compatibility)
- OR PostgreSQL 15 (if advanced features needed)

DevOps:
- Docker (containerization)
- GitHub Actions (CI/CD)
- Redis (caching, queue)
- Supervisor (queue workers)
```

---

## Conclusion

This tech stack mapping provides a comprehensive guide for migrating from **ASP.NET Core + React** to **Laravel + Vue.js**. Both stacks are modern, production-ready, and follow similar architectural patterns, making the migration feasible with careful planning and execution.

**Key Takeaways**:
1. Laravel and ASP.NET Core share similar MVC architecture
2. Eloquent ORM closely matches Entity Framework Core capabilities
3. Vue.js 3 with Composition API provides similar developer experience to React Hooks
4. Pinia is functionally equivalent to Zustand
5. Database migration from SQL Server to MySQL/PostgreSQL is straightforward
6. Authentication can use Laravel Sanctum (simpler) or JWT (closer to current implementation)

**Next Steps**:
1. Set up development environments
2. Create database migrations
3. Implement Module 1 (Authentication) as proof of concept
4. Validate performance and functionality
5. Proceed with remaining modules

---

**Document Owner**: Development Team  
**Review Cycle**: Quarterly  
**Version History**:
- v1.0 (2025-11-10): Initial document creation

