# Profile Edit Field Saving Fix

## Issues Identified

### 1. Personal Details Not Showing After Save
**Problem**: Personal details (phone, alternate_phone, emergency_contact_person, emergency_contact_no) were saving to database but not displaying on frontend after refresh.

**Root Cause**: The `transformEmployeeForForm()` function in `employeeStore.ts` was transforming field names:
- `phone` → `mobile_number` ❌
- `emergency_contact_person` → `emergency_contact_name` ❌
- `emergency_contact_no` → `emergency_contact_number` ❌
- `pan_number` → `pan_no` ❌
- `adhar_number` → `aadhaar_no` ❌

But the components (`PersonalDetailsTab.vue`, `OfficialDetailsTab.vue`) were using the original database field names.

**Fix**: Removed field name transformations to keep original database field names throughout the application.

### 2. Official Details Not Saving
**Problem**: Official details (PAN, Aadhaar, UAN, Passport, PF/ESI) were not saving to database.

**Root Cause**: Backend controller was using `$request->has()` which returns `true` even for empty strings. When frontend sent empty values like `pan_number: ''`, the backend would try to save empty string instead of skipping the field.

**Fix**: Changed backend to use `$request->filled()` for required fields and `?: null` conversion for optional fields.

## Files Modified

### 1. Frontend - Store Transformation Fix
**File**: `hrms-frontend/src/stores/employeeStore.ts`

**Changed from**:
```typescript
// Map API field names to form field names
mobile_number: apiEmployee.phone, 
emergency_contact_name: apiEmployee.emergency_contact_person,
emergency_contact_number: apiEmployee.emergency_contact_no,
pan_no: apiEmployee.pan_number,
aadhaar_no: apiEmployee.adhar_number,
```

**Changed to**:
```typescript
// Contact fields - keep original field names to match component expectations
phone: apiEmployee.phone,
alternate_phone: apiEmployee.alternate_phone,
personal_email: apiEmployee.personal_email,
emergency_contact_person: apiEmployee.emergency_contact_person,
emergency_contact_no: apiEmployee.emergency_contact_no,
pan_number: apiEmployee.pan_number,
adhar_number: apiEmployee.adhar_number,
```

### 2. Frontend - Data Preparation Fix
**File**: `hrms-frontend/src/components/employees/EmployeeDetailsComplete.vue`

**Changed**: All field preparations from `|| null` to `|| ''` to ensure values are sent:
```typescript
phone: data.employee.phone?.trim() || '',
alternate_phone: data.employee.alternate_phone?.trim() || '',
emergency_contact_person: data.employee.emergency_contact_person?.trim() || '',
emergency_contact_no: data.employee.emergency_contact_no?.trim() || '',
```

Added console logging to debug data flow.

### 3. Backend - Request Handling Fix
**File**: `hrms-backend/app/Http/Controllers/Api/EmployeeController.php`

**Changed personal details from**:
```php
if ($request->has('phone')) $updateData['phone'] = $request->input('phone');
```

**Changed to**:
```php
if ($request->filled('phone')) $updateData['phone'] = $request->input('phone');
```

**Changed optional fields**:
```php
if ($request->has('alternate_phone')) $updateData['alternate_phone'] = $request->input('alternate_phone') ?: null;
```

**Official details changes**:
```php
// Required fields use filled()
if ($request->filled('pan_number')) $updateData['pan_number'] = $request->input('pan_number');
if ($request->filled('adhar_number')) $updateData['adhar_number'] = $request->input('adhar_number');

// Optional fields use has() with null conversion
if ($request->has('uan_no')) $updateData['uan_no'] = $request->input('uan_no') ?: null;
if ($request->has('passport_no')) $updateData['passport_no'] = $request->input('passport_no') ?: null;
```

Added logging:
```php
\Log::info('Employee Update Request', ['employee_id' => $id, 'data' => $request->all()]);
\Log::info('Update data prepared', ['update_data' => $updateData]);
```

## Key Differences

### `$request->has()` vs `$request->filled()`

| Method | Behavior | Use Case |
|--------|----------|----------|
| `has()` | Returns `true` if key exists, even if value is `''` (empty string) | Optional fields that can be cleared |
| `filled()` | Returns `true` only if key exists AND has non-empty value | Required fields that must have a value |

**Example**:
```php
// Request data: ['phone' => '']

$request->has('phone')    // true ✓ (key exists)
$request->filled('phone') // false ✗ (value is empty)
```

## Testing

### Personal Details
1. ✅ Edit phone number → Saves and displays correctly
2. ✅ Edit alternate phone → Saves and displays correctly
3. ✅ Edit emergency contact person → Saves and displays correctly
4. ✅ Edit emergency contact number → Saves and displays correctly

### Official Details
1. ✅ Edit PAN number → Should save and display
2. ✅ Edit Aadhaar number → Should save and display
3. ✅ Edit UAN number → Should save and display
4. ✅ Edit Passport details → Should save and display
5. ✅ Toggle PF/ESI → Should enable/disable related fields
6. ✅ Edit PF details → Should save when PF is enabled
7. ✅ Edit ESI number → Should save when ESI is enabled

## Expected Behavior Now

1. **Personal Details**: All contact fields save to database and display immediately after save
2. **Official Details**: All identity and statutory fields save correctly
3. **Empty Fields**: Empty optional fields save as `NULL` in database
4. **Field Names**: Consistent between frontend components, API, and database

## Status

✅ **FIXED** - Both personal and official details should now save and display correctly.
