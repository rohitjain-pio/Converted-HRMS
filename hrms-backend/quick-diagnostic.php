<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

try {
    echo "=== Quick Diagnostic for Employee Report ===\n\n";
    
    // 1. Check attendance
    $attendanceCount = DB::table('attendance')->count();
    echo "1. Attendance records: $attendanceCount\n";
    
    if ($attendanceCount > 0) {
        $recent = DB::table('attendance')->orderBy('date', 'desc')->first();
        echo "   Latest: Employee {$recent->employee_id}, Date: {$recent->date}, Hours: {$recent->total_hours}\n";
    }
    
    // 2. Check employees
    $activeEmployees = DB::table('employee_data')
        ->where('is_deleted', 0)
        ->count();
    echo "\n2. Active employees: $activeEmployees\n";
    
    // 3. Check employment details
    $activeEmployment = DB::table('employment_details')
        ->where('employee_status', '!=', 4)
        ->count();
    echo "\n3. Active employment records (status != 4): $activeEmployment\n";
    
    // 4. Check join
    $joinCount = DB::table('employee_data as ed')
        ->join('employment_details as emp', 'ed.id', '=', 'emp.employee_id')
        ->where('ed.is_deleted', 0)
        ->where('emp.employee_status', '!=', 4)
        ->count();
    echo "\n4. Employees with both records: $joinCount\n";
    
    if ($joinCount === 0) {
        echo "\n   ⚠️ PROBLEM FOUND: No employees match the filter!\n";
        echo "   Checking employee_status values...\n\n";
        
        $statusCounts = DB::table('employment_details')
            ->select('employee_status', DB::raw('COUNT(*) as count'))
            ->groupBy('employee_status')
            ->get();
        
        echo "   Employee status distribution:\n";
        foreach ($statusCounts as $status) {
            $stat = $status->employee_status ?? 'NULL';
            echo "     Status {$stat}: {$status->count} employees\n";
        }
        
        echo "\n   The query filters for employee_status != 4\n";
        echo "   If all your employees have status 4 (or NULL), they won't appear!\n";
    }
    
    // 5. Check last 60 days
    $dateFrom = Carbon::now()->subDays(60)->format('Y-m-d');
    $dateTo = Carbon::now()->format('Y-m-d');
    echo "\n5. Attendance in last 60 days ({$dateFrom} to {$dateTo}): ";
    
    $att60 = DB::table('attendance')
        ->whereBetween('date', [$dateFrom, $dateTo])
        ->count();
    echo "$att60\n";
    
    // 6. Check last 7 days (default)
    $dateFrom7 = Carbon::now()->subDays(7)->format('Y-m-d');
    echo "\n6. Attendance in last 7 days ({$dateFrom7} to {$dateTo}): ";
    
    $att7 = DB::table('attendance')
        ->whereBetween('date', [$dateFrom7, $dateTo])
        ->count();
    echo "$att7\n";
    
    if ($att7 === 0 && $att60 > 0) {
        echo "   ⚠️ No recent data! Users need to adjust date range.\n";
    }
    
    echo "\n=== SUMMARY ===\n";
    
    if ($joinCount === 0) {
        echo "❌ CRITICAL: No active employees found (employee_status filter issue)\n";
        echo "\nSOLUTION: Update employee_status in employment_details table\n";
        echo "   Current filter: WHERE employee_status != 4\n";
        echo "   Change employee_status to a value other than 4 for active employees\n";
        echo "   Common values: 1 = Active, 2 = Probation, 3 = Notice Period, 4 = Exited\n";
    } elseif ($att7 === 0) {
        echo "⚠️ No attendance data in default date range (last 7 days)\n";
        echo "\nSOLUTION: Either:\n";
        echo "   1. Add attendance data for recent dates\n";
        echo "   2. Users adjust date range filter to see existing data\n";
    } else {
        echo "✅ Everything looks good!\n";
        echo "\nIf page is still empty, check:\n";
        echo "   1. Browser console for errors\n";
        echo "   2. Laravel logs: storage/logs/laravel.log\n";
        echo "   3. Network tab for API response\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
