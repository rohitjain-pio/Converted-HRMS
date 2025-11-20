<?php

namespace App\Http\Controllers;

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
        $validator = Validator::make($request->all(), [
            'EmployeeId' => 'required|integer|exists:employeedata,Id',
            'DepartmentID' => 'required|integer|exists:department,Id',
            'Reason' => 'required|string|max:500',
            'ExitDiscussion' => 'nullable|boolean',
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
            // Check if resignation already exists for this employee
            $existingResignation = Resignation::where('EmployeeId', $request->EmployeeId)
                ->whereIn('Status', [
                    config('exit-management.resignation_status.pending'),
                    config('exit-management.resignation_status.accepted')
                ])
                ->first();

            if ($existingResignation) {
                return response()->json([
                    'StatusCode' => 400,
                    'Message' => 'Active resignation already exists for this employee',
                    'Data' => null
                ], 400);
            }

            // Calculate last working day
            $lastWorkingDay = $this->exitEmployeeService->calculateLastWorkingDay(
                $request->EmployeeId,
                now()->format('Y-m-d')
            );

            // Get employee details for reporting manager
            $employee = EmployeeData::find($request->EmployeeId);

            // Create resignation
            $resignation = Resignation::create([
                'EmployeeId' => $request->EmployeeId,
                'DepartmentID' => $request->DepartmentID,
                'ReportingManagerId' => $employee->ReportingManager ?? null,
                'LastWorkingDay' => $lastWorkingDay,
                'Reason' => $request->Reason,
                'ExitDiscussion' => $request->ExitDiscussion ?? false,
                'Status' => config('exit-management.resignation_status.pending'),
                'IsActive' => true,
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $resignation->Id,
                'ResignationStatus' => config('exit-management.resignation_status.pending'),
                'EarlyReleaseStatus' => null,
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation submitted successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while submitting resignation',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Resignation Form by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function getResignationForm(int $id): JsonResponse
    {
        try {
            $resignation = Resignation::with([
                'employee',
                'department',
                'reportingManager'
            ])->find($id);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation details retrieved successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving resignation',
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

            // Add clearance completion status
            $resignation->allClearancesCompleted = $this->exitEmployeeService->areAllClearancesCompleted($id);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation exit details retrieved successfully',
                'Data' => $resignation
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
            $resignation = Resignation::where('EmployeeId', $employeeId)
                ->whereIn('Status', [
                    config('exit-management.resignation_status.pending'),
                    config('exit-management.resignation_status.accepted')
                ])
                ->first();

            $exists = $resignation !== null;

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Check completed',
                'Data' => [
                    'Exists' => $exists,
                    'ResignationId' => $exists ? $resignation->Id : null
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
