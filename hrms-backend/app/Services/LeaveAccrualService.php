<?php

namespace App\Services;

use App\Models\EmployeeData;
use Carbon\Carbon;

/**
 * LeaveAccrualService - Calculate opening leave balance for new employees
 * 
 * Business Logic from Legacy System:
 * - CL (Casual Leave): 0.5 per month accrual, max 12 per year
 * - EL (Earned Leave): 1.5 per month accrual, max 18 per year
 * - PL (Paternity Leave): 5 days for male employees
 * - ML (Maternity Leave): 180 days for female employees
 * 
 * Pro-rated calculation based on joining date within the year
 */
class LeaveAccrualService
{
    /**
     * Calculate and insert opening leave balance for new employee
     * Called during employee onboarding (Feature #7 from Module-2)
     *
     * @param int $employeeId
     * @param string $joiningDate
     * @param int $gender 1=Male, 2=Female, 3=Other
     * @return array Leave balances created
     */
    public function calculateOpeningBalance(int $employeeId, string $joiningDate, int $gender): array
    {
        $joiningDate = Carbon::parse($joiningDate);
        $now = Carbon::now();
        
        // Calculate months from joining date to current date (including current month)
        $monthsSinceJoining = $joiningDate->diffInMonths($now) + 1;
        
        // CL: 0.5 per month, max 12 per year
        $clBalance = min($monthsSinceJoining * 0.5, 12);
        
        // EL: 1.5 per month, max 18 per year
        $elBalance = min($monthsSinceJoining * 1.5, 18);
        
        // Base leave balances for all employees
        $leaveBalances = [
            [
                'leave_id' => 1,
                'leave_type' => 'CL',
                'opening_balance' => round($clBalance, 2)
            ],
            [
                'leave_id' => 2,
                'leave_type' => 'EL',
                'opening_balance' => round($elBalance, 2)
            ],
        ];
        
        // Gender-specific leaves
        if ($gender == 1) { // Male
            $leaveBalances[] = [
                'leave_id' => 4,
                'leave_type' => 'PL', // Paternity Leave
                'opening_balance' => 5
            ];
        } elseif ($gender == 2) { // Female
            $leaveBalances[] = [
                'leave_id' => 5,
                'leave_type' => 'ML', // Maternity Leave
                'opening_balance' => 180
            ];
        }
        
        // Insert into EmployeeLeave table
        // Note: EmployeeLeave model would be created in Module-8 (Leave Management)
        // For now, we return the calculated balances
        foreach ($leaveBalances as $leave) {
            \DB::table('employee_leave')->insert([
                'employee_id' => $employeeId,
                'leave_id' => $leave['leave_id'],
                'opening_balance' => $leave['opening_balance'],
                'leave_date' => $joiningDate,
                'created_by' => 'system',
                'created_on' => now(),
                'is_deleted' => 0
            ]);
        }
        
        return $leaveBalances;
    }

    /**
     * Recalculate leave balance if joining date is updated
     */
    public function recalculateBalance(int $employeeId, string $newJoiningDate, int $gender): array
    {
        // Delete existing leave balances
        \DB::table('employee_leave')
            ->where('employee_id', $employeeId)
            ->where('created_by', 'system')
            ->delete();
        
        // Calculate and insert new balances
        return $this->calculateOpeningBalance($employeeId, $newJoiningDate, $gender);
    }
}
