
---

### **Step 3: Create Part 2 - Backend Migration**

```powershell
@'
# Module-2 Employee Management Migration Plan - Part 2
## Backend Migration (Laravel APIs, Controllers, Services)

**Migration Context**: .NET/React → Laravel/Vue.js  
**Date**: November 10, 2025  
**Scope**: 80+ API endpoints, 9 controllers, business logic migration

---

## 1. API ROUTES STRUCTURE

```php
// routes/api.php
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    
    // Employee Management
    Route::prefix('employee')->group(function () {
        Route::post('list', [EmployeeController::class, 'getEmployees']);
        Route::post('export', [EmployeeController::class, 'export']);
        Route::post('import', [EmployeeController::class, 'importExcel']);
    });

    // Employment Details
    Route::prefix('employment-detail')->group(function () {
        Route::get('timedoctor/{email}', [EmploymentDetailController::class, 'getTimeDoctorUserId']);
        Route::post('', [EmploymentDetailController::class, 'store']);
        Route::put('{id}', [EmploymentDetailController::class, 'update']);
        Route::delete('{id}', [EmploymentDetailController::class, 'destroy']);
    });

    // Nominees with Percentage Validation
    Route::prefix('nominee')->group(function () {
        Route::post('', [NomineeController::class, 'store']);
        Route::put('{id}', [NomineeController::class, 'update']);
        Route::delete('{id}', [NomineeController::class, 'destroy']);
    });
});
2. CONTROLLER IMPLEMENTATION
2.1 EmploymentDetailController
<?php

namespace App\Http\Controllers\Api;

use App\Services\EmploymentDetailService;
use App\Services\LeaveAccrualService;

class EmploymentDetailController extends Controller
{
    public function store(EmploymentDetailRequest $request): JsonResponse
    {
        try {
            \DB::beginTransaction();

            $employeeCode = EmployeeData::generateNextEmployeeCode();

            $employeeData = $this->employmentService->createEmployee(
                array_merge($request->validated(), ['employee_code' => $employeeCode])
            );

            $this->leaveAccrualService->calculateOpeningBalance(
                $employeeData->id,
                $request->joining_date,
                $request->gender
            );

            \DB::commit();

            return response()->json([
                'success' => true,
                'data' => ['id' => $employeeData->id, 'employee_code' => $employeeCode]
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed'], 500);
        }
    }
}
3. SERVICE LAYER
3.1 LeaveAccrualService
<?php

namespace App\Services;

class LeaveAccrualService
{
    public function calculateOpeningBalance(int $employeeId, string $joiningDate, int $gender): array
    {
        $joiningDate = Carbon::parse($joiningDate);
        $monthsSinceJoining = $joiningDate->diffInMonths(Carbon::now()) + 1;
        
        $clBalance = min($monthsSinceJoining * 0.5, 12);
        $elBalance = min($monthsSinceJoining * 1.5, 18);
        
        $leaveBalances = [
            ['leave_id' => 1, 'leave_type' => 'CL', 'opening_balance' => $clBalance],
            ['leave_id' => 2, 'leave_type' => 'EL', 'opening_balance' => $elBalance],
        ];
        
        if ($gender == 1) {
            $leaveBalances[] = ['leave_id' => 4, 'leave_type' => 'PL', 'opening_balance' => 5];
        } elseif ($gender == 2) {
            $leaveBalances[] = ['leave_id' => 5, 'leave_type' => 'ML', 'opening_balance' => 180];
        }
        
        foreach ($leaveBalances as $leave) {
            EmployeeLeave::create([
                'employee_id' => $employeeId,
                'leave_id' => $leave['leave_id'],
                'opening_balance' => $leave['opening_balance'],
                'leave_date' => $joiningDate,
                'created_by' => 'system'
            ]);
        }
        
        return $leaveBalances;
    }
}

4. VALIDATION
4.1 NomineeRequest with Percentage Check
<?php

namespace App\Http\Requests;

class NomineeRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employee_data,id',
            'nominee_name' => 'required|string|max:100',
            'percentage' => 'required|numeric|min:1|max:100',
            'is_nominee_minor' => 'required|boolean',
            'care_of' => 'required_if:is_nominee_minor,1',
        ];
    }
}