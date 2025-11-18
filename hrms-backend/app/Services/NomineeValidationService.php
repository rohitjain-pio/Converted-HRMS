<?php

namespace App\Services;

use App\Models\UserNomineeInfo;
use Illuminate\Support\Facades\Validator;

/**
 * NomineeValidationService - Enforce business rules for nominee management
 * 
 * CRITICAL Business Rule from Legacy System (Feature #33):
 * - Total nominee percentage MUST equal exactly 100%
 * - Validation happens at application level AND database level
 */
class NomineeValidationService
{
    /**
     * Validate nominee data before save/update
     * 
     * @param array $nomineeData
     * @param int $employeeId
     * @param int|null $nomineeId For updates, pass existing nominee ID to exclude from percentage check
     * @return array ['valid' => bool, 'errors' => array, 'remaining_percentage' => float]
     */
    public function validateNominee(array $nomineeData, int $employeeId, ?int $nomineeId = null): array
    {
        $errors = [];
        
        // Basic field validation
        $validator = Validator::make($nomineeData, [
            'nominee_name' => 'required|string|max:100',
            'relationship_id' => 'required|exists:relationship,id',
            'percentage' => 'required|numeric|min:1|max:100',
            'is_nominee_minor' => 'required|boolean',
            'care_of' => 'required_if:is_nominee_minor,1|string|max:100',
        ]);

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->toArray(),
                'remaining_percentage' => 0
            ];
        }

        // Calculate remaining percentage
        $currentTotal = UserNomineeInfo::where('employee_id', $employeeId)
            ->where('is_deleted', 0);
        
        if ($nomineeId) {
            $currentTotal->where('id', '!=', $nomineeId);
        }
        
        $currentTotal = $currentTotal->sum('percentage');
        $requestedPercentage = $nomineeData['percentage'];
        $newTotal = $currentTotal + $requestedPercentage;
        
        // Validate percentage doesn't exceed 100%
        if ($newTotal > 100) {
            $remaining = 100 - $currentTotal;
            $errors['percentage'] = [
                "Cannot allocate {$requestedPercentage}%. Only {$remaining}% remaining. Current total: {$currentTotal}%"
            ];
            
            return [
                'valid' => false,
                'errors' => $errors,
                'remaining_percentage' => $remaining
            ];
        }

        return [
            'valid' => true,
            'errors' => [],
            'remaining_percentage' => 100 - $newTotal
        ];
    }

    /**
     * Verify total percentage = 100% for an employee
     * Used before finalizing nominee information
     * 
     * @param int $employeeId
     * @return array ['complete' => bool, 'total' => float, 'message' => string]
     */
    public function verifyTotalPercentage(int $employeeId): array
    {
        $total = UserNomineeInfo::where('employee_id', $employeeId)
            ->where('is_deleted', 0)
            ->sum('percentage');
        
        $isComplete = $total == 100;
        
        $message = $isComplete 
            ? 'Nominee allocation is complete (100%)'
            : "Nominee allocation incomplete. Current: {$total}%, Remaining: " . (100 - $total) . "%";
        
        return [
            'complete' => $isComplete,
            'total' => $total,
            'message' => $message
        ];
    }

    /**
     * Get nominee summary for an employee
     * 
     * @param int $employeeId
     * @return array
     */
    public function getNomineeSummary(int $employeeId): array
    {
        $nominees = UserNomineeInfo::with('relationship')
            ->where('employee_id', $employeeId)
            ->where('is_deleted', 0)
            ->get();
        
        $totalPercentage = $nominees->sum('percentage');
        $isComplete = $totalPercentage == 100;
        
        return [
            'nominees' => $nominees,
            'total_percentage' => $totalPercentage,
            'remaining_percentage' => 100 - $totalPercentage,
            'is_complete' => $isComplete,
            'count' => $nominees->count()
        ];
    }
}
