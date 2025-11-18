# Module 10: Role & Permission Management

## Module Overview

**Module Name:** Role & Permission Management  
**Module ID:** 10  
**Purpose:** Comprehensive role-based access control (RBAC) system to manage user roles, assign permissions, and control access to HRMS features through a hierarchical module-permission structure. Enables administrators to create custom roles, define granular permissions, and secure API endpoints.

**Technology Stack:**
- Backend: ASP.NET Core 8.0 Web API
- Authorization: ASP.NET Core Authorization with custom policy handlers
- Database: SQL Server with stored procedures
- ORM: Dapper for database operations
- Security: JWT claims-based authentication with permission claims

**Key Capabilities:**
- Create, update, and delete roles
- Assign permissions to roles (module-permission hierarchy)
- HasPermission attribute for API endpoint security
- Permission checking via JWT claims
- Module-based permission grouping
- Role-user assignment
- Permission inheritance through roles
- Audit trail for role changes (email notifications)

---

## Architecture Overview

### Components

**1. HasPermissionAttribute**
- **Location:** `HRMS.API/Athorization/HasPermissionAttribute.cs`
- **Purpose:** Attribute to secure API endpoints with permission-based authorization
- **Usage:** `[HasPermission(Permissions.CreateEmployee)]`
- **Extends:** `AuthorizeAttribute` with custom policy

**2. PermissionAuthorizationHandler**
- **Location:** `HRMS.API/Athorization/PermissionAuthorizationHandler.cs`
- **Purpose:** Authorization handler to validate user permissions from JWT claims
- **Logic:** Checks if user's permission claims contain required permission
- **Claims:** Permission stored in claim type `"permission"` (defined in `ApplicationConstants.PermissionClaimName`)

**3. RolePermissionService**
- **Location:** `HRMS.Application/Services/RolePermissionService.cs`
- **Purpose:** Business logic for role and permission management
- **Methods:**
  - `GetRoles()`: Paginated role list with user count
  - `GetModulePermissionsByRole(roleId)`: Role's permissions grouped by module
  - `SaveRolePermissions()`: Create/update role with permissions
  - `GetPermissionList()`: All modules with permissions (for role creation)
  - `GetRolesList()`: All roles for dropdown

**4. RolePermissionRepository**
- **Location:** `HRMS.Infrastructure/Repositories/RolePermissionRepository.cs`
- **Purpose:** Database operations for roles and permissions
- **Stored Procedures:** `SaveRolePermissions`, `GetRoleListWithUserCount`

---

## Database Schema

### 1. Role Table
```sql
CREATE TABLE Role (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy NVARCHAR(100) NULL,
    ModifiedOn DATETIME NULL
)
```

**Default Roles:**
- Super Admin (RoleId = 1)
- HR (RoleId = 2)
- Employee (RoleId = 3)
- Accounts (RoleId = 4)

---

### 2. Permission Table
```sql
CREATE TABLE Permission (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Value NVARCHAR(200) NOT NULL, -- Permission constant (e.g., "Employee.Create")
    ModuleId INT NOT NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy NVARCHAR(100) NULL,
    ModifiedOn DATETIME NULL,
    FOREIGN KEY (ModuleId) REFERENCES Module(Id)
)
```

**Permission Examples:**
- Name: "Create Employee", Value: "Employee.Create", ModuleId: 1
- Name: "Edit Employee", Value: "Employee.Edit", ModuleId: 1
- Name: "Delete Employee", Value: "Employee.Delete", ModuleId: 1
- Name: "View Employee", Value: "Employee.View", ModuleId: 1

---

### 3. Module Table
```sql
CREATE TABLE Module (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ModuleName NVARCHAR(100) NOT NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy NVARCHAR(100) NULL,
    ModifiedOn DATETIME NULL
)
```

**Modules:**
- Employee Management (ModuleId = 1)
- Attendance Management (ModuleId = 2)
- Leave Management (ModuleId = 3)
- Asset Management (ModuleId = 4)
- Exit Management (ModuleId = 5)
- Company Policy (ModuleId = 6)
- Role Management (ModuleId = 7)
- Reporting (ModuleId = 8)

---

### 4. RolePermission Table
```sql
CREATE TABLE RolePermission (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    RoleId INT NOT NULL,
    PermissionId INT NOT NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    CreatedOn DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy NVARCHAR(100) NULL,
    ModifiedOn DATETIME NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (RoleId) REFERENCES Role(Id),
    FOREIGN KEY (PermissionId) REFERENCES Permission(Id)
)
```

**Many-to-Many Relationship:** A role can have multiple permissions, a permission can belong to multiple roles.

---

### 5. Stored Procedure: SaveRolePermissions
```sql
CREATE TYPE dbo.PermissionIdTableType AS TABLE (
    PermissionId INT
);

CREATE OR ALTER PROCEDURE SaveRolePermissions
    @RoleId INT,
    @PermissionIds dbo.PermissionIdTableType READONLY
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Delete existing permissions for role
        DELETE FROM RolePermission WHERE RoleId = @RoleId;
        
        -- Insert new permissions
        INSERT INTO RolePermission (RoleId, PermissionId, CreatedBy, CreatedOn, IsActive)
        SELECT @RoleId, PermissionId, 'admin', GETUTCDATE(), 1 
        FROM @PermissionIds;
        
        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;
```

---

## Features List

### Feature 1: Create Role with Permissions
**Description:** HR Admin creates a new role (e.g., "Manager") and assigns specific permissions to control access to HRMS features.

**Business Rules:**
- Role name required (min 3 characters)
- Role name must be unique
- At least 1 permission must be selected
- Permissions grouped by modules
- Checkbox selection for permissions (select/deselect all per module)
- Email notification sent on role creation
- Default status: Active

**User Interactions:**
1. HR Admin navigates to "Roles" page
2. Clicks "Add New Role" button
3. Role creation form opens
4. Admin enters role name: "Team Lead"
5. Admin sees module list with permissions:
   ```
   ☑️ Employee Management
       ☑️ View Employee
       ☑️ Edit Employee
       ☐ Create Employee
       ☐ Delete Employee
   
   ☑️ Attendance Management
       ☑️ View Attendance
       ☑️ View Team Attendance
       ☐ Manage Attendance Configuration
   
   ☑️ Leave Management
       ☑️ View Leave
       ☑️ Approve Team Leave
       ☐ Manage All Leaves
   ```
6. Admin selects permissions (19 permissions selected)
7. Admin clicks "Save"
8. Frontend calls `POST /api/RolePermission/SaveRolePermissions`
9. Backend validates request
10. Backend creates role in `Role` table (RoleId = 5)
11. Backend inserts 19 RolePermission records
12. Email notification sent to Super Admin: "New role 'Team Lead' created on Nov 01, 2025"
13. Success message: "Role created successfully"
14. Admin redirected to roles list

**API Request:**
```json
{
  "roleId": 0,
  "roleName": "Team Lead",
  "isRoleNameUpdate": false,
  "isRolePermissionUpdate": true,
  "permissionList": [1, 2, 10, 11, 20, 21, 22, ...]
}
```

---

### Feature 2: View Role Permissions
**Description:** View permissions assigned to a specific role, grouped by module.

**Business Rules:**
- Display permissions grouped by modules
- Show active/inactive status for each permission
- Module marked active if any permission active
- Read-only view for non-admin roles

**Data Flow:**
1. Admin clicks "View" on role "HR" in roles list
2. Frontend calls `GET /api/RolePermission/GetModulePermissionsByRole?roleId=2`
3. Repository queries:
```sql
SELECT P.Id AS PermissionId, P.Name AS PermissionName, 
       M.Id AS ModuleId, M.ModuleName, R.Name AS RoleName,
       CASE WHEN RP.Id IS NOT NULL THEN 1 ELSE 0 END AS IsActive
FROM Permission P
JOIN Module M ON P.ModuleId = M.Id
LEFT JOIN RolePermission RP ON RP.PermissionId = P.Id AND RP.RoleId = @RoleId
LEFT JOIN Role R ON RP.RoleId = R.Id
```
4. Service groups permissions by module
5. API returns structured response:
```json
{
  "roleId": 2,
  "roleName": "HR",
  "modules": [
    {
      "moduleId": 1,
      "moduleName": "Employee Management",
      "isActive": true,
      "permissions": [
        { "permissionId": 1, "permissionName": "Create Employee", "isActive": true },
        { "permissionId": 2, "permissionName": "Edit Employee", "isActive": true },
        { "permissionId": 3, "permissionName": "Delete Employee", "isActive": true },
        { "permissionId": 4, "permissionName": "View Employee", "isActive": true }
      ]
    },
    ...
  ]
}
```

---

### Feature 3: Update Role Permissions
**Description:** Modify permissions assigned to an existing role.

**Business Rules:**
- Can update role name OR permissions OR both
- `isRoleNameUpdate` flag indicates role name change
- `isRolePermissionUpdate` flag indicates permission change
- Old permissions deleted, new permissions inserted (replace operation)
- Cannot remove all permissions (at least 1 required)

**Update Flow:**
1. Admin clicks "Edit" on role "Manager" (RoleId = 5)
2. Frontend calls `GET /api/RolePermission/GetModulePermissionsByRole?roleId=5`
3. Form populated with existing permissions
4. Admin adds "Create Employee" permission
5. Admin removes "Delete Employee" permission
6. Admin clicks "Save"
7. Frontend calls `POST /api/RolePermission/SaveRolePermissions`:
```json
{
  "roleId": 5,
  "roleName": "Manager",
  "isRoleNameUpdate": false,
  "isRolePermissionUpdate": true,
  "permissionList": [1, 2, 4, 10, 11, 20, 21, ...]
}
```
8. Backend validates request
9. Backend calls `SaveRolePermissions` stored procedure:
   - Deletes existing RolePermission records for RoleId = 5
   - Inserts new RolePermission records for selected permissions
10. Success response returned
11. UI shows "Role updated successfully"

---

### Feature 4: Permission-Based API Security
**Description:** Secure API endpoints using `[HasPermission]` attribute to restrict access based on user's role permissions.

**Implementation:**
```csharp
[HttpPost]
[Route("AddEmployee")]
[HasPermission(Permissions.CreateEmployee)]
public async Task<IActionResult> AddEmployee(EmployeeRequestDto request)
{
    // Only users with "Employee.Create" permission can access
    var result = await _employeeService.AddEmployeeAsync(request);
    return StatusCode(result.StatusCode, result);
}
```

**Authorization Flow:**
1. User logs in, receives JWT token
2. Token contains permission claims:
```json
{
  "userId": "5678",
  "roleId": "2",
  "roleName": "HR",
  "permission": ["Employee.Create", "Employee.Edit", "Employee.View", ...]
}
```
3. User calls API: `POST /api/Employee/AddEmployee`
4. ASP.NET Core Authorization middleware checks:
   - Is user authenticated? (JWT token valid?)
   - Does user have required permission? (`Employee.Create`)
5. `PermissionAuthorizationHandler.HandleRequirementAsync()` executes:
```csharp
var permissions = context.User.Claims
    .Where(c => c.Type == "permission")
    .Select(c => c.Value);
    
if (permissions.Contains("Employee.Create"))
    context.Succeed(requirement);
```
6. **If permission exists:** Request proceeds to controller action
7. **If permission missing:** 403 Forbidden response returned

**Error Response (No Permission):**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "result": null
}
```

---

### Feature 5: Module-Permission Hierarchy
**Description:** Organize permissions into modules for better management and UI grouping.

**Structure:**
```
Module: Employee Management
├─ Permission: Create Employee (Value: Employee.Create)
├─ Permission: Edit Employee (Value: Employee.Edit)
├─ Permission: Delete Employee (Value: Employee.Delete)
├─ Permission: View Employee (Value: Employee.View)
├─ Permission: View All Employees (Value: Employee.ViewAll)
└─ Permission: Export Employee Data (Value: Employee.Export)

Module: Attendance Management
├─ Permission: Create Attendance (Value: Attendance.Create)
├─ Permission: Edit Attendance (Value: Attendance.Edit)
├─ Permission: View Attendance (Value: Attendance.View)
├─ Permission: View Team Attendance (Value: Attendance.ViewTeam)
└─ Permission: Manage Configuration (Value: Attendance.ManageConfig)
```

**UI Display (Role Creation Form):**
```
Modules & Permissions:

☑️ Employee Management
   ☑️ Create Employee
   ☑️ Edit Employee
   ☑️ View Employee
   ☐ Delete Employee
   ☑️ View All Employees

☑️ Attendance Management
   ☑️ View Attendance
   ☐ Edit Attendance
   ☑️ View Team Attendance
```

---

### Feature 6: Role List with User Count
**Description:** Display all roles with count of users assigned to each role.

**Business Rules:**
- Paginated list with sorting
- Search by role name
- Show user count per role
- Default roles cannot be deleted (Super Admin, HR, Employee)

**Query:**
```sql
SELECT r.Id, r.Name, r.IsActive,
       COUNT(ed.Id) AS UserCount
FROM Role r
LEFT JOIN EmploymentDetail ed ON ed.RoleId = r.Id
WHERE r.IsActive = 1
  AND r.Name LIKE '%' + @RoleName + '%'
GROUP BY r.Id, r.Name, r.IsActive
ORDER BY @SortColumnName @SortDirection
OFFSET @StartIndex ROWS FETCH NEXT @PageSize ROWS ONLY
```

**API Response:**
```json
{
  "totalRecords": 5,
  "roleResponseList": [
    { "roleId": 1, "roleName": "Super Admin", "userCount": 2, "isActive": true },
    { "roleId": 2, "roleName": "HR", "userCount": 5, "isActive": true },
    { "roleId": 3, "roleName": "Employee", "userCount": 150, "isActive": true },
    { "roleId": 5, "roleName": "Team Lead", "userCount": 12, "isActive": true }
  ]
}
```

---

## API Endpoints

### 1. POST /api/RolePermission/GetRoles
**Purpose:** Get paginated list of roles with search and sorting.

**Request:**
```json
{
  "sortColumnName": "Name",
  "sortDirection": "asc",
  "startIndex": 0,
  "pageSize": 10,
  "filters": {
    "roleName": ""
  }
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "totalRecords": 5,
    "roleResponseList": [
      { "roleId": 1, "roleName": "Super Admin", "userCount": 2 },
      { "roleId": 2, "roleName": "HR", "userCount": 5 }
    ]
  }
}
```

**Authorization:** `[HasPermission(Permissions.ReadRole)]`

---

### 2. GET /api/RolePermission/GetModulePermissionsByRole?roleId={id}
**Purpose:** Get role's permissions grouped by module.

**Request Example:**
```
GET /api/RolePermission/GetModulePermissionsByRole?roleId=2
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "roleId": 2,
    "roleName": "HR",
    "modules": [
      {
        "moduleId": 1,
        "moduleName": "Employee Management",
        "isActive": true,
        "permissions": [
          { "permissionId": 1, "permissionName": "Create Employee", "isActive": true },
          { "permissionId": 2, "permissionName": "Edit Employee", "isActive": true }
        ]
      }
    ]
  }
}
```

**Authorization:** `[HasPermission(Permissions.ViewRole)]`

---

### 3. POST /api/RolePermission/SaveRolePermissions
**Purpose:** Create new role or update existing role with permissions.

**Request (Create New Role):**
```json
{
  "roleId": 0,
  "roleName": "Team Lead",
  "isRoleNameUpdate": false,
  "isRolePermissionUpdate": true,
  "permissionList": [1, 2, 4, 10, 11, 20, 21]
}
```

**Request (Update Existing Role):**
```json
{
  "roleId": 5,
  "roleName": "Senior Manager",
  "isRoleNameUpdate": true,
  "isRolePermissionUpdate": true,
  "permissionList": [1, 2, 3, 4, 10, 11, 12, 20, 21, 22]
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": true
}
```

**Authorization:** `[HasPermission(Permissions.CreateRole)]`, `[HasPermission(Permissions.EditRole)]`

---

### 4. GET /api/RolePermission/GetPermissionList
**Purpose:** Get all modules with permissions (for role creation form).

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": [
    {
      "moduleId": 1,
      "moduleName": "Employee Management",
      "permissions": [
        { "permissionId": 1, "permissionName": "Create Employee", "isActive": false },
        { "permissionId": 2, "permissionName": "Edit Employee", "isActive": false }
      ]
    }
  ]
}
```

**Authorization:** `[HasPermission(Permissions.ReadRole)]`

---

### 5. GET /api/RolePermission/GetRolesList
**Purpose:** Get all roles for dropdown (no pagination).

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": [
    { "roleId": 1, "roleName": "Super Admin" },
    { "roleId": 2, "roleName": "HR" },
    { "roleId": 3, "roleName": "Employee" }
  ]
}
```

**Authorization:** `[HasPermission(Permissions.ReadRole)]`

---

## Workflows

### Workflow 1: Create Custom Role for Department Manager
**Actors:** Super Admin

**Steps:**
1. Super Admin logs into HRMS
2. Navigates to "Roles" page
3. Sees list of existing roles (Super Admin, HR, Employee, Accounts)
4. Clicks "Add New Role" button
5. Role creation form opens
6. Admin enters role name: "Department Manager"
7. Admin sees module-permission tree:
   - **Employee Management:** Select "View Employee", "Edit Employee"
   - **Attendance Management:** Select "View Attendance", "View Team Attendance"
   - **Leave Management:** Select "View Leave", "Approve Team Leave"
   - **Reporting:** Select "View Department Reports"
8. Admin selects 12 permissions across 4 modules
9. Admin clicks "Save"
10. Frontend validates form (role name required, at least 1 permission)
11. Frontend calls `POST /api/RolePermission/SaveRolePermissions`:
```json
{
  "roleId": 0,
  "roleName": "Department Manager",
  "isRoleNameUpdate": false,
  "isRolePermissionUpdate": true,
  "permissionList": [4, 10, 11, 20, 21, 30, 40]
}
```
12. Backend validates request (role name unique?)
13. Backend inserts into Role table: `INSERT INTO Role VALUES ('Department Manager', 1, 'admin@hrms.com', GETUTCDATE())`
14. Backend gets new RoleId: 6
15. Backend calls `SaveRolePermissions` stored procedure with RoleId = 6 and permission list
16. Stored procedure inserts 12 RolePermission records
17. Backend sends email notification to Super Admin:
    ```
    Subject: New Role Added - Department Manager
    
    A new role "Department Manager" was created on Nov 01, 2025.
    Created by: admin@hrms.com
    Permissions assigned: 12
    
    View role details: [Link to Role Details]
    ```
18. Backend returns success response
19. Frontend shows success toast: "Role 'Department Manager' created successfully"
20. Frontend refreshes roles list
21. New role "Department Manager" appears in list with UserCount = 0

**Result:** Custom role created with specific permissions, ready for assignment to users.

---

### Workflow 2: Update Permissions for Existing Role
**Actors:** Super Admin, HR Role

**Steps:**
1. **Background:** HR role currently has limited permissions, needs additional access
2. Super Admin navigates to "Roles" page
3. Finds "HR" role in list
4. Clicks "Edit" button
5. System fetches role permissions: `GET /api/RolePermission/GetModulePermissionsByRole?roleId=2`
6. Form loads with existing permissions (45 permissions active)
7. Admin expands "Asset Management" module (currently no permissions)
8. Admin adds new permissions:
   - ☑️ Create Asset
   - ☑️ Edit Asset
   - ☑️ View All Assets
   - ☑️ Assign Asset
9. Total permissions: 45 → 49
10. Admin clicks "Update"
11. Frontend calls `POST /api/RolePermission/SaveRolePermissions`:
```json
{
  "roleId": 2,
  "roleName": "HR",
  "isRoleNameUpdate": false,
  "isRolePermissionUpdate": true,
  "permissionList": [1, 2, 3, ..., 50, 51, 52, 53]
}
```
12. Backend validates request
13. Backend calls `SaveRolePermissions` stored procedure:
    - Deletes existing RolePermission records: `DELETE FROM RolePermission WHERE RoleId = 2`
    - Inserts new RolePermission records: 49 records inserted
14. Backend returns success
15. Frontend shows "Role updated successfully"
16. **Impact:** All users with HR role immediately get new Asset Management permissions
17. HR user logs out and logs back in
18. New JWT token generated with updated permission claims
19. HR user can now access Asset Management module
20. UI sidebar shows "Asset Management" menu item (permission check passed)

**Result:** HR role permissions updated, all HR users gain immediate access to new features on next login.

---

### Workflow 3: API Request with Permission Validation
**Actors:** HR User, Authorization System

**Steps:**
1. **Setup:** HR user logged in with JWT token containing permission claims
2. HR user navigates to "Employees" page
3. Clicks "Add New Employee" button
4. Fills employee form: Name, Email, Department, Designation
5. Clicks "Submit"
6. Frontend sends: `POST /api/Employee/AddEmployee` with Authorization header `Bearer eyJhbGc...`
7. **ASP.NET Core Authorization Pipeline:**
   - **Step 1:** JWT Authentication Middleware validates token (signature, expiry)
   - **Step 2:** Token valid → User identity established
   - **Step 3:** Authorization middleware checks endpoint attributes: `[HasPermission(Permissions.CreateEmployee)]`
   - **Step 4:** Policy name: "Employee.Create"
   - **Step 5:** `PermissionAuthorizationHandler.HandleRequirementAsync()` invoked
8. **Permission Check Logic:**
```csharp
// Extract permission claims from token
var permissions = context.User.Claims
    .Where(c => c.Type == "permission")
    .Select(c => c.Value)
    .ToList();

// Check if required permission exists
if (permissions.Contains("Employee.Create"))
    context.Succeed(requirement); // Allow access
else
    context.Fail(); // Deny access
```
9. **Scenario A: Permission Exists**
   - Permission claim "Employee.Create" found in token
   - Authorization succeeds
   - Request proceeds to controller action
   - `AddEmployee()` method executes
   - Employee created in database
   - Success response returned

10. **Scenario B: Permission Missing**
    - Permission claim "Employee.Create" NOT found
    - Authorization fails
    - **403 Forbidden** response returned:
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "result": null
}
```
    - Controller action never executed
    - Frontend shows error toast: "Access Denied. You don't have permission to add employees."

**Result:** API secured with granular permission checks, unauthorized users blocked before business logic execution.

---

## Integration Points

### Integration 1: Authentication Module
**Purpose:** Load user permissions during login, embed in JWT token.

**Login Flow:**
1. User submits credentials (email, password)
2. AuthService validates credentials
3. AuthService queries user's role: `SELECT RoleId FROM EmploymentDetail WHERE EmployeeId = @Id`
4. AuthService queries role permissions: 
```sql
SELECT p.Value AS PermissionValue
FROM RolePermission rp
JOIN Permission p ON p.Id = rp.PermissionId
WHERE rp.RoleId = @RoleId AND rp.IsActive = 1
```
5. AuthService generates JWT token with claims:
   - userId
   - roleId
   - roleName
   - **permission** (multiple claims, one per permission)
6. JWT token returned to client
7. Client stores token in localStorage
8. Subsequent API requests include token in Authorization header

**Token Payload:**
```json
{
  "userId": "5678",
  "roleId": "2",
  "roleName": "HR",
  "permission": [
    "Employee.Create",
    "Employee.Edit",
    "Employee.View",
    "Attendance.Create",
    "Leave.Approve",
    ...
  ],
  "exp": 1699000000
}
```

---

### Integration 2: Employee Management Module
**Purpose:** Assign role to employee during onboarding.

**Field:** `EmploymentDetail.RoleId` (Foreign Key to Role table)

**Assignment Flow:**
1. HR creates new employee
2. HR selects role from dropdown (fetched via `GET /api/RolePermission/GetRolesList`)
3. RoleId saved in `EmploymentDetail` table
4. Employee logs in → Role permissions loaded automatically
5. If role updated → Employee must re-login to get new permissions

---

### Integration 3: All Secure API Endpoints
**Purpose:** Protect API endpoints with permission-based authorization.

**Usage Pattern:**
```csharp
// Employee Controller
[HasPermission(Permissions.CreateEmployee)]
public async Task<IActionResult> AddEmployee() { }

[HasPermission(Permissions.EditEmployee)]
public async Task<IActionResult> UpdateEmployee() { }

[HasPermission(Permissions.DeleteEmployee)]
public async Task<IActionResult> DeleteEmployee() { }

// Attendance Controller
[HasPermission(Permissions.CreateAttendance)]
public async Task<IActionResult> AddAttendance() { }

[HasPermission(Permissions.ViewTeamAttendance)]
public async Task<IActionResult> GetTeamAttendance() { }
```

**Permissions Class (Constants):**
```csharp
public static class Permissions
{
    // Employee Management
    public const string CreateEmployee = "Employee.Create";
    public const string EditEmployee = "Employee.Edit";
    public const string DeleteEmployee = "Employee.Delete";
    public const string ViewEmployee = "Employee.View";
    
    // Attendance Management
    public const string CreateAttendance = "Attendance.Create";
    public const string EditAttendance = "Attendance.Edit";
    public const string ViewAttendance = "Attendance.View";
    public const string ViewTeamAttendance = "Attendance.ViewTeam";
    
    // Leave Management
    public const string ApproveLeave = "Leave.Approve";
    public const string ViewLeave = "Leave.View";
    
    // Role Management
    public const string CreateRole = "Role.Create";
    public const string EditRole = "Role.Edit";
    public const string ReadRole = "Role.Read";
}
```

---

## Known Limitations

### 1. No Role Deletion
**Impact:** Roles cannot be deleted, only deactivated.  
**Current Implementation:** No delete API endpoint exists.  
**Workaround:** Set `IsActive = 0` to hide role from UI.  
**Future Enhancement:** Add role deletion with checks (cannot delete if users assigned).

---

### 2. No Dynamic Permission Creation
**Impact:** New permissions require database script and code deployment.  
**Current Implementation:** Permissions hardcoded in database seed scripts.  
**Workaround:** Run SQL script to add new permissions.  
**Future Enhancement:** Admin UI to create custom permissions dynamically.

---

### 3. No Role Hierarchy
**Impact:** Cannot create parent-child role relationships (e.g., Senior Manager inherits Manager permissions).  
**Current Implementation:** Flat role structure, no inheritance.  
**Workaround:** Manually assign all required permissions to each role.  
**Future Enhancement:** Implement role hierarchy with permission inheritance.

---

### 4. No Permission Expiry
**Impact:** Permissions granted indefinitely, no time-based access.  
**Current Implementation:** Permanent permission assignment.  
**Workaround:** Manually change user's role when temporary access expires.  
**Future Enhancement:** Add start/end dates for role assignments.

---

### 5. No Audit Trail for Permission Changes
**Impact:** Cannot track who changed role permissions and when.  
**Current Implementation:** No audit logging for SaveRolePermissions operation.  
**Workaround:** Check CreatedBy/ModifiedBy fields (limited info).  
**Future Enhancement:** Add comprehensive audit trail for all permission changes.

---

## Summary

**Module 10: Role & Permission Management** provides a comprehensive RBAC system to secure HRMS application with granular permission controls. The module enables administrators to create custom roles, assign specific permissions, and ensure users only access features they're authorized to use. Built on ASP.NET Core Authorization framework with custom policy handlers, the module provides robust security with seamless integration across all HRMS modules.

### Core Functionalities Delivered:
✅ **Role CRUD:** Create, read, update roles with user count  
✅ **Permission Assignment:** Assign permissions to roles via intuitive UI  
✅ **Module-Permission Hierarchy:** Organize permissions by modules  
✅ **API Security:** `[HasPermission]` attribute for endpoint protection  
✅ **JWT Claims:** Permission claims embedded in JWT tokens  
✅ **Authorization Handler:** Custom policy handler validates permissions  
✅ **Email Notifications:** Notify admins on role creation  

### Technical Implementation Highlights:
- **ASP.NET Core Authorization:** Built on standard authorization framework
- **Custom Policy Handler:** `PermissionAuthorizationHandler` checks claims
- **Stored Procedures:** Efficient batch insert/delete of role permissions
- **JWT Claims:** Permissions embedded in token for stateless validation
- **Module Grouping:** Permissions organized by functional modules

### Integration Ecosystem:
- **Authentication Module:** Permission loading during login
- **Employee Module:** Role assignment to employees
- **All Secure Endpoints:** Permission checks on API calls
- **Frontend UI:** Dynamic menu based on user permissions

### Business Value:
- **Security:** Granular access control prevents unauthorized access
- **Flexibility:** Custom roles adapt to organizational structure
- **Compliance:** Role-based access meets security audit requirements
- **Scalability:** Supports unlimited roles and permissions
- **Maintainability:** Centralized permission management

### Production Readiness:
✅ Role CRUD APIs functional  
✅ Permission assignment working  
✅ HasPermission attribute implemented  
✅ Authorization handler tested  
✅ JWT claims integration complete  
⚠️ No role deletion (only deactivation)  
⚠️ No audit trail for permission changes  
⚠️ No dynamic permission creation  

### Future Enhancements (Recommended):
1. **Role Deletion:** Safe deletion with user reassignment
2. **Permission Audit:** Track all permission changes with timestamps
3. **Role Hierarchy:** Parent-child role relationships with inheritance
4. **Dynamic Permissions:** Admin UI to create custom permissions
5. **Permission Expiry:** Time-based role assignments
6. **Permission Templates:** Pre-configured permission sets for common roles
7. **Bulk Role Assignment:** Assign roles to multiple users at once
8. **Permission Analytics:** Reports on permission usage and access patterns

**End of Module 10 Documentation**

**Related Modules:**  
← [Module 09: Holiday Management](./09-holiday-management.md)  
→ [Module 11: Reporting & Analytics](./11-reporting-analytics.md)
