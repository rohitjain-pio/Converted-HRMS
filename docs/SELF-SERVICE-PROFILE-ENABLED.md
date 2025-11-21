**✅ Self-Service Profile Editing Enabled**

---

## What Was Done

Added two new permissions to the database that allow **all employees** to view and edit their own profiles:

1. **`Read.OwnProfile`** - View own profile data
2. **`Edit.OwnProfile`** - Edit own profile data

These permissions have been assigned to **all 7 roles** in the system:
- SuperAdmin
- HR  
- Employee
- Accounts
- Manager
- IT
- Developer

---

## ⚠️ IMPORTANT: You Must Re-Login

Your current authentication token was generated **before** these permissions were added. To get the new permissions in your token:

### Option 1: Logout and Login Again (Recommended)
1. Click Logout in the application
2. Login again with: `rohit.jain@programmers.io` / `password`
3. Your new token will include the self-service permissions

### Option 2: Clear localStorage and Reload
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage
3. Clear all items
4. Reload the page and login again

---

## How It Works

The permission middleware (`CheckPermission`) now supports the `|self` syntax:

```php
->middleware('permission:employee.edit|self')
```

This means the endpoint allows access if:
- User has the `employee.edit` permission (admin access), **OR**
- User is editing their own profile (self-service access)

The middleware checks if the `employee_id` in the route matches the authenticated user's ID.

---

## Available Self-Service Endpoints

Once you re-login, you can access:

### Personal Information
- **PUT** `/api/employees/{id}` - Update own profile
- **GET** `/api/employees/{id}` - View own profile

### Address Management
- **GET** `/api/employees/addresses` - View own addresses
- **POST** `/api/employees/addresses/current` - Add current address
- **POST** `/api/employees/addresses/permanent` - Add permanent address

### Bank Details
- **GET** `/api/employees/bank-details` - View own bank accounts
- **POST** `/api/employees/bank-details` - Add bank account
- **PUT** `/api/employees/bank-details/{id}` - Update bank account
- **DELETE** `/api/employees/bank-details/{id}` - Delete bank account

### Nominees
- **GET** `/api/employees/nominees` - View nominees
- **POST** `/api/employees/nominees` - Add nominee
- **PUT** `/api/employees/nominees/{id}` - Update nominee
- **DELETE** `/api/employees/nominees/{id}` - Remove nominee

### Documents
- **GET** `/api/employees/documents` - View documents
- **POST** `/api/employees/documents` - Upload document
- **DELETE** `/api/employees/documents/{id}` - Delete document

### Qualifications
- **GET** `/api/employees/qualifications` - View qualifications
- **POST** `/api/employees/qualifications` - Add qualification
- **PUT** `/api/employees/qualifications/{id}` - Update qualification
- **DELETE** `/api/employees/qualifications/{id}` - Delete qualification

### Certificates
- **GET** `/api/employees/certificates` - View certificates
- **POST** `/api/employees/certificates` - Add certificate
- **DELETE** `/api/employees/certificates/{id}` - Delete certificate

---

## Testing

After re-login, test by:

1. Navigate to your profile page
2. Try editing your personal information
3. The API should now allow the update (was previously 403 Forbidden)
4. Check browser console - should see 200 OK instead of 403

---

## Technical Details

### Permissions Added to Database
```sql
INSERT INTO permissions (name, value, module_id, created_by, created_on, is_deleted) 
VALUES 
('Allow employees to view their own profile', 'Read.OwnProfile', 1, 'system', NOW(), 0),
('Allow employees to edit their own profile', 'Edit.OwnProfile', 1, 'system', NOW(), 0);
```

### Permission IDs
- **132** - `Read.OwnProfile`
- **133** - `Edit.OwnProfile`

### Assigned to All Roles
```sql
-- Each role now has these 2 additional permissions
SELECT COUNT(*) FROM role_permissions WHERE permission_id IN (132, 133);
-- Returns: 14 (2 permissions × 7 roles)
```

---

## Why Re-Login Is Required

Laravel Sanctum tokens include **abilities** (permissions) at the time of token generation. The token is a long-lived string that contains:

```
{user_id}|{token_hash}
```

The abilities are stored in the `personal_access_tokens` table, linked to this token. When you got your current token, permissions 132 and 133 didn't exist yet, so they weren't included in your token's abilities.

Re-logging in generates a **new token** with the updated list of permissions from your role.

---

Need help testing after re-login? Just ask!
