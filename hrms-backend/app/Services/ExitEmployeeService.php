<?php

namespace App\Services;

use App\Models\Resignation;
use App\Models\ResignationHistory;
use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExitEmployeeService
{
    /**
     * Calculate Last Working Day based on employee job type and notice period
     * 
     * @param int $employeeId
     * @param string $resignationDate
     * @return string
     */
    public function calculateLastWorkingDay(int $employeeId, string $resignationDate): string
    {
        // Get employee's job type from employment_details table
        $employment = EmploymentDetail::where('employee_id', $employeeId)
            ->where('is_deleted', false)
            ->first();

        if (!$employment) {
            throw new \Exception('Active employment record not found');
        }

        $noticePeriodDays = $this->getNoticePeriodDays($employment->job_type ?? 1); // Default to 1 if null
        
        // Calculate last working day
        $resignDate = Carbon::parse($resignationDate);
        $lastWorkingDay = $resignDate->addDays($noticePeriodDays);

        return $lastWorkingDay->format('Y-m-d');
    }

    /**
     * Get notice period days based on job type
     * 
     * @param int $jobTypeId
     * @return int
     */
    private function getNoticePeriodDays(int $jobTypeId): int
    {
        $noticePeriods = config('exit-management.notice_periods');
        
        // Map job type IDs to notice periods
        // JobTypeId: 1 = Probation, 2 = Training, 3 = Confirmed
        // Exact mapping from legacy system
        return match($jobTypeId) {
            1 => $noticePeriods['probation'],   // 15 days
            2 => $noticePeriods['training'],    // 15 days
            3 => $noticePeriods['confirmed'],   // 60 days
            default => $noticePeriods['confirmed'], // Default to confirmed
        };
    }

    /**
     * Check if all clearances are completed for a resignation
     * 
     * @param int $resignationId
     * @return bool
     */
    public function areAllClearancesCompleted(int $resignationId): bool
    {
        $resignation = Resignation::with([
            'hrClearance',
            'departmentClearance',
            'itClearance',
            'accountClearance'
        ])->find($resignationId);

        if (!$resignation) {
            return false;
        }

        // All four clearances must exist to be considered complete
        return $resignation->hrClearance !== null &&
               $resignation->departmentClearance !== null &&
               $resignation->itClearance !== null &&
               $resignation->accountClearance !== null;
    }

    /**
     * Auto-complete resignation when all clearances are done
     * 
     * @param int $resignationId
     * @return void
     */
    public function autoCompleteResignationIfReady(int $resignationId): void
    {
        if ($this->areAllClearancesCompleted($resignationId)) {
            $resignation = Resignation::find($resignationId);
            
            if ($resignation && $resignation->Status != config('exit-management.resignation_status.completed')) {
                $resignation->Status = config('exit-management.resignation_status.completed');
                $resignation->SettlementStatus = 'Completed';
                $resignation->SettlementDate = now();
                $resignation->ModifiedBy = Auth::user()->email ?? 'system';
                $resignation->ModifiedOn = now();
                $resignation->save();

                // Add history entry
                ResignationHistory::create([
                    'ResignationId' => $resignationId,
                    'ResignationStatus' => config('exit-management.resignation_status.completed'),
                    'EarlyReleaseStatus' => $resignation->EarlyReleaseStatus,
                    'CreatedOn' => now(),
                    'CreatedBy' => Auth::user()->email ?? 'system',
                ]);
            }
        }
    }

    /**
     * Validate resignation status transition
     * 
     * @param int $currentStatus
     * @param int $newStatus
     * @return bool
     */
    public function isValidStatusTransition(int $currentStatus, int $newStatus): bool
    {
        $validTransitions = [
            config('exit-management.resignation_status.pending') => [
                config('exit-management.resignation_status.accepted'),
                config('exit-management.resignation_status.rejected'),
                config('exit-management.resignation_status.revoked'),
            ],
            config('exit-management.resignation_status.accepted') => [
                config('exit-management.resignation_status.completed'),
                config('exit-management.resignation_status.revoked'),
            ],
        ];

        return isset($validTransitions[$currentStatus]) && 
               in_array($newStatus, $validTransitions[$currentStatus]);
    }

    /**
     * Validate early release request
     * 
     * @param int $resignationId
     * @param string $earlyReleaseDate
     * @return array
     */
    public function validateEarlyReleaseRequest(int $resignationId, string $earlyReleaseDate): array
    {
        $resignation = Resignation::find($resignationId);
        
        if (!$resignation) {
            return ['valid' => false, 'message' => 'Resignation not found'];
        }

        if ($resignation->Status != config('exit-management.resignation_status.accepted')) {
            return ['valid' => false, 'message' => 'Resignation must be accepted before requesting early release'];
        }

        $earlyDate = Carbon::parse($earlyReleaseDate);
        $lastWorkingDay = Carbon::parse($resignation->LastWorkingDay);

        if ($earlyDate->gte($lastWorkingDay)) {
            return ['valid' => false, 'message' => 'Early release date must be before last working day'];
        }

        if ($earlyDate->lt(now())) {
            return ['valid' => false, 'message' => 'Early release date cannot be in the past'];
        }

        return ['valid' => true];
    }

    /**
     * Get resignation status label
     * 
     * @param int $statusId
     * @return string
     */
    public function getResignationStatusLabel(int $statusId): string
    {
        $labels = config('exit-management.resignation_status_labels');
        return $labels[$statusId] ?? 'Unknown';
    }

    /**
     * Get early release status label
     * 
     * @param int|null $statusId
     * @return string
     */
    public function getEarlyReleaseStatusLabel(?int $statusId): string
    {
        if ($statusId === null) {
            return 'N/A';
        }
        
        $labels = config('exit-management.early_release_status_labels');
        return $labels[$statusId] ?? 'Unknown';
    }

    /**
     * Get KT status label
     * 
     * @param int|null $statusId
     * @return string
     */
    public function getKTStatusLabel(?int $statusId): string
    {
        if ($statusId === null) {
            return 'N/A';
        }
        
        $labels = config('exit-management.kt_status_labels');
        return $labels[$statusId] ?? 'Unknown';
    }
}
