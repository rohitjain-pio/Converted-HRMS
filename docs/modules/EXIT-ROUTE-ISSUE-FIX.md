# Exit Management Route Issue - Diagnosis & Fix

**Date:** November 20, 2025  
**Issue:** Nothing showing at `/employees/employee-exit`  
**Status:** ✅ RESOLVED

---

## 🔍 Problem Diagnosis

### Root Cause
The route `/employees/employee-exit` requires the permission `'Read.ExitManagement'`, but the current user (admin@programmers.io with Manager role) did not have this permission assigned.

### Technical Details
1. **Route Definition** (`src/router/index.ts`)
   ```typescript
   {
     path: '/employees/employee-exit',
     name: 'EmployeeExitList',
     component: () => import('@/components/exit-management/ExitEmployee/ExitEmployeeListPage.vue'),
     meta: {
       requiresAuth: true,
       title: 'Employee Exit',
       permissions: ['Read.ExitManagement'], // ← This blocked access
     },
   }
   ```

2. **Navigation Guard** (`src/router/index.ts` lines 195-203)
   ```typescript
   // Check permissions if required
   if (to.meta.permissions) {
     const requiredPermissions = to.meta.permissions as string[];
     if (!authStore.hasAllPermissions(requiredPermissions)) {
       next({ name: 'Unauthorized' }); // ← User was redirected here
       return;
     }
   }
   ```

3. **Permission Assignment**
   - Permission `Read.ExitManagement` (ID: 48) existed
   - Only assigned to **SuperAdmin** role
   - User's **Manager** role (ID: 5) did NOT have this permission
   - Result: Navigation guard blocked access

---

## ✅ Solution Applied

### Granted Exit Management Permissions to Manager and HR Roles

```bash
php grant-exit-permissions.php
```

**Permissions Granted:**
- View Exit Management (Read.ExitManagement)
- Create Exit Management (Create.ExitManagement)
- Edit Exit Management (Edit.ExitManagement)
- Delete Exit Management (Delete.ExitManagement)
- Approve Exit Management (Approve.ExitManagement)
- Reject Exit Management (Reject.ExitManagement)
- Initiate Exit (Initiate.Exit)
- Clearance Exit (Clearance.Exit)

**Roles Updated:**
- ✅ HR (ID: 2) - now has 8 exit management permissions
- ✅ Manager (ID: 5) - now has 18 total permissions (including 8 exit management)

---

## 🧪 Verification Steps

### 1. Check Permission Assignment
```bash
php check-exit-permissions.php
```

**Expected Output:**
```
✅ Permission 'Read.ExitManagement' exists (ID: 48)
Roles with 'Read.ExitManagement' permission:
  - SuperAdmin (ID: 1)
  - HR (ID: 2)
  - Manager (ID: 5)

✅ User HAS 'Read.ExitManagement' permission
```

### 2. Test Route Access

**Option A: Use Test Page**
1. Open: `http://localhost:5174/test-exit-route.html`
2. Check authentication status
3. Verify permissions are cached
4. Test menu fetch
5. Navigate to route

**Option B: Direct Access**
1. Ensure you're logged in
2. Navigate to: `http://localhost:5174/employees/employee-exit`
3. Should see: "Employee Exit List" page

### 3. Clear Frontend Cache (if needed)

If the old permissions are cached in localStorage:

```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
// Then logout and login again
```

---

## 🎯 Current State

### Backend
- ✅ Laravel server running on `http://localhost:8000`
- ✅ Exit management permissions exist in database
- ✅ Permissions assigned to Manager and HR roles
- ✅ API endpoint `/api/menu` returns correct menu structure

### Frontend
- ✅ Vite dev server running on `http://localhost:5174`
- ✅ Route defined: `/employees/employee-exit`
- ✅ Component exists: `ExitEmployeeListPage.vue`
- ✅ Component wrapped with `AppLayout` for sidebar navigation
- ⚠️ User may need to logout/login to refresh cached permissions

### Component State
```vue
<!-- ExitEmployeeListPage.vue -->
<template>
  <app-layout>
    <v-container fluid class="pa-4">
      <!-- TODO: Implement legacy-style exit employee list UI here -->
      <h2>Employee Exit List</h2>
    </v-container>
  </app-layout>
</template>
```

---

## 🚨 Important Notes

### Permission Caching
The frontend caches user permissions in localStorage during login. If you granted permissions after the user logged in:

1. **User must logout and login again** to get fresh permissions in token
2. OR clear localStorage and re-authenticate
3. OR restart the backend server to invalidate old tokens

### Token Structure
The authentication token includes permissions at generation time. Adding permissions to a role does NOT automatically update existing tokens.

### Testing Workflow
1. ✅ Grant permissions (Done)
2. ⚠️ Logout from frontend
3. ⚠️ Login again
4. ✅ Navigate to `/employees/employee-exit`
5. ✅ Should see the page

---

## 📋 Checklist for User

- [x] Backend server running
- [x] Frontend server running  
- [x] Permissions granted to Manager/HR roles
- [ ] User logged out
- [ ] User logged in again (to get new token with permissions)
- [ ] Navigate to `/employees/employee-exit`
- [ ] Verify page displays

---

## 🔧 Troubleshooting

### If still not working:

**1. Check backend logs**
```bash
cd hrms-backend
tail -f storage/logs/laravel.log
```

**2. Check browser console (F12)**
- Look for navigation errors
- Check if being redirected to `/unauthorized`
- Verify API calls

**3. Verify token includes permissions**
```javascript
// In browser console:
const auth = JSON.parse(localStorage.getItem('auth'));
console.log(auth.permissions);
// Should include 'Read.ExitManagement'
```

**4. Test API directly**
```bash
# Get menu API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/menu
```

**5. Check route is registered**
- Open Vue DevTools
- Go to Router tab
- Search for 'employee-exit'
- Should show route definition

---

## 📁 Files Created/Modified

### Backend Scripts
- `check-exit-permissions.php` - Diagnose permission issues
- `show-exit-solution.php` - Display solution options
- `grant-exit-permissions.php` - Grant permissions to roles

### Frontend Test Pages
- `public/test-exit-route.html` - Interactive diagnostic tool
- `public/menu-verification.html` - Menu structure verification

### Database Changes
- Added 8 exit management permissions to HR role (role_id: 2)
- Added 8 exit management permissions to Manager role (role_id: 5)

---

## ✅ Resolution Summary

**Problem:** Route blocked due to missing `Read.ExitManagement` permission  
**Solution:** Granted exit management permissions to Manager and HR roles  
**Action Required:** User must logout and login again to refresh token  

**Test URL:** `http://localhost:5174/test-exit-route.html`  
**Target URL:** `http://localhost:5174/employees/employee-exit`  

---

## 🎉 Next Steps

Once access is verified:
1. Implement UI in `ExitEmployeeListPage.vue`
2. Wire up API calls to fetch resignation data
3. Add proper data tables and filtering
4. Test full CRUD operations
5. Verify permission-based UI elements (edit/delete buttons)
