<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use App\Services\LeaveAccrualService;
use App\Exports\EmployeesExport;
use App\Imports\EmployeesImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * EmployeeController - Core employee management
 * 
 * Implements Features #1-9 from Module-2:
 * - Employee onboarding with code generation
 * - Leave balance initialization
 * - Profile completeness tracking
 * - Employee list with pagination and filters
 */
class EmployeeController extends Controller
{
    protected LeaveAccrualService $leaveAccrualService;

    public function __construct(LeaveAccrualService $leaveAccrualService)
    {
        $this->leaveAccrualService = $leaveAccrualService;
    }

    /**
     * Get paginated employee list with filters
     * Feature #76-97: Search & Reporting
     */
    public function index(Request $request): JsonResponse
    {
        $query = EmployeeData::with([
            'employmentDetail.department',
            'employmentDetail.designationModel',
            'currentAddress'
        ])->active();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('department_id')) {
            $query->whereHas('employmentDetail', function($q) use ($request) {
                $q->where('department_id', $request->input('department_id'));
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $employees = $query->paginate($perPage);

        // Add profile completeness to each employee
        $employees->getCollection()->transform(function ($employee) {
            $employee->profile_completeness = $employee->calculateProfileCompleteness();
            return $employee;
        });

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    /**
     * Create new employee (onboarding)
     * Features #1-9: Employee Onboarding & Creation
     */
    public function store(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Log incoming request data for debugging
            \Log::info('Employee creation request:', [
                'gender' => $request->input('gender'),
                'all_data' => $request->all()
            ]);

            // Generate employee code
            $employeeCode = EmployeeData::generateNextEmployeeCode();

            // Create employee
            $employee = EmployeeData::create([
                'first_name' => $request->input('first_name'),
                'middle_name' => $request->input('middle_name'),
                'last_name' => $request->input('last_name'),
                'father_name' => $request->input('father_name'),
                'gender' => $request->input('gender'),
                'dob' => $request->input('dob'),
                'blood_group' => $request->input('blood_group'),
                'marital_status' => $request->input('marital_status'),
                'phone' => $request->input('mobile_number'),
                'personal_email' => $request->input('personal_email'),
                'emergency_contact_person' => $request->input('emergency_contact_name'),
                'emergency_contact_no' => $request->input('emergency_contact_number'),
                'pan_number' => $request->input('pan_no'),
                'adhar_number' => $request->input('aadhaar_no'),
                'uan_no' => $request->input('uan_no') ? true : false,
                'employee_code' => $employeeCode,
                'status' => 1, // Active
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);

            // Create employment detail
            EmploymentDetail::create([
                'employee_id' => $employee->id,
                'email' => $request->input('email'),
                'joining_date' => $request->input('joining_date'),
                'department_id' => $request->input('department_id'),
                'designation_id' => $request->input('designation_id'),
                'team_id' => $request->input('team_id'),
                'reporting_manger_id' => $request->input('reporting_manager_id'),
                'role_id' => $request->input('role_id'),
                'job_type' => $request->input('job_type', 1),
                'employment_status' => $request->input('employment_status', 2), // Probation
                'branch_id' => $request->input('branch_id'),
                'background_verificationstatus' => $request->input('background_verificationstatus'),
                'criminal_verification' => $request->input('criminal_verification'),
                'total_experience_year' => $request->input('total_experience_year', 0),
                'total_experience_month' => $request->input('total_experience_month', 0),
                'relevant_experience_year' => $request->input('relevant_experience_year', 0),
                'relevant_experience_month' => $request->input('relevant_experience_month', 0),
                'probation_months' => $request->input('probation_months'),
                'time_doctor_user_id' => $request->input('time_doctor_user_id'),
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);

            // Calculate and insert opening leave balance
            // Default gender to 3 (Other) if not provided
            $gender = $employee->gender;
            if ($gender === null || $gender === '' || !in_array($gender, [1, 2, 3])) {
                $gender = 3; // Other
            }
            
            $this->leaveAccrualService->calculateOpeningBalance(
                $employee->id,
                $request->input('joining_date'),
                $gender
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => [
                    'id' => $employee->id,
                    'employee_code' => $employeeCode
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee profile with all sections
     * Feature #76: Profile view with all sections
     */
    public function show(int $id): JsonResponse
    {
        $employee = EmployeeData::with([
            'employmentDetail.department',
            'employmentDetail.designationModel',
            'employmentDetail.reportingManager',
            'currentAddress.city.state.country',
            'permanentAddress.city.state.country',
            'activeBankDetails',
            'documents.documentType',
            'qualifications.qualification.university',
            'certificates',
            'nominees.relationship',
            'previousEmployers.references',
            'currentEmployerDocuments.documentType'
        ])->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        // Add profile completeness
        $employee->profile_completeness = $employee->calculateProfileCompleteness();

        // Add profile picture URL with SAS token if file exists
        if ($employee->file_name) {
            $azureBlobService = app(\App\Services\AzureBlobService::class);
            $employee->profile_picture_url = $azureBlobService->getFileSasUrl(
                \App\Services\AzureBlobService::USER_DOCUMENT_CONTAINER,
                $employee->file_name
            );
        }

        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    /**
     * Update employee basic information
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $employee = EmployeeData::find($id);
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Build update data array
            $updateData = [
                'modified_by' => auth()->user()->email ?? 'system',
                'modified_on' => now()
            ];

            // Personal details
            if ($request->has('first_name')) $updateData['first_name'] = $request->input('first_name');
            if ($request->has('middle_name')) $updateData['middle_name'] = $request->input('middle_name');
            if ($request->has('last_name')) $updateData['last_name'] = $request->input('last_name');
            if ($request->has('father_name')) $updateData['father_name'] = $request->input('father_name');
            if ($request->has('gender')) $updateData['gender'] = $request->input('gender');
            if ($request->has('dob')) $updateData['dob'] = $request->input('dob');
            if ($request->has('blood_group')) $updateData['blood_group'] = $request->input('blood_group');
            if ($request->has('marital_status')) $updateData['marital_status'] = $request->input('marital_status');
            if ($request->has('nationality')) $updateData['nationality'] = $request->input('nationality');
            if ($request->has('phone')) $updateData['phone'] = $request->input('phone');
            if ($request->has('alternate_phone')) $updateData['alternate_phone'] = $request->input('alternate_phone');
            if ($request->has('personal_email')) $updateData['personal_email'] = $request->input('personal_email');
            if ($request->has('emergency_contact_person')) $updateData['emergency_contact_person'] = $request->input('emergency_contact_person');
            if ($request->has('emergency_contact_no')) $updateData['emergency_contact_no'] = $request->input('emergency_contact_no');
            if ($request->has('interest')) $updateData['interest'] = $request->input('interest');

            // Official details
            if ($request->has('pan_number')) $updateData['pan_number'] = $request->input('pan_number');
            if ($request->has('adhar_number')) $updateData['adhar_number'] = $request->input('adhar_number');
            if ($request->has('uan_no')) $updateData['uan_no'] = $request->input('uan_no');
            if ($request->has('passport_no')) $updateData['passport_no'] = $request->input('passport_no');
            if ($request->has('passport_expiry')) $updateData['passport_expiry'] = $request->input('passport_expiry');
            if ($request->has('has_pf')) $updateData['has_pf'] = $request->input('has_pf');
            if ($request->has('pf_number')) $updateData['pf_number'] = $request->input('pf_number');
            if ($request->has('pf_date')) $updateData['pf_date'] = $request->input('pf_date');
            if ($request->has('has_esi')) $updateData['has_esi'] = $request->input('has_esi');
            if ($request->has('esi_no')) $updateData['esi_no'] = $request->input('esi_no');

            $employee->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soft delete employee
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $employee = EmployeeData::find($id);
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            $employee->softDelete(auth()->user()->email ?? 'system');

            return response()->json([
                'success' => true,
                'message' => 'Employee archived successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get next available employee code
     */
    public function getNextEmployeeCode(): JsonResponse
    {
        $code = EmployeeData::generateNextEmployeeCode();
        
        return response()->json([
            'success' => true,
            'data' => ['employee_code' => $code]
        ]);
    }

    /**
     * Get employee profile completeness
     */
    public function getProfileCompleteness(int $id): JsonResponse
    {
        $employee = EmployeeData::find($id);
        
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $completeness = $employee->calculateProfileCompleteness();

        return response()->json([
            'success' => true,
            'data' => [
                'employee_id' => $id,
                'completeness_percentage' => $completeness,
                'is_complete' => $completeness === 100
            ]
        ]);
    }

    /**
     * Export employees to Excel
     * Matches legacy: POST /Employee/export
     */
    public function export(Request $request)
    {
        try {
            // Get employees with all related data
            $query = EmployeeData::with([
                'employmentDetail.department',
                'employmentDetail.designation',
                'employmentDetail.reportingManager',
                'currentAddress',
                'permanentAddress',
                'activeBankDetails'
            ])->active();

            // Apply same filters as index method
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('employee_code', 'like', "%{$search}%");
                });
            }

            if ($request->has('department_id')) {
                $query->whereHas('employmentDetail', function($q) use ($request) {
                    $q->where('department_id', $request->input('department_id'));
                });
            }

            if ($request->has('designation_id')) {
                $query->whereHas('employmentDetail', function($q) use ($request) {
                    $q->where('designation_id', $request->input('designation_id'));
                });
            }

            if ($request->has('branch_id')) {
                $query->whereHas('employmentDetail', function($q) use ($request) {
                    $q->where('branch_id', $request->input('branch_id'));
                });
            }

            if ($request->has('status')) {
                $query->whereHas('employmentDetail', function($q) use ($request) {
                    $q->where('employment_status', $request->input('status'));
                });
            }

            $employees = $query->get();

            $timestamp = now()->format('Ymd_His');
            $filename = "EmployeeList_{$timestamp}.xlsx";

            return Excel::download(new EmployeesExport($employees), $filename);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Failed to export employees: ' . $e->getMessage(),
                'is_success' => false
            ], 500);
        }
    }

    /**
     * Import employees from Excel
     * Matches legacy: POST /Employee/ImportExcel
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'excefile' => 'required|file|mimes:xlsx,xls|max:10240', // Max 10MB
        ]);

        $importConfirmed = $request->boolean('importConfirmed', false);
        $user = auth()->user();
        $createdBy = $user ? $user->email : 'system';

        try {
            $import = new EmployeesImport($importConfirmed, $createdBy);
            Excel::import($import, $request->file('excefile'));

            if (!$importConfirmed) {
                // Return validation results without importing
                $results = $import->getValidationResults();
                return response()->json([
                    'status_code' => 200,
                    'message' => json_encode($results),
                    'result' => 1,
                    'is_success' => true
                ]);
            }

            // Import confirmed - return success message
            $importedCount = $import->getImportedCount();
            return response()->json([
                'status_code' => 200,
                'message' => "{$importedCount} records successfully imported.",
                'result' => 1,
                'is_success' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 400,
                'message' => 'Import failed: ' . $e->getMessage(),
                'result' => 0,
                'is_success' => false
            ], 400);
        }
    }
}

