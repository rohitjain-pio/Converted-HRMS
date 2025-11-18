<?php

namespace App\Services;

use App\Models\EmployeeData;
use App\Models\Attendance;
use App\Models\AttendanceAudit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Helpers\TimezoneHelper;

class TimeDoctorSyncService
{
    private $apiToken;
    private $summaryStatsUrl;
    private $companyId;

    public function __construct()
    {
        $this->apiToken = config('services.timedoctor.api_token');
        $this->summaryStatsUrl = config('services.timedoctor.summary_stats_url');
        $this->companyId = config('services.timedoctor.company_id');
    }

    /**
     * Sync timesheet data from Time Doctor for a specific date
     * Legacy: FetchTimeDoctorTimeSheetJob.Execute
     */
    public function syncTimesheetForDate(Carbon $date): array
    {
        $traceId = uniqid('td_sync_');
        $startTime = now();
        
        Log::info("Time Doctor sync started", [
            'trace_id' => $traceId,
            'date' => $date->toDateString()
        ]);

        try {
            // Get employees with Time Doctor user IDs who joined before or on the sync date
            $employees = $this->getEmployeesForSync($date);
            
            if ($employees->isEmpty()) {
                Log::info("No employees found for Time Doctor sync", ['trace_id' => $traceId]);
                return [
                    'total_users' => 0,
                    'synced_count' => 0,
                    'errors' => 0
                ];
            }

            Log::info("Fetching timesheet for {$employees->count()} employees", ['trace_id' => $traceId]);

            // Fetch timesheet data from Time Doctor
            $timesheetData = $this->fetchTimesheetStats($date);
            
            if (!$timesheetData) {
                throw new \Exception("Failed to fetch timesheet data from Time Doctor");
            }

            // Process each employee
            $syncedCount = 0;
            $errors = 0;

            foreach ($employees as $employee) {
                try {
                    $employment = $employee->employmentDetail;
                    if (!$employment || !$employment->time_doctor_user_id) {
                        continue;
                    }

                    // Find stats for this user
                    $userStats = $this->findUserStats($timesheetData, $employment->time_doctor_user_id);
                    
                    if (!$userStats) {
                        Log::debug("No timesheet data found for user", [
                            'trace_id' => $traceId,
                            'employee_id' => $employee->id,
                            'time_doctor_user_id' => $employment->time_doctor_user_id
                        ]);
                        continue;
                    }

                    // Create/update attendance record
                    $this->syncAttendanceRecord($employee, $userStats, $date);
                    $syncedCount++;

                } catch (\Exception $e) {
                    $errors++;
                    Log::error("Error syncing attendance for employee", [
                        'trace_id' => $traceId,
                        'employee_id' => $employee->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $duration = now()->diffInSeconds($startTime);
            Log::info("Time Doctor sync completed", [
                'trace_id' => $traceId,
                'total_users' => $employees->count(),
                'synced_count' => $syncedCount,
                'errors' => $errors,
                'duration_seconds' => $duration
            ]);

            return [
                'total_users' => $employees->count(),
                'synced_count' => $syncedCount,
                'errors' => $errors
            ];

        } catch (\Exception $e) {
            Log::error("Time Doctor sync failed", [
                'trace_id' => $traceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get employees who should be synced from Time Doctor
     */
    private function getEmployeesForSync(Carbon $date): \Illuminate\Database\Eloquent\Collection
    {
        return EmployeeData::with('employmentDetail')
            ->whereHas('employmentDetail', function ($query) use ($date) {
                $query->whereNotNull('time_doctor_user_id')
                      ->where('time_doctor_user_id', '!=', '')
                      ->where('is_manual_attendance', false)
                      ->whereDate('joining_date', '<=', $date);
            })
            ->where('is_deleted', 0)
            ->get();
    }

    /**
     * Fetch timesheet summary stats from Time Doctor API
     */
    private function fetchTimesheetStats(Carbon $date): ?array
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        $url = $this->summaryStatsUrl;
        
        $params = [
            'company' => $this->companyId,
            'from' => $startOfDay->format('Y-m-d\TH:i:s'),
            'to' => $endOfDay->format('Y-m-d\TH:i:s'),
            'user' => 'all',
            'fields' => 'start,end,userId,total',
            'group-by' => 'userId',
            'period' => 'days',
            'sort' => 'date',
            'limit' => '2000'
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'JWT ' . $this->apiToken, // Legacy uses JWT prefix, not Bearer
            ])
            ->withoutVerifying() // Skip SSL verification for local WAMP development
            ->get($url, $params);

            if (!$response->successful()) {
                Log::error("Time Doctor API request failed", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            return $data['data'] ?? null;

        } catch (\Exception $e) {
            Log::error("Time Doctor API exception", [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Find stats for a specific user from the timesheet data
     */
    private function findUserStats(array $timesheetData, string $timeDoctorUserId): ?array
    {
        foreach ($timesheetData as $dayStats) {
            foreach ($dayStats as $userStat) {
                if (isset($userStat['userId']) && $userStat['userId'] === $timeDoctorUserId) {
                    return $userStat;
                }
            }
        }
        return null;
    }

    /**
     * Create or update attendance record from Time Doctor stats
     * Legacy: AttendanceService.AddAttendanceTimeDoctorStatAsync
     * 
     * Note: Time Doctor API returns times in UTC format (e.g., "2025-11-18T05:59:30.000Z")
     * Legacy .NET code: stat.Start.TimeOfDay and stat.End.TimeOfDay extract UTC time
     * We must store times in UTC in database, conversion to IST happens at display time via TimezoneHelper
     */
    private function syncAttendanceRecord(EmployeeData $employee, array $stats, Carbon $date): void
    {
        // Parse Time Doctor times - API returns ISO 8601 format with Z (UTC) suffix
        // Example: "2025-11-18T05:59:30.000Z"
        $startTime = isset($stats['start']) ? Carbon::parse($stats['start']) : null;
        $endTime = isset($stats['end']) ? Carbon::parse($stats['end']) : null;
        $totalSeconds = $stats['total'] ?? 0;
        
        if (!$startTime || !$endTime) {
            throw new \Exception("Invalid start/end time in stats");
        }

        // Calculate total hours from seconds (matching legacy format HH:MM)
        $hours = floor($totalSeconds / 3600);
        $minutes = floor(($totalSeconds % 3600) / 60);
        $totalHours = sprintf("%02d:%02d", $hours, $minutes);

        // Check if attendance already exists for this date
        $existingAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $date)
            ->first();

        // CRITICAL: Extract time in UTC timezone explicitly
        // Carbon::parse() respects the Z suffix and creates UTC datetime
        // But we must ensure format() outputs in UTC, not local timezone
        // Legacy equivalent: stat.Start.TimeOfDay.ToString(@"hh\:mm")
        $startTimeUtc = $startTime->copy()->setTimezone('UTC')->format('H:i:s');
        $endTimeUtc = $endTime->copy()->setTimezone('UTC')->format('H:i:s');

        DB::transaction(function () use ($employee, $date, $startTimeUtc, $endTimeUtc, $totalHours, $existingAttendance) {
            $attendanceData = [
                'employee_id' => $employee->id,
                'date' => $date->toDateString(),
                'day' => $date->format('l'),
                'start_time' => $startTimeUtc,
                'end_time' => $endTimeUtc,
                'total_hours' => $totalHours,
                'location' => 'Remote',
                'attendance_type' => 'TimeDoctor',
                'created_by' => 'system',
                'modified_by' => 'system'
            ];

            if ($existingAttendance) {
                // Update existing record only if it's a TimeDoctor record
                if ($existingAttendance->attendance_type === 'TimeDoctor') {
                    $attendanceData['modified_on'] = now();
                    $existingAttendance->update($attendanceData);
                    
                    // Delete old audit entries and recreate
                    AttendanceAudit::where('attendance_id', $existingAttendance->id)->delete();
                    
                    // Create new audit entries (stored in UTC)
                    AttendanceAudit::create([
                        'attendance_id' => $existingAttendance->id,
                        'action' => 'Time In',
                        'time' => $startTimeUtc,
                        'comment' => null,
                        'reason' => null
                    ]);
                    
                    AttendanceAudit::create([
                        'attendance_id' => $existingAttendance->id,
                        'action' => 'Time Out',
                        'time' => $endTimeUtc,
                        'comment' => null,
                        'reason' => null
                    ]);
                    
                    Log::info("Updated Time Doctor attendance", [
                        'employee_id' => $employee->id,
                        'date' => $date->toDateString()
                    ]);
                }
            } else {
                // Create new attendance record
                $attendanceData['created_on'] = now();
                $attendanceData['modified_on'] = now();
                $newAttendance = Attendance::create($attendanceData);
                
                // Create audit trail entries (stored in UTC)
                AttendanceAudit::create([
                    'attendance_id' => $newAttendance->id,
                    'action' => 'Time In',
                    'time' => $startTimeUtc,
                    'comment' => null,
                    'reason' => null
                ]);
                
                AttendanceAudit::create([
                    'attendance_id' => $newAttendance->id,
                    'action' => 'Time Out',
                    'time' => $endTimeUtc,
                    'comment' => null,
                    'reason' => null
                ]);
                
                Log::info("Created Time Doctor attendance", [
                    'employee_id' => $employee->id,
                    'date' => $date->toDateString()
                ]);
            }
        });
    }
}
