<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PreviousEmployer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PreviousEmployerController extends Controller
{
    /**
     * Get all previous employers for an employee
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $employeeId = $request->query('employee_id');
            
            if (!$employeeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee ID is required'
                ], 400);
            }

            $previousEmployers = PreviousEmployer::where('employee_id', $employeeId)
                ->where('is_deleted', 0)
                ->orderBy('employment_start_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $previousEmployers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch previous employers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new previous employer
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|exists:employee_data,id',
                'company_name' => 'required|string|max:255',
                'designation' => 'required|string|max:255',
                'employment_start_date' => 'required|date',
                'employment_end_date' => 'required|date|after:employment_start_date',
                'reason_for_leaving' => 'nullable|string',
                'manager_name' => 'nullable|string|max:255',
                'manager_contact' => 'nullable|string|max:50',
                'company_address' => 'nullable|string',
                'hr_name' => 'nullable|string|max:255',
                'hr_contact' => 'nullable|string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['created_by'] = auth()->user()->name ?? 'system';
            $data['created_on'] = now();
            $data['is_deleted'] = 0;

            $previousEmployer = PreviousEmployer::create($data);
            
            // Calculate duration
            $previousEmployer->calculateDuration();
            $previousEmployer->save();

            return response()->json([
                'success' => true,
                'message' => 'Previous employer added successfully',
                'data' => $previousEmployer
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add previous employer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single previous employer
     */
    public function show(int $id): JsonResponse
    {
        try {
            $previousEmployer = PreviousEmployer::where('id', $id)
                ->where('is_deleted', 0)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $previousEmployer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Previous employer not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a previous employer
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $previousEmployer = PreviousEmployer::where('id', $id)
                ->where('is_deleted', 0)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'company_name' => 'sometimes|string|max:255',
                'designation' => 'sometimes|string|max:255',
                'employment_start_date' => 'sometimes|date',
                'employment_end_date' => 'sometimes|date|after:employment_start_date',
                'reason_for_leaving' => 'nullable|string',
                'manager_name' => 'nullable|string|max:255',
                'manager_contact' => 'nullable|string|max:50',
                'company_address' => 'nullable|string',
                'hr_name' => 'nullable|string|max:255',
                'hr_contact' => 'nullable|string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['modified_by'] = auth()->user()->name ?? 'system';
            $data['modified_on'] = now();

            $previousEmployer->update($data);
            
            // Recalculate duration if dates changed
            if (isset($data['employment_start_date']) || isset($data['employment_end_date'])) {
                $previousEmployer->calculateDuration();
                $previousEmployer->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Previous employer updated successfully',
                'data' => $previousEmployer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update previous employer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a previous employer (soft delete)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $previousEmployer = PreviousEmployer::where('id', $id)
                ->where('is_deleted', 0)
                ->firstOrFail();

            $previousEmployer->update([
                'is_deleted' => 1,
                'modified_by' => Auth::id(),
                'modified_on' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Previous employer deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete previous employer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
