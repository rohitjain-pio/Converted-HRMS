<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

try {
    echo "=== Diagnosing Employee Report Issue ===\n\n";
    
    // 1. Check attendance table
    echo "1. Checking attendance table:\n";
    $attendanceCount = DB::table('attendance')->count();
    echo "   Total attendance records: $attendanceCount\n";
    
    if ($attendanceCount > 0) {
        $sampleAttendance = DB::table('attendance')
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();
        
        echo "\n   Recent attendance records:\n";
        foreach ($sampleAttendance as $att) {
            echo "   - Employee ID: {$att->employee_id}, Date: {$att->date}, Total Hours: {$att->total_hours}, Type: " . (gettype($att->total_hours)) . "\n";
        }
    }
    
    // 2. Check employee_data table
    echo "\n2. Checking employee_data table:\n";
    $employeeCount = DB::table('employee_data')
        ->where('is_deleted', 0)
        ->count();
    echo "   Total active employees: $employeeCount\n";
    
    if ($employeeCount > 0) {
        $sampleEmployees = DB::table('employee_data')
            ->where('is_deleted', 0)
            ->limit(5)
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'office_email']);
        
        echo "\n   Sample employees:\n";
        foreach ($sampleEmployees as $emp) {
            echo "   - ID: {$emp->id}, Code: {$emp->employee_code}, Name: {$emp->first_name} {$emp->last_name}\n";
        }
    }
    
    // 3. Check employment_details table
    echo "\n3. Checking employment_details table:\n";
    $employmentCount = DB::table('employment_details')
        ->whereNotNull('employee_id')
        ->count();
    echo "   Total employment records: $employmentCount\n";
    
    $activeEmploymentCount = DB::table('employment_details')
        ->where('employee_status', '!=', 4)
        ->count();
    echo "   Active employment records (status != 4): $activeEmploymentCount\n";
    
    if ($employmentCount > 0) {
        $sampleEmployment = DB::table('employment_details')
            ->limit(5)
            ->get(['employee_id', 'department_id', 'branch_id', 'employee_status', 'is_manual_attendance']);
        
        echo "\n   Sample employment details:\n";
        foreach ($sampleEmployment as $emp) {
            $status = $emp->employee_status ?? 'NULL';
            $manual = isset($emp->is_manual_attendance) ? ($emp->is_manual_attendance ? 'Yes' : 'No') : 'NULL';
            echo "   - Employee ID: {$emp->employee_id}, Dept: {$emp->department_id}, Branch: {$emp->branch_id}, Status: {$status}, Manual: {$manual}\n";
        }
    }
    
    // 4. Check if employees have both employee_data and employment_details
    echo "\n4. Checking employee join integrity:\n";
    $joinedCount = DB::table('employee_data as ed')
        ->join('employment_details as emp', 'ed.id', '=', 'emp.employee_id')
        ->where('ed.is_deleted', 0)
        ->where('emp.employee_status', '!=', 4)
        ->count();
    echo "   Employees with both records (active): $joinedCount\n";
    
    // Also check without status filter
    $joinedCountAll = DB::table('employee_data as ed')
        ->join('employment_details as emp', 'ed.id', '=', 'emp.employee_id')
        ->where('ed.is_deleted', 0)
        ->count();
    echo "   Employees with both records (all): $joinedCountAll\n";
    
    // 5. Check date range for attendance data
    echo "\n5. Checking attendance date range:\n";
    $dateRange = DB::table('attendance')
        ->selectRaw('MIN(date) as min_date, MAX(date) as max_date, COUNT(*) as total')
        ->first();
    
    if ($dateRange && $dateRange->min_date) {
        echo "   Earliest attendance: {$dateRange->min_date}\n";
        echo "   Latest attendance: {$dateRange->max_date}\n";
        echo "   Total records: {$dateRange->total}\n";
    } else {
        echo "   No attendance records found\n";
    }
    
    // 6. Check last 7 days (default date range)
    echo "\n6. Checking last 7 days (default frontend range):\n";
    $dateFrom = Carbon::now()->subDays(7)->format('Y-m-d');
    $dateTo = Carbon::now()->format('Y-m-d');
    $today = Carbon::now()->format('Y-m-d');
    echo "   Today: {$today}\n";
    echo "   Date range: {$dateFrom} to {$dateTo}\n";
    
    $att7Count = DB::table('attendance')
        ->whereBetween('date', [$dateFrom, $dateTo])
        ->count();
    echo "   Attendance records in last 7 days: $att7Count\n";
    
    // 7. Check last 60 days
    echo "\n7. Checking last 60 days:\n";
    $dateFrom60 = Carbon::now()->subDays(60)->format('Y-m-d');
    $dateTo60 = Carbon::now()->format('Y-m-d');
    echo "   Date range: {$dateFrom60} to {$dateTo60}\n";
    
    $att60Count = DB::table('attendance')
        ->whereBetween('date', [$dateFrom60, $dateTo60])
        ->count();
    echo "   Attendance records in last 60 days: $att60Count\n";
    
    if ($att60Count > 0) {
        $empWith60 = DB::table('attendance')
            ->whereBetween('date', [$dateFrom60, $dateTo60])
            ->distinct()
            ->pluck('employee_id');
        
        echo "   Unique employees with attendance: " . $empWith60->count() . "\n";
        echo "   Employee IDs: " . $empWith60->join(', ') . "\n";
    }
    
    // 8. Test the actual query logic
    echo "\n8. Testing employee report query logic:\n";
    
    $testEmployees = DB::table('employee_data as ed')
        ->join('employment_details as emp', 'ed.id', '=', 'emp.employee_id')
        ->where('ed.is_deleted', 0)
        ->where('emp.employee_status', '!=', 4)
        ->select('ed.id', 'ed.employee_code', 'ed.first_name', 'ed.last_name', 'emp.department_id', 'emp.branch_id')
        ->limit(3)
        ->get();
    
    echo "   Found " . count($testEmployees) . " employees\n";
    
    foreach ($testEmployees as $emp) {
        echo "\n   Employee: {$emp->first_name} {$emp->last_name} (ID: {$emp->id})\n";
        echo "   Code: {$emp->employee_code}\n";
        echo "   Department: {$emp->department_id}, Branch: {$emp->branch_id}\n";
        
        // Check attendance for this employee
        $empAtt = DB::table('attendance')
            ->where('employee_id', $emp->id)
            ->whereBetween('date', [$dateFrom60, $dateTo60])
            ->orderBy('date', 'desc')
            ->get(['date', 'total_hours']);
        
        if ($empAtt->count() > 0) {
            echo "   Attendance records: " . $empAtt->count() . "\n";
            echo "   Recent dates:\n";
            foreach ($empAtt->take(3) as $att) {
                echo "     - {$att->date}: {$att->total_hours}\n";
            }
        } else {
            echo "   No attendance records found\n";
        }
    }
    
    echo "\n=== Summary ===\n";
    echo "Total attendance records: $attendanceCount\n";
    echo "Active employees: $employeeCount\n";
    echo "Employees with employment details (active): $joinedCount\n";
    echo "Attendance in last 7 days: $att7Count\n";
    echo "Attendance in last 60 days: $att60Count\n";
    
    if ($joinedCount === 0) {
        echo "\n❌ PROBLEM: No active employees found!\n";
        echo "   - Check employee_status field in employment_details table\n";
        echo "   - Ensure employee_status != 4 (or set to appropriate active status)\n";
    } elseif ($att7Count === 0 && $att60Count > 0) {
        echo "\n⚠️ ISSUE: No attendance in last 7 days, but data exists in last 60 days\n";
        echo "   - Frontend is using last 7 days as default\n";
        echo "   - Users need to adjust date range in filters\n";
        echo "   - Or populate more recent attendance data\n";
    } elseif ($att60Count === 0) {
        echo "\n❌ PROBLEM: No attendance data in last 60 days!\n";
        echo "   - Need to populate attendance data\n";
    } else {
        echo "\n✅ Data looks good!\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
