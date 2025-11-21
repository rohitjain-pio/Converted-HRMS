<?php

namespace App\Http\Controllers;

use App\Http\Resources\ResignationDetailsResource;
use App\Models\Resignation;
use App\Models\ResignationHistory;
use App\Models\EmployeeData;
use App\Services\ExitEmployeeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ExitEmployeeController extends Controller
{
    protected $exitEmployeeService;

    public function __construct(ExitEmployeeService $exitEmployeeService)
    {
        $this->exitEmployeeService = $exitEmployeeService;
    }

    /**
     * Add Resignation
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function addResignation(Request $request): JsonResponse
    {
        \Log::info('=== RESIGNATION SUBMISSION START ===', [
            'request_data' => $request->all(),
            'user' => Auth::user() ? Auth::user()->email : 'not authenticated'
        ]);

        $validator = Validator::make($request->all(), [
            'EmployeeId' => 'required|integer|exists:employee_data,id',
            'DepartmentID' => 'required|integer|exists:department,id',
            'Reason' => 'required|string|max:500',
            'ExitDiscussion' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            \Log::error('Resignation validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'StatusCode' => 400,
                'Message' => 'Validation failed',
                'Data' => null,
                'Errors' => $validator->errors()
            ], 400);
        }

        try {
            // Check if resignation already exists for this employee
            $existingResignation = Resignation::where('EmployeeId', $request->EmployeeId)
                ->whereIn('Status', [
                    config('exit-management.resignation_status.pending'),
                    config('exit-management.resignation_status.accepted')
                ])
                ->first();

            \Log::info('Checked for existing resignation', [
                'found' => $existingResignation !== null,
                'existing_id' => $existingResignation ? $existingResignation->Id : null
            ]);

            if ($existingResignation) {
                \Log::warning('Active resignation already exists');
                return response()->json([
                    'StatusCode' => 400,
                    'Message' => 'Active resignation already exists for this employee',
                    'Data' => null
                ], 400);
            }

            // Calculate last working day
            \Log::info('Calculating last working day', ['employee_id' => $request->EmployeeId]);
            $lastWorkingDay = $this->exitEmployeeService->calculateLastWorkingDay(
                $request->EmployeeId,
                now()->format('Y-m-d')
            );
            \Log::info('Last working day calculated', ['lwd' => $lastWorkingDay]);

            // Get employee's employment details for reporting manager
            $employee = EmployeeData::with('employmentDetail')->find($request->EmployeeId);
            
            if (!$employee) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Employee not found',
                    'Data' => null
                ], 404);
            }

            // Get reporting manager ID from employment details
            $reportingManagerId = $employee->employmentDetail->reporting_manger_id ?? null;

            \Log::info('Creating resignation record', [
                'employee_id' => $request->EmployeeId,
                'department_id' => $request->DepartmentID,
                'reporting_manager_id' => $reportingManagerId,
                'last_working_day' => $lastWorkingDay
            ]);

            // Create resignation
            $resignation = Resignation::create([
                'EmployeeId' => $request->EmployeeId,
                'DepartmentID' => $request->DepartmentID,
                'ReportingManagerId' => $reportingManagerId,
                'LastWorkingDay' => $lastWorkingDay,
                'Reason' => $request->Reason,
                'ExitDiscussion' => $request->ExitDiscussion ?? false,
                'Status' => config('exit-management.resignation_status.pending'),
                'IsActive' => 1, // Use 1 instead of true for tinyint column
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            \Log::info('Resignation created successfully', [
                'resignation_id' => $resignation->Id,
                'employee_id' => $resignation->EmployeeId
            ]);

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $resignation->Id,
                'ResignationStatus' => config('exit-management.resignation_status.pending'),
                'EarlyReleaseStatus' => null,
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            \Log::info('=== RESIGNATION SUBMISSION SUCCESS ===', ['resignation_id' => $resignation->Id]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation submitted successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            \Log::error('=== RESIGNATION SUBMISSION FAILED ===', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while submitting resignation',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Resignation Form by ID (Returns employee details for resignation form)
     * Legacy: GetResignationForm - returns employee data to populate resignation form
     * 
     * @param int $id Employee ID
     * @return JsonResponse
     */
    public function getResignationForm(int $id): JsonResponse
    {
        try {
            // Get employee with employment details
            $employee = EmployeeData::with(['employmentDetail.reportingManager'])->find($id);

            if (!$employee) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Employee not found',
                    'Data' => null
                ], 404);
            }

            // Get employment details
            $employment = $employee->employmentDetail;
            
            if (!$employment) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Employment details not found',
                    'Data' => null
                ], 404);
            }

            // Get reporting manager name
            $reportingManagerName = null;
            if ($employment->reporting_manger_id) {
                $manager = EmployeeData::find($employment->reporting_manger_id);
                if ($manager) {
                    $reportingManagerName = trim($manager->first_name . ' ' . 
                        ($manager->middle_name ? $manager->middle_name . ' ' : '') . 
                        $manager->last_name);
                }
            }

            // Format response to match legacy structure
            $responseData = [
                'Id' => $employee->id,
                'employeeId' => $employee->id,
                'EmployeeName' => trim($employee->first_name . ' ' . 
                    ($employee->middle_name ? $employee->middle_name . ' ' : '') . 
                    $employee->last_name),
                'DepartmentId' => $employment->department_id,
                'departmentId' => $employment->department_id,
                'Department' => $employment->department_name,
                'ReportingManagerName' => $reportingManagerName,
                'ReportingManagerId' => $employment->reporting_manger_id,
                'JobType' => $employment->job_type,
            ];

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Employee details retrieved successfully',
                'Data' => $responseData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving employee details',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Resignation Exit Details (with clearances)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function getResignationExitDetails(int $id): JsonResponse
    {
        try {
            $resignation = Resignation::with([
                'employee',
                'department',
                'reportingManager',
                'hrClearance',
                'departmentClearance',
                'itClearance',
                'accountClearance',
                'history'
            ])->find($id);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Transform to legacy format
            $resignationData = new ResignationDetailsResource($resignation);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation exit details retrieved successfully',
                'Data' => $resignationData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving resignation details',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Revoke Resignation (Withdraw)
     * 
     * @param int $resignationId
     * @return JsonResponse
     */
    public function revokeResignation(int $resignationId): JsonResponse
    {
        try {
            $resignation = Resignation::find($resignationId);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Can only revoke if pending or accepted (not rejected or completed)
            if ($resignation->Status == config('exit-management.resignation_status.rejected') ||
                $resignation->Status == config('exit-management.resignation_status.completed')) {
                return response()->json([
                    'StatusCode' => 400,
                    'Message' => 'Cannot revoke resignation with current status',
                    'Data' => null
                ], 400);
            }

            // Update resignation status to revoked
            $resignation->Status = config('exit-management.resignation_status.revoked');
            $resignation->IsActive = false;
            $resignation->ModifiedBy = Auth::user()->email ?? 'system';
            $resignation->ModifiedOn = now();
            $resignation->save();

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $resignationId,
                'ResignationStatus' => config('exit-management.resignation_status.revoked'),
                'EarlyReleaseStatus' => $resignation->EarlyReleaseStatus,
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation revoked successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while revoking resignation',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request Early Release
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function requestEarlyRelease(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'EarlyReleaseDate' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'StatusCode' => 400,
                'Message' => 'Validation failed',
                'Data' => null,
                'Errors' => $validator->errors()
            ], 400);
        }

        try {
            // Validate early release request
            $validation = $this->exitEmployeeService->validateEarlyReleaseRequest(
                $request->ResignationId,
                $request->EarlyReleaseDate
            );

            if (!$validation['valid']) {
                return response()->json([
                    'StatusCode' => 400,
                    'Message' => $validation['message'],
                    'Data' => null
                ], 400);
            }

            $resignation = Resignation::find($request->ResignationId);

            // Update early release request
            $resignation->IsEarlyRequestRelease = true;
            $resignation->EarlyReleaseDate = $request->EarlyReleaseDate;
            $resignation->EarlyReleaseStatus = config('exit-management.early_release_status.pending');
            $resignation->ModifiedBy = Auth::user()->email ?? 'system';
            $resignation->ModifiedOn = now();
            $resignation->save();

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $request->ResignationId,
                'ResignationStatus' => $resignation->Status,
                'EarlyReleaseStatus' => config('exit-management.early_release_status.pending'),
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Early release request submitted successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while requesting early release',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if Resignation Exists for Employee
     * 
     * @param int $employeeId
     * @return JsonResponse
     */
    public function isResignationExist(int $employeeId): JsonResponse
    {
        try {
            \Log::info('=== CHECKING RESIGNATION EXISTENCE ===', ['employee_id' => $employeeId]);

            // Get the most recent resignation for the employee
            $resignation = Resignation::where('EmployeeId', $employeeId)
                ->orderBy('CreatedOn', 'desc')
                ->first();

            \Log::info('Resignation query result', [
                'found' => $resignation !== null,
                'resignation_id' => $resignation ? $resignation->Id : null,
                'status' => $resignation ? $resignation->Status : null,
                'is_active' => $resignation ? $resignation->IsActive : null
            ]);

            $exists = $resignation !== null;
            $status = null;
            $statusLabel = null;

            if ($exists) {
                // Map numeric status to legacy string format
                $statusLabel = match($resignation->Status) {
                    1 => 'RESIGNED_PENDING',
                    2 => 'RESIGNED_ACCEPTED',
                    3 => 'RESIGNED_REJECTED',
                    4 => 'RESIGNED_REVOKED',
                    5 => 'RESIGNED_COMPLETED',
                    default => null,
                };
                $status = $resignation->Status;
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Check completed',
                'Data' => [
                    'Exists' => $exists,
                    'ResignationId' => $exists ? $resignation->Id : null,
                    'Status' => $statusLabel,
                    'StatusValue' => $status
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while checking resignation',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }
}
