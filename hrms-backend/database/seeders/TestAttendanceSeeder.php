<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TestAttendanceSeeder extends Seeder
{
    /**
     * Seed test attendance data for Time Doctor employees
     */
    public function run(): void
    {
        // First, ensure we have employees with Time Doctor IDs
        $this->assignTimeDoctorIds();
        
        // Get employees with Time Doctor IDs
        $employees = DB::table('employee_data as e')
            ->join('employment_details as ed', 'e.id', '=', 'ed.employee_id')
            ->whereNotNull('ed.time_doctor_user_id')
            ->select('e.id', 'e.employee_code', 'e.first_name', 'e.last_name', 'ed.time_doctor_user_id')
            ->get();
        
        if ($employees->isEmpty()) {
            $this->command->warn('No employees with Time Doctor IDs found. Creating test employees...');
            $this->createTestEmployeesWithTimeDoctorIds();
            $employees = DB::table('employee_data as e')
                ->join('employment_details as ed', 'e.id', '=', 'ed.employee_id')
                ->whereNotNull('ed.time_doctor_user_id')
                ->select('e.id', 'e.employee_code', 'e.first_name', 'e.last_name', 'ed.time_doctor_user_id')
                ->get();
        }
        
        $this->command->info('Found ' . $employees->count() . ' employees with Time Doctor IDs');
        
        // Generate attendance for last 30 days
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();
        
        $currentDate = $startDate->copy();
        $attendanceRecords = [];
        
        while ($currentDate->lte($endDate)) {
            // Skip weekends
            if ($currentDate->isWeekday()) {
                foreach ($employees as $employee) {
                    // Generate random work hours between 7-10 hours
                    $workHours = rand(7, 10);
                    $workMinutes = rand(0, 59);
                    $totalMinutes = ($workHours * 60) + $workMinutes;
                    $totalHours = sprintf('%02d:%02d', floor($totalMinutes / 60), $totalMinutes % 60);
                    
                    // Random start time between 8:00 AM and 10:00 AM
                    $startHour = rand(8, 10);
                    $startMinute = rand(0, 59);
                    $startTime = sprintf('%02d:%02d:00', $startHour, $startMinute);
                    
                    // Calculate end time
                    $endHour = $startHour + $workHours;
                    $endMinute = $startMinute + $workMinutes;
                    if ($endMinute >= 60) {
                        $endHour++;
                        $endMinute -= 60;
                    }
                    $endTime = sprintf('%02d:%02d:00', $endHour, $endMinute);
                    
                    $attendanceRecords[] = [
                        'employee_id' => $employee->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'day' => $currentDate->format('l'),
                        'attendance_type' => 'TimeDoctor',
                        'total_hours' => $totalHours,
                        'location' => 'Remote',
                        'created_on' => now(),
                        'created_by' => 'seeder'
                    ];
                }
            }
            
            $currentDate->addDay();
        }
        
        // Delete existing test attendance data
        DB::table('attendance')
            ->whereIn('employee_id', $employees->pluck('id'))
            ->delete();
        
        // Insert new attendance records
        DB::table('attendance')->insert($attendanceRecords);
        
        // Create audit trail for each attendance
        $attendanceIds = DB::table('attendance')
            ->whereIn('employee_id', $employees->pluck('id'))
            ->pluck('id', 'id');
        
        $auditRecords = [];
        foreach ($attendanceIds as $attendanceId) {
            $attendance = DB::table('attendance')->where('id', $attendanceId)->first();
            
            $auditRecords[] = [
                'attendance_id' => $attendanceId,
                'action' => 'Time In',
                'time' => $attendance->start_time,
                'comment' => 'Auto-synced from TimeDoctor',
                'reason' => null
            ];
            
            if ($attendance->end_time) {
                $auditRecords[] = [
                    'attendance_id' => $attendanceId,
                    'action' => 'Time Out',
                    'time' => $attendance->end_time,
                    'comment' => 'Auto-synced from TimeDoctor',
                    'reason' => null
                ];
            }
        }
        
        DB::table('attendance_audit')->insert($auditRecords);
        
        $this->command->info('Successfully seeded ' . count($attendanceRecords) . ' attendance records');
        $this->command->info('Employees with attendance:');
        foreach ($employees as $employee) {
            $this->command->info("  - {$employee->employee_code} - {$employee->first_name} {$employee->last_name} (TD ID: {$employee->time_doctor_user_id})");
        }
    }
    
    private function assignTimeDoctorIds(): void
    {
        $timeDoctorIds = ['Y_XWuysdgbPLYpVy', 'YkNlThPHfSJQ8w4M'];
        
        // Get first 2 employees without Time Doctor IDs
        $employees = DB::table('employee_data as e')
            ->join('employment_details as ed', 'e.id', '=', 'ed.employee_id')
            ->whereNull('ed.time_doctor_user_id')
            ->where('e.is_deleted', 0)
            ->select('e.id', 'e.employee_code')
            ->limit(2)
            ->get();
        
        foreach ($employees as $index => $employee) {
            if (isset($timeDoctorIds[$index])) {
                DB::table('employment_details')
                    ->where('employee_id', $employee->id)
                    ->update([
                        'time_doctor_user_id' => $timeDoctorIds[$index],
                        'is_manual_attendance' => false // Automatic attendance from TimeDoctor
                    ]);
                
                $this->command->info("Assigned Time Doctor ID {$timeDoctorIds[$index]} to employee {$employee->employee_code}");
            }
        }
    }
    
    private function createTestEmployeesWithTimeDoctorIds(): void
    {
        // This method can be expanded if needed to create test employees
        $this->command->warn('No existing employees to assign Time Doctor IDs. Please create employees first.');
    }
}
