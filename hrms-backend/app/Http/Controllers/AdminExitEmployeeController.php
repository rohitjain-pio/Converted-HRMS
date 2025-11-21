<?php

namespace App\Http\Controllers;

use App\Models\Resignation;
use App\Models\ResignationHistory;
use App\Models\HRClearance;
use App\Models\DepartmentClearance;
use App\Models\ITClearance;
use App\Models\AccountClearance;
use App\Services\ExitEmployeeService;
use App\Services\BlobStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminExitEmployeeController extends Controller
{
    protected $exitEmployeeService;
    protected $blobStorageService;

    // Branch location mapping (from legacy enum)
    protected $branchMap = [
        1 => 'Hyderabad',
        2 => 'Jaipur',
        3 => 'Pune',
    ];

    public function __construct(ExitEmployeeService $exitEmployeeService, BlobStorageService $blobStorageService)
    {
        $this->exitEmployeeService = $exitEmployeeService;
        $this->blobStorageService = $blobStorageService;
    }

    /**
     * Get Resignation List with Search/Filtering
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getResignationList(Request $request): JsonResponse
    {
        try {
            $query = Resignation::with(['employee.employmentDetail', 'department', 'reportingManager']);

            // Apply filters if provided
            if ($request->has('filters')) {
                $filters = $request->input('filters');
                
                // Employee Code filter
                if (!empty($filters['employeeCode'])) {
                    $query->whereHas('employee', function($q) use ($filters) {
                        $q->where('employee_code', 'like', '%' . $filters['employeeCode'] . '%');
                    });
                }
                
                // Employee Name filter
                if (!empty($filters['employeeName'])) {
                    $query->whereHas('employee', function($q) use ($filters) {
                        $q->where(function($nameQuery) use ($filters) {
                            $nameQuery->where('first_name', 'like', '%' . $filters['employeeName'] . '%')
                                     ->orWhere('last_name', 'like', '%' . $filters['employeeName'] . '%');
                        });
                    });
                }
                
                // Department filter
                if (isset($filters['departmentId']) && $filters['departmentId'] > 0) {
                    $query->where('DepartmentID', $filters['departmentId']);
                }
                
                // Branch filter - need to join through employee
                if (isset($filters['branchId']) && $filters['branchId'] > 0) {
                    $query->whereHas('employee', function($q) use ($filters) {
                        $q->where('branch_id', $filters['branchId']);
                    });
                }
                
                // Resignation Status filter
                if (isset($filters['resignationStatus']) && $filters['resignationStatus'] > 0) {
                    $query->where('Status', $filters['resignationStatus']);
                }
                
                // Employee Status filter (Process field)
                if (isset($filters['employeeStatus']) && $filters['employeeStatus'] > 0) {
                    $query->where('Process', $filters['employeeStatus']);
                }
                
                // IT No Due filter
                if (isset($filters['itNoDue']) && $filters['itNoDue'] !== null) {
                    $query->where('ITDues', $filters['itNoDue']);
                }
                
                // Accounts No Due filter
                if (isset($filters['accountsNoDue']) && $filters['accountsNoDue'] !== null) {
                    $query->where('AccountNoDue', $filters['accountsNoDue']);
                }
                
                // Last Working Day From filter
                if (!empty($filters['lastWorkingDayFrom'])) {
                    $query->where('LastWorkingDay', '>=', $filters['lastWorkingDayFrom']);
                }
                
                // Last Working Day To filter
                if (!empty($filters['lastWorkingDayTo'])) {
                    $query->where('LastWorkingDay', '<=', $filters['lastWorkingDayTo']);
                }
                
                // Resignation Date filter
                if (!empty($filters['resignationDate'])) {
                    $query->whereDate('CreatedOn', $filters['resignationDate']);
                }
            }

            // Sorting
            $sortColumn = $request->input('sortColumnName', 'CreatedOn');
            $sortDirection = $request->input('sortDirection', 'DESC');
            
            // Map frontend column names to database column names
            $columnMap = [
                'employeeCode' => 'employee.EmployeeCode',
                'employeeName' => 'employee.Name',
                'departmentName' => 'department.DepartmentName',
                'resignationDate' => 'CreatedOn',
                'lastWorkingDay' => 'LastWorkingDay',
                'resignationStatus' => 'Status',
                'employeeStatus' => 'Process',
            ];
            
            if (isset($columnMap[$sortColumn])) {
                $sortColumn = $columnMap[$sortColumn];
            }

            // Get total count before pagination
            $totalRecords = $query->count();

            // Pagination
            $startIndex = $request->input('startIndex', 0);
            $pageSize = $request->input('pageSize', 10);
            
            $resignations = $query->skip($startIndex)
                                  ->take($pageSize)
                                  ->orderBy($sortColumn, $sortDirection)
                                  ->get();

            // Transform data to match frontend expectations
            $exitEmployeeList = $resignations->map(function($resignation) {
                $employee = $resignation->employee;
                
                // Get employment details for department, branch, and reporting manager
                $employmentDetail = $employee ? $employee->employmentDetail : null;
                
                // Get department from employment_details (more reliable than resignation.DepartmentID)
                $departmentName = '';
                if ($employmentDetail && $employmentDetail->department_id) {
                    $department = \App\Models\Department::find($employmentDetail->department_id);
                    $departmentName = $department ? $department->department : '';
                }
                // Fallback to resignation table DepartmentID if employment_details doesn't have it
                if (empty($departmentName) && $resignation->DepartmentID) {
                    $department = \App\Models\Department::find($resignation->DepartmentID);
                    $departmentName = $department ? $department->department : '';
                }
                
                // Get branch name from employment_details.branch_id
                $branchName = '';
                if ($employmentDetail && $employmentDetail->branch_id) {
                    $branchName = $this->branchMap[$employmentDetail->branch_id] ?? '';
                }
                // Fallback: try to get from employee table if available
                if (empty($branchName) && $employee && isset($employee->branch_id)) {
                    $branchName = $this->branchMap[$employee->branch_id] ?? '';
                }
                
                // Get reporting manager from employment_details or fallback to resignation table
                $reportingManagerName = '';
                if ($employmentDetail && $employmentDetail->reporting_manger_id) {
                    $manager = \App\Models\EmployeeData::find($employmentDetail->reporting_manger_id);
                    $reportingManagerName = $manager ? trim(($manager->first_name ?? '') . ' ' . ($manager->last_name ?? '')) : '';
                } elseif ($resignation->reportingManager) {
                    $reportingManagerName = trim(($resignation->reportingManager->first_name ?? '') . ' ' . ($resignation->reportingManager->last_name ?? ''));
                }
                
                return [
                    'resignationId' => $resignation->Id,
                    'employeeCode' => $employee->employee_code ?? '',
                    'employeeName' => trim(($employee->first_name ?? '') . ' ' . ($employee->last_name ?? '')),
                    'departmentName' => $departmentName,
                    'branchName' => $branchName,
                    'resignationDate' => $resignation->CreatedOn ? $resignation->CreatedOn->format('Y-m-d') : null,
                    'lastWorkingDay' => $resignation->LastWorkingDay ? $resignation->LastWorkingDay->format('Y-m-d') : null,
                    'earlyReleaseRequest' => (bool)$resignation->IsEarlyRequestRelease,
                    'earlyReleaseDate' => $resignation->EarlyReleaseDate ? $resignation->EarlyReleaseDate->format('Y-m-d') : null,
                    'earlyReleaseApprove' => $resignation->IsEarlyRequestApproved,
                    'resignationStatus' => $resignation->Status ?? 1,
                    'employeeStatus' => $resignation->Process ?? 1,
                    'employmentStatus' => $resignation->SettlementStatus ?? 0,
                    'ktStatus' => $resignation->KTStatus ?? 0,
                    'exitInterviewStatus' => (bool)$resignation->ExitInterviewStatus,
                    'itNoDue' => (bool)$resignation->ITDues,
                    'accountsNoDue' => (bool)$resignation->AccountNoDue,
                    'reportingManagerName' => $reportingManagerName,
                ];
            });

            return response()->json([
                'statusCode' => 200,
                'message' => 'Resignation list retrieved successfully',
                'result' => [
                    'exitEmployeeList' => $exitEmployeeList,
                    'totalRecords' => $totalRecords,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'statusCode' => 500,
                'message' => 'An error occurred while retrieving resignation list',
                'result' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Resignation Detail by ID (Admin View)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function getResignationById(int $id): JsonResponse
    {
        try {
            $resignation = Resignation::with([
                'employee.employmentDetail',
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
                    'statusCode' => 404,
                    'message' => 'Resignation not found',
                    'result' => null
                ], 404);
            }

            // Get employment details for department and reporting manager
            $employee = $resignation->employee;
            $employmentDetail = $employee ? $employee->employmentDetail : null;
            
            // Get department from employment_details
            $departmentName = '';
            if ($employmentDetail && $employmentDetail->department_id) {
                $department = \App\Models\Department::find($employmentDetail->department_id);
                $departmentName = $department ? $department->department : '';
            }
            // Fallback to resignation table DepartmentID
            if (empty($departmentName) && $resignation->DepartmentID) {
                $department = \App\Models\Department::find($resignation->DepartmentID);
                $departmentName = $department ? $department->department : '';
            }
            
            // Get branch name from employment_details.branch_id
            $branchName = '';
            if ($employmentDetail && $employmentDetail->branch_id) {
                $branchName = $this->branchMap[$employmentDetail->branch_id] ?? '';
            }
            // Fallback: try to get from employee table
            if (empty($branchName) && $employee && isset($employee->branch_id)) {
                $branchName = $this->branchMap[$employee->branch_id] ?? '';
            }
            
            // Get reporting manager from employment_details or fallback to resignation table
            $reportingManagerName = '';
            if ($employmentDetail && $employmentDetail->reporting_manger_id) {
                $manager = \App\Models\EmployeeData::find($employmentDetail->reporting_manger_id);
                $reportingManagerName = $manager ? trim(($manager->first_name ?? '') . ' ' . ($manager->last_name ?? '')) : '';
            } elseif ($resignation->reportingManager) {
                $reportingManagerName = trim(($resignation->reportingManager->first_name ?? '') . ' ' . ($resignation->reportingManager->last_name ?? ''));
            }
            
            // Transform resignation data to match frontend ExitDetails type
            $exitDetails = [
                'resignationId' => $resignation->Id,
                'employeeCode' => $employee->employee_code ?? '',
                'employeeName' => trim(($employee->first_name ?? '') . ' ' . ($employee->last_name ?? '')),
                'departmentName' => $departmentName,
                'branchName' => $branchName,
                'resignationDate' => $resignation->CreatedOn ? Carbon::parse($resignation->CreatedOn)->format('Y-m-d') : null,
                'lastWorkingDay' => $resignation->LastWorkingDay ? Carbon::parse($resignation->LastWorkingDay)->format('Y-m-d') : null,
                'earlyReleaseDate' => $resignation->EarlyReleaseDate ? Carbon::parse($resignation->EarlyReleaseDate)->format('Y-m-d') : null,
                'earlyReleaseRequest' => (bool)$resignation->EarlyReleaseRequest,
                'earlyReleaseStatus' => $resignation->EarlyReleaseStatus ?? 0,
                'resignationStatus' => $resignation->Status,
                'employeeStatus' => $resignation->Process,
                'employmentStatus' => $employee->employment_status ?? 1,
                'ktStatus' => $resignation->departmentClearance ? (bool)$resignation->departmentClearance->KTStatus : false,
                'exitInterviewStatus' => $resignation->hrClearance ? (bool)$resignation->hrClearance->ExitInterviewStatus : false,
                'itNoDue' => (bool)$resignation->ITDues,
                'accountsNoDue' => (bool)$resignation->AccountNoDue,
                'reportingManagerName' => $reportingManagerName,
                'jobType' => $employee->job_type ?? 0,
                'reason' => $resignation->Reason ?? '',
                'rejectResignationReason' => $resignation->RejectionReason ?? '',
                'rejectEarlyReleaseReason' => $resignation->EarlyReleaseRejectionReason ?? '',
                'allClearancesCompleted' => $this->exitEmployeeService->areAllClearancesCompleted($id),
            ];

            return response()->json([
                'statusCode' => 200,
                'message' => 'Resignation details retrieved successfully',
                'result' => $exitDetails
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'statusCode' => 500,
                'message' => 'An error occurred while retrieving resignation',
                'result' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept Resignation (Admin)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function acceptResignation(int $id): JsonResponse
    {
        try {
            $resignation = Resignation::find($id);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            if ($resignation->Status != config('exit-management.resignation_status.pending')) {
                return response()->json([
                    'StatusCode' => 400,
                    'Message' => 'Only pending resignations can be accepted',
                    'Data' => null
                ], 400);
            }

            // Update status to accepted
            $resignation->Status = config('exit-management.resignation_status.accepted');
            $resignation->ProcessedBy = Auth::id();
            $resignation->ProcessedAt = now();
            $resignation->ModifiedBy = Auth::user()->email ?? 'system';
            $resignation->ModifiedOn = now();
            $resignation->save();

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $id,
                'ResignationStatus' => config('exit-management.resignation_status.accepted'),
                'EarlyReleaseStatus' => $resignation->EarlyReleaseStatus,
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Resignation accepted successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while accepting resignation',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept Early Release (Admin)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function acceptEarlyRelease(Request $request): JsonResponse
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
            $resignation = Resignation::find($request->ResignationId);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Update early release status
            $resignation->IsEarlyRequestApproved = true;
            $resignation->EarlyReleaseStatus = config('exit-management.early_release_status.approved');
            $resignation->EarlyReleaseDate = $request->EarlyReleaseDate;
            $resignation->LastWorkingDay = $request->EarlyReleaseDate;
            $resignation->ModifiedBy = Auth::user()->email ?? 'system';
            $resignation->ModifiedOn = now();
            $resignation->save();

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $request->ResignationId,
                'ResignationStatus' => $resignation->Status,
                'EarlyReleaseStatus' => config('exit-management.early_release_status.approved'),
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Early release approved successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while approving early release',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin Rejection (Resignation or Early Release)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function adminRejection(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'RejectionType' => 'required|in:Resignation,EarlyRelease',
            'RejectionReason' => 'required|string|max:1000',
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
            $resignation = Resignation::find($request->ResignationId);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            if ($request->RejectionType === 'Resignation') {
                // Reject resignation
                $resignation->Status = config('exit-management.resignation_status.rejected');
                $resignation->RejectResignationReason = $request->RejectionReason;
                $resignation->IsActive = false;
                
                $historyStatus = config('exit-management.resignation_status.rejected');
                $historyEarlyRelease = null;
                
            } else {
                // Reject early release
                $resignation->EarlyReleaseStatus = config('exit-management.early_release_status.rejected');
                $resignation->RejectEarlyReleaseReason = $request->RejectionReason;
                $resignation->IsEarlyRequestApproved = false;
                
                $historyStatus = $resignation->Status;
                $historyEarlyRelease = config('exit-management.early_release_status.rejected');
            }

            $resignation->ProcessedBy = Auth::id();
            $resignation->ProcessedAt = now();
            $resignation->ModifiedBy = Auth::user()->email ?? 'system';
            $resignation->ModifiedOn = now();
            $resignation->save();

            // Create history entry
            ResignationHistory::create([
                'ResignationId' => $request->ResignationId,
                'ResignationStatus' => $historyStatus,
                'EarlyReleaseStatus' => $historyEarlyRelease,
                'CreatedOn' => now(),
                'CreatedBy' => Auth::user()->email ?? 'system',
            ]);

            return response()->json([
                'StatusCode' => 200,
                'Message' => $request->RejectionType . ' rejected successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while rejecting ' . $request->RejectionType,
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update Last Working Day
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updateLastWorkingDay(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'LastWorkingDay' => 'required|date',
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
            $resignation = Resignation::find($request->ResignationId);

            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            $resignation->LastWorkingDay = $request->LastWorkingDay;
            $resignation->ModifiedBy = Auth::user()->email ?? 'system';
            $resignation->ModifiedOn = now();
            $resignation->save();

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Last working day updated successfully',
                'Data' => $resignation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while updating last working day',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get HR Clearance by Resignation ID
     * 
     * @param int $resignationId
     * @return JsonResponse
     */
    public function getHRClearance(int $resignationId): JsonResponse
    {
        try {
            $clearance = HRClearance::where('ResignationId', $resignationId)->first();

            if (!$clearance) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'HR Clearance not found',
                    'Data' => null
                ], 404);
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'HR Clearance retrieved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving HR Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upsert HR Clearance
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function upsertHRClearance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'AdvanceBonusRecoveryAmount' => 'required|numeric',
            'ServiceAgreementDetails' => 'nullable|string',
            'CurrentEL' => 'nullable|numeric',
            'NumberOfBuyOutDays' => 'required|integer',
            'ExitInterviewStatus' => 'nullable|boolean',
            'ExitInterviewDetails' => 'nullable|string',
            'AttachmentFile' => 'nullable|file|max:' . (env('USER_DOC_FILE_MAX_SIZE', 5242880) / 1024),
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
            // Get resignation to find employee ID
            $resignation = Resignation::find($request->ResignationId);
            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Find existing clearance
            $clearance = HRClearance::where('ResignationId', $request->ResignationId)->first();
            
            $attachment = $clearance->Attachment ?? '';
            $fileOriginalName = $clearance->FileOriginalName ?? null;
            
            // Handle file upload if present
            if ($request->hasFile('AttachmentFile')) {
                $file = $request->file('AttachmentFile');
                
                // Delete old file if exists
                if ($clearance && $clearance->Attachment) {
                    $this->blobStorageService->deleteFile($clearance->Attachment, 'user-documents');
                }
                
                // Upload new file to Azure Blob Storage
                $attachment = $this->blobStorageService->uploadFile(
                    $file,
                    $resignation->EmployeeId,
                    'user-documents'
                );
                $fileOriginalName = $file->getClientOriginalName();
            }

            $clearance = HRClearance::updateOrCreate(
                ['ResignationId' => $request->ResignationId],
                [
                    'AdvanceBonusRecoveryAmount' => $request->AdvanceBonusRecoveryAmount,
                    'ServiceAgreementDetails' => $request->ServiceAgreementDetails,
                    'CurrentEL' => $request->CurrentEL,
                    'NumberOfBuyOutDays' => $request->NumberOfBuyOutDays,
                    'ExitInterviewStatus' => $request->ExitInterviewStatus ?? false,
                    'ExitInterviewDetails' => $request->ExitInterviewDetails,
                    'Attachment' => $attachment,
                    'FileOriginalName' => $fileOriginalName,
                    'CreatedBy' => $clearance->CreatedBy ?? Auth::user()->email ?? 'system',
                    'CreatedOn' => $clearance->CreatedOn ?? now(),
                    'ModifiedBy' => Auth::user()->email ?? 'system',
                    'ModifiedOn' => now(),
                ]
            );

            // Check if all clearances are complete
            $this->exitEmployeeService->autoCompleteResignationIfReady($request->ResignationId);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'HR Clearance saved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while saving HR Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Department Clearance by Resignation ID
     * 
     * @param int $resignationId
     * @return JsonResponse
     */
    public function getDepartmentClearance(int $resignationId): JsonResponse
    {
        try {
            $clearance = DepartmentClearance::where('ResignationId', $resignationId)->first();

            if (!$clearance) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Department Clearance not found',
                    'Data' => null
                ], 404);
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Department Clearance retrieved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving Department Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upsert Department Clearance
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function upsertDepartmentClearance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'KTStatus' => 'nullable|integer',
            'KTNotes' => 'required|string',
            'AttachmentFile' => 'nullable|file|max:' . (env('USER_DOC_FILE_MAX_SIZE', 5242880) / 1024),
            'KTUsers' => 'required|string',
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
            // Get resignation to find employee ID
            $resignation = Resignation::find($request->ResignationId);
            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Find existing clearance
            $clearance = DepartmentClearance::where('ResignationId', $request->ResignationId)->first();
            
            $attachment = $clearance->Attachment ?? '';
            $fileOriginalName = $clearance->FileOriginalName ?? null;
            
            // Handle file upload if present
            if ($request->hasFile('AttachmentFile')) {
                $file = $request->file('AttachmentFile');
                
                // Delete old file if exists
                if ($clearance && $clearance->Attachment) {
                    $this->blobStorageService->deleteFile($clearance->Attachment, 'user-documents');
                }
                
                // Upload new file to Azure Blob Storage
                $attachment = $this->blobStorageService->uploadFile(
                    $file,
                    $resignation->EmployeeId,
                    'user-documents'
                );
                $fileOriginalName = $file->getClientOriginalName();
            }

            $clearance = DepartmentClearance::updateOrCreate(
                ['ResignationId' => $request->ResignationId],
                [
                    'KTStatus' => $request->KTStatus,
                    'KTNotes' => $request->KTNotes,
                    'Attachment' => $attachment,
                    'KTUsers' => $request->KTUsers,
                    'FileOriginalName' => $fileOriginalName,
                    'CreatedBy' => $clearance->CreatedBy ?? Auth::user()->email ?? 'system',
                    'CreatedOn' => $clearance->CreatedOn ?? now(),
                    'ModifiedBy' => Auth::user()->email ?? 'system',
                    'ModifiedOn' => now(),
                ]
            );

            // Check if all clearances are complete
            $this->exitEmployeeService->autoCompleteResignationIfReady($request->ResignationId);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Department Clearance saved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while saving Department Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get IT Clearance by Resignation ID
     * 
     * @param int $resignationId
     * @return JsonResponse
     */
    public function getITClearance(int $resignationId): JsonResponse
    {
        try {
            $clearance = ITClearance::with('assetConditionDetails')
                ->where('ResignationId', $resignationId)
                ->first();

            if (!$clearance) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'IT Clearance not found',
                    'Data' => null
                ], 404);
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'IT Clearance retrieved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving IT Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add or Update IT Clearance
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function addUpdateITClearance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'AccessRevoked' => 'required|boolean',
            'AssetReturned' => 'required|boolean',
            'AssetCondition' => 'required|integer|exists:asset_condition,Id',
            'AttachmentFile' => 'nullable|file|max:' . (env('USER_DOC_FILE_MAX_SIZE', 5242880) / 1024), // Max size in KB
            'Note' => 'nullable|string',
            'ITClearanceCertification' => 'required|boolean',
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
            // Get resignation to find employee ID
            $resignation = Resignation::find($request->ResignationId);
            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Find existing clearance
            $clearance = ITClearance::where('ResignationId', $request->ResignationId)->first();
            
            $attachmentUrl = $clearance->AttachmentUrl ?? null;
            $fileOriginalName = $clearance->FileOriginalName ?? null;
            
            // Handle file upload if present
            if ($request->hasFile('AttachmentFile')) {
                $file = $request->file('AttachmentFile');
                
                // Delete old file if exists
                if ($clearance && $clearance->AttachmentUrl) {
                    $this->blobStorageService->deleteFile($clearance->AttachmentUrl, 'user-documents');
                }
                
                // Upload new file to Azure Blob Storage
                $attachmentUrl = $this->blobStorageService->uploadFile(
                    $file,
                    $resignation->EmployeeId,
                    'user-documents'
                );
                $fileOriginalName = $file->getClientOriginalName();
            }

            // Update or create clearance
            $clearance = ITClearance::updateOrCreate(
                ['ResignationId' => $request->ResignationId],
                [
                    'AccessRevoked' => $request->AccessRevoked,
                    'AssetReturned' => $request->AssetReturned,
                    'AssetCondition' => $request->AssetCondition,
                    'AttachmentUrl' => $attachmentUrl,
                    'Note' => $request->Note,
                    'ITClearanceCertification' => $request->ITClearanceCertification,
                    'FileOriginalName' => $fileOriginalName,
                    'CreatedBy' => $clearance->CreatedBy ?? Auth::user()->email ?? 'system',
                    'CreatedOn' => $clearance->CreatedOn ?? now(),
                    'ModifiedBy' => Auth::user()->email ?? 'system',
                    'ModifiedOn' => now(),
                ]
            );

            // Check if all clearances are complete
            $this->exitEmployeeService->autoCompleteResignationIfReady($request->ResignationId);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'IT Clearance saved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while saving IT Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Account Clearance by Resignation ID
     * 
     * @param int $resignationId
     * @return JsonResponse
     */
    public function getAccountClearance(int $resignationId): JsonResponse
    {
        try {
            $clearance = AccountClearance::where('ResignationId', $resignationId)->first();

            if (!$clearance) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Account Clearance not found',
                    'Data' => null
                ], 404);
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Account Clearance retrieved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while retrieving Account Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add or Update Account Clearance
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function addUpdateAccountClearance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ResignationId' => 'required|integer|exists:resignation,Id',
            'FnFStatus' => 'nullable|boolean',
            'FnFAmount' => 'nullable|numeric',
            'IssueNoDueCertificate' => 'nullable|boolean',
            'Note' => 'nullable|string',
            'AttachmentFile' => 'nullable|file|max:' . (env('USER_DOC_FILE_MAX_SIZE', 5242880) / 1024),
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
            // Get resignation to find employee ID
            $resignation = Resignation::find($request->ResignationId);
            if (!$resignation) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Resignation not found',
                    'Data' => null
                ], 404);
            }

            // Find existing clearance
            $clearance = AccountClearance::where('ResignationId', $request->ResignationId)->first();
            
            $accountAttachment = $clearance->AccountAttachment ?? null;
            $fileOriginalName = $clearance->FileOriginalName ?? null;
            
            // Handle file upload if present
            if ($request->hasFile('AttachmentFile')) {
                $file = $request->file('AttachmentFile');
                
                // Delete old file if exists
                if ($clearance && $clearance->AccountAttachment) {
                    $this->blobStorageService->deleteFile($clearance->AccountAttachment, 'user-documents');
                }
                
                // Upload new file to Azure Blob Storage
                $accountAttachment = $this->blobStorageService->uploadFile(
                    $file,
                    $resignation->EmployeeId,
                    'user-documents'
                );
                $fileOriginalName = $file->getClientOriginalName();
            }

            $clearance = AccountClearance::updateOrCreate(
                ['ResignationId' => $request->ResignationId],
                [
                    'FnFStatus' => $request->FnFStatus ?? false,
                    'FnFAmount' => $request->FnFAmount,
                    'IssueNoDueCertificate' => $request->IssueNoDueCertificate ?? false,
                    'Note' => $request->Note,
                    'AccountAttachment' => $accountAttachment,
                    'FileOriginalName' => $fileOriginalName,
                    'CreatedBy' => $clearance->CreatedBy ?? Auth::user()->email ?? 'system',
                    'CreatedOn' => $clearance->CreatedOn ?? now(),
                    'ModifiedBy' => Auth::user()->email ?? 'system',
                    'ModifiedOn' => now(),
                ]
            );

            // Check if all clearances are complete
            $this->exitEmployeeService->autoCompleteResignationIfReady($request->ResignationId);

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Account Clearance saved successfully',
                'Data' => $clearance
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while saving Account Clearance',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Document SAS URL
     * Generate a time-limited SAS URL for viewing/downloading documents from Azure Blob Storage
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getDocumentUrl(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'containerName' => 'required|string',
            'filename' => 'required|string',
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
            $sasUrl = $this->blobStorageService->getFileSasUrl(
                $request->containerName,
                $request->filename
            );

            if (!$sasUrl) {
                return response()->json([
                    'StatusCode' => 404,
                    'Message' => 'Document not found',
                    'Data' => null
                ], 404);
            }

            return response()->json([
                'StatusCode' => 200,
                'Message' => 'Document URL generated successfully',
                'Data' => [
                    'url' => $sasUrl,
                    'expiresIn' => '7 days'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'StatusCode' => 500,
                'Message' => 'An error occurred while generating document URL',
                'Data' => null,
                'Error' => $e->getMessage()
            ], 500);
        }
    }
}
