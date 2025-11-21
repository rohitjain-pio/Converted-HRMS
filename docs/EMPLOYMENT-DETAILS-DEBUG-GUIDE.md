# Employment Details - Previous Employer Debugging Guide

## ✅ Backend Setup Status

All backend components are correctly configured:

1. **Database Table**: `previous_employer` ✓
   - All required columns present
   - Foreign key to employee_data table
   - is_deleted flag for soft deletes

2. **Model**: `PreviousEmployer.php` ✓
   - Proper fillable attributes
   - Date casting for employment dates
   - Relationships defined
   - Duration calculation method

3. **Controller**: `PreviousEmployerController.php` ✓
   - Full CRUD operations (index, store, show, update, destroy)
   - Employee ID validation
   - Proper error handling
   - Soft delete support

4. **Routes**: `/api/employees/previous-employers` ✓
   - GET / - List all (requires View.Employees permission)
   - POST / - Create new (requires Create.Employees permission)
   - GET /{id} - Get single record (requires View.Employees permission)
   - PUT /{id} - Update (requires Edit.Employees permission)
   - DELETE /{id} - Delete (requires Delete.Employees permission)

5. **Permissions**: ✓
   - Read PreviousEmployer
   - Create PreviousEmployer
   - Edit PreviousEmployer
   - Delete PreviousEmployer
   - View PreviousEmployer
   - Self-service permissions (|self modifier)

## ✅ Frontend Setup Status

1. **Component**: `EmploymentDetailsTab.vue` ✓
   - Previous employer list display
   - Add/Edit/Delete functionality
   - Loading states
   - Proper API integration

2. **Form**: `PreviousEmployerForm.vue` ✓
   - All required fields
   - Validation rules
   - Date validation (end date after start date)
   - Create and Edit modes
   - Proper error handling

3. **Dialog**: ✓
   - v-dialog with max-width 800px
   - Proper open/close functionality
   - Form submission and cancellation

## 🧪 Manual Testing Steps

### Step 1: Verify Servers Are Running

**Backend** (should be running on http://127.0.0.1:8000):
```powershell
cd c:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend
php artisan serve --port=8000
```

**Frontend** (should show URL like http://localhost:5175/):
```powershell
cd c:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-frontend
npm run dev
```

### Step 2: Login to Application

1. Open browser to frontend URL (e.g., http://localhost:5175)
2. Login with admin credentials:
   - Email: `admin@hrms.com`
   - Password: `Admin@123`

### Step 3: Navigate to Employment Details

1. After login, go to **Profile** page
2. Click on **Employment Details** tab
3. Scroll down to "Previous Employment History" section

### Step 4: Test Add Previous Employer

1. Click **"Add Previous Employer"** button (top right of the section)
2. A dialog should open with the form

**If dialog doesn't open:**
- Open browser console (F12)
- Check for JavaScript errors
- Look for error messages in console

### Step 5: Fill the Form

Required fields:
- Company Name: e.g., "ABC Technologies"
- Designation: e.g., "Senior Developer"
- Employment Start Date: e.g., "2020-01-01"
- Employment End Date: e.g., "2023-06-30"

Optional fields:
- Manager Name
- Manager Contact
- HR Name
- HR Contact
- Company Address
- Reason for Leaving

### Step 6: Submit and Verify

1. Click **Save** button
2. Form should close
3. New record should appear in the list below
4. Record should show:
   - Company name and designation
   - Employment dates
   - Duration (auto-calculated)
   - Edit and Delete action buttons

## 🔍 Troubleshooting

### Issue: "Add Previous Employer" button not visible

**Possible Causes:**
1. User doesn't have edit permissions
2. `canEdit` prop is false

**Solution:**
Check in EmploymentDetailsTab.vue:
```vue
<v-btn
  v-if="canEdit"  <!-- This controls button visibility -->
  size="small"
  color="primary"
  prepend-icon="mdi-plus"
  @click="openAddForm"
>
```

**Fix:**
- Check user role and permissions in database
- Verify parent component passes `canEdit` prop correctly

### Issue: Dialog opens but form is blank

**Possible Causes:**
1. Form component not mounted properly
2. Props not passed correctly

**Check Console:**
```javascript
// Should see these in Vue DevTools
showPreviousEmployerForm: true
editingEmployerId: null (for new) or number (for edit)
employee.id: <valid employee ID>
```

**Fix:**
- Verify `employeeId` prop is passed to PreviousEmployerForm
- Check if employee object has valid ID

### Issue: Form submits but no record appears

**Possible Causes:**
1. API call fails
2. Permissions denied
3. Validation error on backend

**Debug Steps:**

1. **Check Network Tab** (F12 → Network):
   - Look for POST request to `/api/employees/previous-employers`
   - Check request payload
   - Check response status code

2. **Expected Request Payload:**
```json
{
  "employee_id": 6,
  "company_name": "ABC Technologies",
  "designation": "Senior Developer",
  "employment_start_date": "2020-01-01",
  "employment_end_date": "2023-06-30",
  "reason_for_leaving": null,
  "manager_name": null,
  "manager_contact": null,
  "company_address": null,
  "hr_name": null,
  "hr_contact": null
}
```

3. **Expected Success Response:**
```json
{
  "success": true,
  "message": "Previous employer added successfully",
  "data": {
    "id": 1,
    "employee_id": 6,
    "company_name": "ABC Technologies",
    ...
  }
}
```

4. **If 403 Forbidden:**
```sql
-- Check user permissions
SELECT p.name, u.name as user_name
FROM permissions p
JOIN role_has_permissions rhp ON p.id = rhp.permission_id
JOIN roles r ON rhp.role_id = r.id
JOIN user_has_roles uhr ON r.id = uhr.role_id
JOIN users u ON uhr.user_id = u.id
WHERE u.email = 'your-email@domain.com'
AND p.name LIKE '%PreviousEmployer%' OR p.name LIKE '%Employees%';
```

5. **If 422 Validation Error:**
- Check backend validation rules in controller
- Verify all required fields are sent
- Check date format (should be 'Y-m-d')

### Issue: Records don't load on page open

**Possible Causes:**
1. employee_id not passed in API call
2. API endpoint error
3. No records in database

**Debug:**

1. **Check Network Tab**:
   - Look for GET request to `/api/employees/previous-employers?employee_id=X`
   - Verify employee_id is in query params

2. **Check Browser Console**:
```javascript
// Should see in console if error
"Failed to load previous employers: <error message>"
```

3. **Test API Directly**:
```powershell
# Get auth token first (login in browser, check in DevTools → Application → Local Storage)
$token = "your-auth-token-here"
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

# Test API
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/employees/previous-employers?employee_id=6" -Headers $headers
```

### Issue: UI doesn't match legacy app

**Current Styling Applied:**
- Modern card-based layout with shadows
- Hover effects on cards
- Section dividers with titles
- Info fields with backgrounds and left accent borders
- Professional spacing and padding
- Responsive mobile layout

**To Further Match Legacy:**

1. **Get Legacy Screenshots**:
   - Take screenshots of legacy Employment Details page
   - Note colors, fonts, spacing
   - Note field layout and labels

2. **Adjust Colors** in `EmploymentDetailsTab.vue`:
```css
/* Current colors */
--primary-color: rgb(var(--v-theme-primary));
--border-color: #e0e0e0;
--accent-color: rgb(var(--v-theme-primary));

/* Adjust to match legacy */
```

3. **Adjust Field Layout**:
   - Change from 3 columns to 2 columns if needed
   - Adjust col sizes: `cols="12" md="6"` instead of `md="4"`

4. **Adjust Typography**:
```css
.info-field label {
  font-size: 14px;  /* Adjust size */
  font-weight: 600; /* Adjust weight */
  color: #666;      /* Adjust color */
}
```

## 🎯 Quick Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running (check console for port)
- [ ] User logged in successfully
- [ ] Navigation to Employment Details tab works
- [ ] Current employment details display correctly
- [ ] "Previous Employment History" section visible
- [ ] "Add Previous Employer" button visible (if canEdit=true)
- [ ] Clicking button opens dialog
- [ ] Form fields are accessible and editable
- [ ] Form validation works (try submitting empty)
- [ ] Form submits successfully (check Network tab)
- [ ] New record appears in list after save
- [ ] Edit button works on existing records
- [ ] Delete button works with confirmation
- [ ] UI looks professional and matches requirements

## 📝 Suggested Test Data

```
Company Name: Tech Innovations Pvt Ltd
Designation: Senior Software Engineer
Start Date: 2019-03-15
End Date: 2023-11-30
Manager Name: John Smith
Manager Contact: +91-9876543210
HR Name: Sarah Johnson
HR Contact: +91-9876543211
Company Address: Building A, Tech Park, Bangalore - 560001
Reason for Leaving: Better career opportunity
```

## 🔧 Emergency Fixes

### If nothing works, check these:

1. **Clear cache**:
```powershell
cd hrms-backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

2. **Rebuild frontend**:
```powershell
cd hrms-frontend
npm install
```

3. **Check .env files**:
```
# Backend .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=root
DB_PASSWORD=your_password

# Frontend .env
VITE_API_URL=http://127.0.0.1:8000
```

4. **Verify axios base URL**:
Check `hrms-frontend/src/plugins/axios.ts` or `main.ts` for axios configuration

5. **Check CORS settings**:
In `hrms-backend/config/cors.php` - should allow localhost origins

## 📞 Next Steps

After following this guide:

1. If everything works: ✅ Document which permissions users need
2. If UI needs adjustment: 📸 Provide legacy app screenshots
3. If API errors persist: 📋 Share error logs and network tab screenshots
4. If frontend errors: 🔍 Share browser console errors

---

**Created**: November 21, 2025
**Purpose**: Debug Previous Employer functionality in Employment Details
**Status**: Backend ✓ | Frontend ✓ | Testing Required ⏳
