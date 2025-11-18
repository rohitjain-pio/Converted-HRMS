<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNomineeInfo;
use App\Services\NomineeValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * NomineeController - Manage employee nominees with percentage validation
 * 
 * Implements Features #32-38 from Module-2:
 * - Nominee CRUD operations
 * - Percentage allocation validation (total must = 100%)
 * - Document upload handling
 */
class NomineeController extends Controller
{
    protected NomineeValidationService $validationService;

    public function __construct(NomineeValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Get all nominees for an employee
     * Feature #35: Nominee List View
     */
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        
        $summary = $this->validationService->getNomineeSummary($employeeId);
        
        // Transform nominees to include relationship_name
        $transformedNominees = $summary['nominees']->map(function ($nominee) {
            return [
                'id' => $nominee->id,
                'employee_id' => $nominee->employee_id,
                'nominee_name' => $nominee->nominee_name,
                'relationship_id' => $nominee->relationship_id,
                'relationship_name' => $nominee->relationship->relationship_name ?? null,
                'dob' => $nominee->dob?->format('Y-m-d'),
                'age' => $nominee->age,
                'contact_no' => $nominee->contact_no,
                'address' => $nominee->address,
                'percentage' => $nominee->percentage,
                'nominee_type' => $nominee->nominee_type,
                'is_nominee_minor' => $nominee->is_nominee_minor,
                'care_of' => $nominee->care_of,
                'file_name' => $nominee->file_name,
                'file_original_name' => $nominee->file_original_name,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => [
                'nominees' => $transformedNominees,
                'total_percentage' => $summary['total_percentage'],
                'remaining_percentage' => $summary['remaining_percentage'],
                'is_complete' => $summary['is_complete'],
                'count' => $summary['count']
            ]
        ]);
    }

    /**
     * Store a new nominee
     * Feature #32: Nominee Addition with percentage validation
     */
    public function store(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $employeeId = $request->input('employee_id');
            
            // Validate nominee data including percentage
            $validation = $this->validationService->validateNominee(
                $request->all(),
                $employeeId
            );

            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validation['errors'],
                    'remaining_percentage' => $validation['remaining_percentage']
                ], 422);
            }

            // Create nominee
            $nominee = UserNomineeInfo::create([
                'employee_id' => $employeeId,
                'nominee_name' => $request->input('nominee_name'),
                'relationship_id' => $request->input('relationship_id'),
                'dob' => $request->input('dob'),
                'contact_no' => $request->input('contact_no'),
                'address' => $request->input('address'),
                'percentage' => $request->input('percentage'),
                'nominee_type' => $request->input('nominee_type', 4), // 4 = All
                'is_nominee_minor' => $request->input('is_nominee_minor', 0),
                'care_of' => $request->input('care_of'),
                'file_name' => $request->input('file_name'),
                'file_original_name' => $request->input('file_original_name'),
                'created_by' => auth()->user()->email ?? 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);

            DB::commit();

            // Get updated summary
            $summary = $this->validationService->verifyTotalPercentage($employeeId);

            return response()->json([
                'success' => true,
                'message' => 'Nominee added successfully',
                'data' => $nominee,
                'percentage_summary' => $summary
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add nominee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update existing nominee
     * Feature #36: Nominee Update
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $nominee = UserNomineeInfo::find($id);
            
            if (!$nominee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominee not found'
                ], 404);
            }

            // Validate with current nominee excluded from percentage calculation
            $validation = $this->validationService->validateNominee(
                $request->all(),
                $nominee->employee_id,
                $id
            );

            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validation['errors'],
                    'remaining_percentage' => $validation['remaining_percentage']
                ], 422);
            }

            // Update nominee
            $nominee->update([
                'nominee_name' => $request->input('nominee_name', $nominee->nominee_name),
                'relationship_id' => $request->input('relationship_id', $nominee->relationship_id),
                'dob' => $request->input('dob', $nominee->dob),
                'contact_no' => $request->input('contact_no', $nominee->contact_no),
                'address' => $request->input('address', $nominee->address),
                'percentage' => $request->input('percentage', $nominee->percentage),
                'nominee_type' => $request->input('nominee_type', $nominee->nominee_type),
                'is_nominee_minor' => $request->input('is_nominee_minor', $nominee->is_nominee_minor),
                'care_of' => $request->input('care_of', $nominee->care_of),
                'file_name' => $request->input('file_name', $nominee->file_name),
                'file_original_name' => $request->input('file_original_name', $nominee->file_original_name),
                'modified_by' => auth()->user()->email ?? 'system',
                'modified_on' => now()
            ]);

            DB::commit();

            $summary = $this->validationService->verifyTotalPercentage($nominee->employee_id);

            return response()->json([
                'success' => true,
                'message' => 'Nominee updated successfully',
                'data' => $nominee,
                'percentage_summary' => $summary
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update nominee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete nominee (soft delete)
     * Feature #37: Nominee Delete
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $nominee = UserNomineeInfo::find($id);
            
            if (!$nominee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominee not found'
                ], 404);
            }

            $employeeId = $nominee->employee_id;
            
            $nominee->softDelete(auth()->user()->email ?? 'system');

            $summary = $this->validationService->verifyTotalPercentage($employeeId);

            return response()->json([
                'success' => true,
                'message' => 'Nominee deleted successfully',
                'percentage_summary' => $summary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete nominee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify nominee percentage allocation for employee
     */
    public function verifyPercentage(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        
        $summary = $this->validationService->verifyTotalPercentage($employeeId);

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }
}
