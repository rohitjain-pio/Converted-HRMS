<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceAudit;
use App\Models\EmployeeData;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Helpers\TimezoneHelper;

class AttendanceService
{
    /**
     * Add attendance with validation and audit trail
     */
    public function addAttendance($employeeId, array $data)
    {
        // Check if manual attendance allowed
        $employee = EmployeeData::with('employmentDetail')->findOrFail($employeeId);
        
        if (!$employee->employmentDetail->is_manual_attendance) {
            throw new \Exception('Manual attendance not allowed. Attendance is auto-synced from Time Doctor.');
        }
        
        // Check if attendance already exists for date
        $existingAttendance = Attendance::forEmployee($employeeId)
            ->where('date', $data['date'])
            ->first();
            
        if ($existingAttendance) {
            return $this->updateAttendance($employeeId, $existingAttendance->id, $data);
        }
        
        return DB::transaction(function () use ($employeeId, $data) {
            // Convert IST times to UTC (matching legacy ConvertToUtcTime)
            $startTimeUtc = !empty($data['startTime']) ? TimezoneHelper::istToUtc($data['startTime'], $data['date']) : null;
            $endTimeUtc = !empty($data['endTime']) ? TimezoneHelper::istToUtc($data['endTime'], $data['date']) : null;
            
            // Convert audit times to UTC
            $auditsUtc = !empty($data['audit']) ? TimezoneHelper::convertAuditToUtc($data['audit'], $data['date']) : [];
            
            // Calculate total hours (use original IST times for calculation, as legacy does)
            $totalHours = $this->calculateTotalHours($data['startTime'], $data['endTime'] ?? null, $data['audit'] ?? []);
            
            // Create attendance record with UTC times
            $attendance = Attendance::create([
                'employee_id' => $employeeId,
                'date' => $data['date'],
                'start_time' => $startTimeUtc,
                'end_time' => $endTimeUtc,
                'day' => Carbon::parse($data['date'])->format('l'),
                'attendance_type' => $data['attendanceType'] ?? 'Manual',
                'total_hours' => $totalHours,
                'location' => $data['location'] ?? null,
                'created_on' => now(),
                'created_by' => auth()->user()->email ?? 'system'
            ]);
            
            // Create audit trail with UTC times
            if (!empty($auditsUtc)) {
                foreach ($auditsUtc as $audit) {
                    AttendanceAudit::create([
                        'attendance_id' => $attendance->id,
                        'action' => $audit['action'],
                        'time' => $audit['time'],
                        'comment' => $audit['comment'] ?? null,
                        'reason' => $audit['reason'] ?? null
                    ]);
                }
            }
            
            $attendance->load('audits');
            return $this->formatAttendanceRecord($attendance);
        });
    }
    
    /**
     * Update existing attendance record
     */
    public function updateAttendance($employeeId, $attendanceId, array $data)
    {
        $attendance = Attendance::forEmployee($employeeId)->findOrFail($attendanceId);
        
        // Check if manual attendance allowed
        $employee = EmployeeData::with('employmentDetail')->findOrFail($employeeId);
        
        if (!$employee->employmentDetail->is_manual_attendance) {
            throw new \Exception('Manual attendance not allowed. Attendance is auto-synced from Time Doctor.');
        }
        
        return DB::transaction(function () use ($attendance, $data) {
            // Convert existing UTC times to IST for processing (matching legacy behavior)
            $existingStartTimeIst = $attendance->start_time ? TimezoneHelper::utcToIst($attendance->start_time) : null;
            $existingEndTimeIst = $attendance->end_time ? TimezoneHelper::utcToIst($attendance->end_time) : null;
            
            // Match legacy behavior: preserve existing startTime and location if not provided
            $startTimeIst = $data['startTime'] ?? $existingStartTimeIst;
            $location = $data['location'] ?? $attendance->location;
            
            // For today's attendance with only endTime (Time Out), use existing startTime
            $today = Carbon::today()->format('Y-m-d');
            if ($data['date'] === $today && !isset($data['startTime']) && isset($data['endTime'])) {
                $startTimeIst = $existingStartTimeIst;
                $location = $attendance->location;
            }
            
            // Convert IST times to UTC for storage
            $startTimeUtc = $startTimeIst ? TimezoneHelper::istToUtc($startTimeIst, $data['date']) : null;
            $endTimeIst = $data['endTime'] ?? $existingEndTimeIst;
            $endTimeUtc = $endTimeIst ? TimezoneHelper::istToUtc($endTimeIst, $data['date']) : null;
            
            // Convert audit times to UTC
            $auditsUtc = !empty($data['audit']) ? TimezoneHelper::convertAuditToUtc($data['audit'], $data['date']) : [];
            
            // Calculate total hours using IST times (as legacy does)
            $totalHours = $this->calculateTotalHours($startTimeIst, $endTimeIst, $data['audit'] ?? []);
            
            // Update attendance record with UTC times
            $attendance->update([
                'date' => $data['date'],
                'start_time' => $startTimeUtc,
                'end_time' => $endTimeUtc,
                'day' => Carbon::parse($data['date'])->format('l'),
                'total_hours' => $totalHours,
                'location' => $location,
                'modified_on' => now(),
                'modified_by' => auth()->user()->email ?? 'system'
            ]);
            
            // Add new audit entries with UTC times (merge with existing)
            if (!empty($auditsUtc)) {
                foreach ($auditsUtc as $audit) {
                    AttendanceAudit::create([
                        'attendance_id' => $attendance->id,
                        'action' => $audit['action'],
                        'time' => $audit['time'],
                        'comment' => $audit['comment'] ?? null,
                        'reason' => $audit['reason'] ?? null
                    ]);
                }
            }
            
            $attendance->load('audits');
            return $this->formatAttendanceRecord($attendance);
        });
    }
    
    /**
     * Get attendance records with pagination and filters
     */
    public function getAttendanceByEmployee($employeeId, $dateFrom = null, $dateTo = null, $pageIndex = 0, $pageSize = 7)
    {
        $query = Attendance::forEmployee($employeeId)
            ->with('audits')
            ->orderBy('date', 'desc');
            
        // Apply date range filter
        if ($dateFrom && $dateTo) {
            $query->dateRange($dateFrom, $dateTo);
        } elseif (!$dateFrom && !$dateTo) {
            // Default to current week
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek = Carbon::now()->endOfWeek();
            $query->dateRange($startOfWeek->format('Y-m-d'), $endOfWeek->format('Y-m-d'));
        }
        
        // Pagination
        $offset = $pageIndex * $pageSize;
        $totalRecords = $query->count();
        $records = $query->offset($offset)->limit($pageSize)->get();
        
        // Convert to response format
        $attendanceReport = $records->map(function ($record) {
            return $this->formatAttendanceRecord($record);
        });
        
        // Get employee attendance configuration
        $employee = EmployeeData::with('employmentDetail')->findOrFail($employeeId);
        $isManualAttendance = $employee->employmentDetail->is_manual_attendance ?? true;
        
        // Check if employee has timed in today
        // Legacy logic: isTimedIn = true means ready to time in (last action was Time Out or no attendance)
        // isTimedIn = false means already timed in (last action was Time In)
        $today = Carbon::today();
        $todayAttendance = Attendance::forEmployee($employeeId)
            ->where('date', $today->format('Y-m-d'))
            ->with('audits')
            ->first();
            
        $isTimedIn = true; // Default: ready to time in
        if ($todayAttendance && $todayAttendance->audits->isNotEmpty()) {
            $lastAudit = $todayAttendance->audits->last();
            // If last action was Time Out, user can time in again (isTimedIn = true)
            // If last action was Time In, user already timed in (isTimedIn = false)
            $isTimedIn = ($lastAudit->action === 'Time Out');
        }
        
        // Get dates with attendance for calendar
        $datesWithAttendance = Attendance::forEmployee($employeeId)
            ->selectRaw('DISTINCT date')
            ->pluck('date')
            ->map(fn($date) => $date->format('Y-m-d'))
            ->toArray();
        
        // Match legacy response structure (including typo in 'attendaceReport')
        return [
            'attendaceReport' => $attendanceReport,
            'totalRecords' => $totalRecords,
            'isManualAttendance' => $isManualAttendance,
            'isTimedIn' => $isTimedIn,
            'dates' => $datesWithAttendance
        ];
    }
    
    /**
     * Toggle attendance configuration (Manual/Automatic)
     */
    public function toggleAttendanceConfig($employeeId)
    {
        $employee = EmployeeData::with('employmentDetail')->findOrFail($employeeId);
        
        $currentValue = $employee->employmentDetail->is_manual_attendance ?? false;
        $employee->employmentDetail->update([
            'is_manual_attendance' => !$currentValue
        ]);
        
        return [
            'employeeId' => $employeeId,
            'isManualAttendance' => !$currentValue
        ];
    }
    
    /**
     * Calculate total hours from start time, end time, and audit entries
     */
    private function calculateTotalHours($startTime, $endTime = null, array $audits = []): string
    {
        if (!$startTime) {
            return '00:00';
        }
        
        // If endTime is provided, calculate directly
        if ($endTime) {
            $start = Carbon::parse($startTime);
            $end = Carbon::parse($endTime);
            
            if ($end->lessThan($start)) {
                return '00:00';
            }
            
            $diffInMinutes = $start->diffInMinutes($end);
            $hours = floor($diffInMinutes / 60);
            $minutes = $diffInMinutes % 60;
            
            return sprintf('%02d:%02d', $hours, $minutes);
        }
        
        // Calculate from audit entries if available
        if (!empty($audits)) {
            $totalMinutes = 0;
            $lastTimeIn = null;
            
            foreach ($audits as $audit) {
                $action = $audit['action'] ?? '';
                $time = $audit['time'] ?? null;
                
                if (!$time) continue;
                
                if (in_array($action, ['Time In', 'Resume'])) {
                    $lastTimeIn = Carbon::parse($time);
                } elseif (in_array($action, ['Time Out', 'Break']) && $lastTimeIn) {
                    $timeOut = Carbon::parse($time);
                    $totalMinutes += $lastTimeIn->diffInMinutes($timeOut);
                    $lastTimeIn = null;
                }
            }
            
            if ($totalMinutes > 0) {
                $hours = floor($totalMinutes / 60);
                $minutes = $totalMinutes % 60;
                return sprintf('%02d:%02d', $hours, $minutes);
            }
        }
        
        return '00:00';
    }
    
    /**
     * Get attendance configuration list (Admin)
     */
    public function getAttendanceConfigList(array $params)
    {
        $startIndex = $params['startIndex'] ?? 0;
        $pageSize = $params['pageSize'] ?? 10;
        $sortColumnName = $params['sortColumnName'] ?? null;
        $sortDirection = $params['sortDirection'] ?? 'asc';
        $filters = $params['filters'] ?? [];
        
        $query = EmployeeData::with(['employmentDetail.department', 'employmentDetail.designationModel', 'currentAddress.country'])
            ->whereHas('employmentDetail')
            ->where('is_deleted', 0);
        
        // Apply filters from nested filters object
        if (!empty($filters['employeeCode'])) {
            $query->where('employee_code', 'LIKE', '%' . $filters['employeeCode'] . '%');
        }
        
        if (!empty($filters['employeeName'])) {
            $query->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', '%' . $filters['employeeName'] . '%');
        }
        
        if (!empty($filters['departmentId'])) {
            $query->whereHas('employmentDetail', function($q) use ($filters) {
                $q->where('department_id', $filters['departmentId']);
            });
        }
        
        if (!empty($filters['designationId'])) {
            $query->whereHas('employmentDetail', function($q) use ($filters) {
                $q->where('designation_id', $filters['designationId']);
            });
        }
        
        if (!empty($filters['branchId'])) {
            $query->whereHas('employmentDetail', function($q) use ($filters) {
                $q->where('branch_id', $filters['branchId']);
            });
        }
        
        if (!empty($filters['countryId'])) {
            $query->whereHas('currentAddress', function($q) use ($filters) {
                $q->where('country_id', $filters['countryId']);
            });
        }
        
        if (isset($filters['isManualAttendance'])) {
            $query->whereHas('employmentDetail', function($q) use ($filters) {
                $q->where('is_manual_attendance', $filters['isManualAttendance']);
            });
        }
        
        if (!empty($filters['dojFrom']) && !empty($filters['dojTo'])) {
            $query->whereHas('employmentDetail', function($q) use ($filters) {
                $q->whereBetween('joining_date', [$filters['dojFrom'], $filters['dojTo']]);
            });
        }
        
        // Apply sorting
        if ($sortColumnName) {
            $direction = strtolower($sortDirection) === 'desc' ? 'desc' : 'asc';
            
            switch ($sortColumnName) {
                case 'employeeCode':
                case 'EmployeeCode':
                    $query->orderBy('employee_code', $direction);
                    break;
                case 'employeeName':
                case 'EmployeeName':
                    $query->orderBy('first_name', $direction);
                    break;
                default:
                    $query->orderBy('employee_code', $direction);
                    break;
            }
        }
        
        $totalRecords = $query->count();
        $employees = $query->offset($startIndex)->limit($pageSize)->get();
        
        \Log::info('Employees loaded', ['count' => $employees->count()]);
        
        $configList = $employees->map(function ($employee) {
            $employment = $employee->employmentDetail;
            
            \Log::info('Processing employee', [
                'id' => $employee->id,
                'relations' => $employment ? array_keys($employment->getRelations()) : [],
                'dept_loaded' => $employment ? $employment->relationLoaded('department') : false,
                'desig_loaded' => $employment ? $employment->relationLoaded('designationModel') : false
            ]);
            
            // Map branch_id to branch name (matching legacy logic)
            $branchName = 'N/A';
            if ($employment && $employment->branch_id) {
                $branchMapping = [
                    1 => 'Mumbai',
                    2 => 'Bangalore',
                    3 => 'Delhi',
                    4 => 'Hyderabad',
                    5 => 'Pune'
                ];
                $branchName = $branchMapping[$employment->branch_id] ?? 'N/A';
            }
            
            // Get department name - check if relation is loaded AND is an object
            $departmentName = 'N/A';
            if ($employment) {
                // Use relationLoaded to check if the relation was actually loaded
                if ($employment->relationLoaded('department')) {
                    $deptObj = $employment->getRelation('department');
                    
                    if (is_object($deptObj)) {
                        // Try accessor first (department_name), then fallback to direct column
                        $departmentName = $deptObj->department_name ?? $deptObj->department ?? 'N/A';
                    }
                }
                
                // Fallback to direct query if still N/A
                if ($departmentName === 'N/A' && $employment->department_id) {
                    $dept = \App\Models\Department::find($employment->department_id);
                    $departmentName = $dept ? ($dept->department_name ?? $dept->department ?? 'N/A') : 'N/A';
                }
            }
            
            // Get designation name - check if relation is loaded AND is an object
            $designationName = 'N/A';
            if ($employment) {
                // Use relationLoaded to check if the relation was actually loaded
                if ($employment->relationLoaded('designationModel')) {
                    $desigObj = $employment->getRelation('designationModel');
                    
                    if (is_object($desigObj)) {
                        // Try accessor first (designation_name), then fallback to direct column
                        $designationName = $desigObj->designation_name ?? $desigObj->designation ?? 'N/A';
                    }
                }
                
                // Fallback to direct query if still N/A
                if ($designationName === 'N/A' && $employment->designation_id) {
                    $desig = \App\Models\Designation::find($employment->designation_id);
                    $designationName = $desig ? ($desig->designation_name ?? $desig->designation ?? 'N/A') : 'N/A';
                }
            }
            
            // Get country name
            $countryName = 'N/A';
            if ($employee->currentAddress && $employee->currentAddress->country) {
                $countryName = $employee->currentAddress->country->country_name ?? 'N/A';
            }
            
            return [
                'employeeId' => $employee->id,
                'employeeCode' => $employee->employee_code,
                'employeeName' => $employee->first_name . ' ' . $employee->last_name,
                'department' => $departmentName,
                'designation' => $designationName,
                'branch' => $branchName,
                'joiningDate' => $employment->joining_date ?? null,
                'country' => $countryName,
                'isManualAttendance' => $employment->is_manual_attendance ?? false,
                'timeDoctorUserId' => $employment->time_doctor_user_id ?? null
            ];
        });
        
        return [
            'attendanceConfigList' => $configList,
            'totalRecords' => $totalRecords
        ];
    }
    
    /**
     * Get employee attendance report (Manager/HR)
     * Legacy: GetEmployeeAttendanceReport stored procedure
     */
    public function getEmployeeReport(array $params)
    {
        $pageIndex = $params['pageIndex'] ?? 0;
        $pageSize = $params['pageSize'] ?? 10;
        
        // Default to last 7 days if not provided (matching legacy default)
        $dateFrom = $params['dateFrom'] ?? Carbon::now()->subDays(7)->format('Y-m-d');
        $dateTo = $params['dateTo'] ?? Carbon::now()->format('Y-m-d');
        
        // Validate date range (legacy validation)
        $startDate = Carbon::parse($dateFrom);
        $endDate = Carbon::parse($dateTo);
        
        if ($startDate->gt($endDate)) {
            throw new \Exception('Start date cannot be after end date.');
        }
        
        if ($startDate->diffInDays($endDate) > 60) {
            throw new \Exception('Cannot enter more than 60 days');
        }
        
        // Build query - matching legacy vw_EmployeeData
        $query = EmployeeData::with(['employmentDetail.department', 'employmentDetail.designationModel'])
            ->where('is_deleted', 0);
        
        // Apply filters (matching legacy stored procedure filters)
        if (!empty($params['employeeCode'])) {
            // Handle comma-separated employee codes (legacy behavior)
            $codes = array_map('trim', explode(',', $params['employeeCode']));
            $query->whereIn('employee_code', $codes);
        }
        
        if (!empty($params['employeeName'])) {
            $query->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', '%' . $params['employeeName'] . '%');
        }
        
        if (!empty($params['departmentId'])) {
            $query->whereHas('employmentDetail', function($q) use ($params) {
                $q->where('department_id', $params['departmentId']);
            });
        }
        
        if (!empty($params['branchId'])) {
            $query->whereHas('employmentDetail', function($q) use ($params) {
                $q->where('branch_id', $params['branchId']);
            });
        }
        
        if (isset($params['isManualAttendance'])) {
            $query->whereHas('employmentDetail', function($q) use ($params) {
                $q->where('is_manual_attendance', $params['isManualAttendance']);
            });
        }
        
        // Exclude ex-employees (EmployeeStatus != 4 in legacy)
        $query->whereHas('employmentDetail', function($q) {
            $q->where('employee_status', '!=', 4);
        });
        
        // Get total count before pagination
        $totalRecords = $query->count();
        
        // Apply pagination
        $offset = $pageIndex * $pageSize;
        $employees = $query->offset($offset)->limit($pageSize)->get();
        
        // Build employee reports with attendance data
        $employeeReports = [];
        
        foreach ($employees as $employee) {
            // Get attendance records for date range
            $attendances = Attendance::where('employee_id', $employee->id)
                ->whereBetween('date', [$dateFrom, $dateTo])
                ->orderBy('date')
                ->get();
            
            // Build workedHoursByDate dictionary (matching legacy JSON structure)
            $workedHoursByDate = [];
            $totalMinutes = 0;
            
            foreach ($attendances as $attendance) {
                $dateKey = $attendance->date->format('Y-m-d');
                $workedHoursByDate[$dateKey] = $attendance->total_hours ?? '00:00';
                
                // Calculate total minutes for totalHour
                if ($attendance->total_hours) {
                    $parts = explode(':', $attendance->total_hours);
                    if (count($parts) === 2) {
                        $totalMinutes += (intval($parts[0]) * 60) + intval($parts[1]);
                    }
                }
            }
            
            // Calculate total hours in HH:MM format
            $totalHours = floor($totalMinutes / 60);
            $totalMins = $totalMinutes % 60;
            $totalHour = sprintf('%02d:%02d', $totalHours, $totalMins);
            
            // Get department name
            $departmentName = 'N/A';
            if ($employee->employmentDetail && $employee->employmentDetail->department) {
                $departmentName = $employee->employmentDetail->department->department_name 
                    ?? $employee->employmentDetail->department->department 
                    ?? 'N/A';
            }
            
            // Get branch - map ID to name (matching legacy frontend expectations)
            // Legacy database schema: BranchId values (1=Hyderabad, 2=Jaipur, 3=Pune)
            // But current database has different IDs (401, 402, 403)
            $branchId = $employee->employmentDetail->branch_id ?? null;
            $branchName = null;
            
            // Map branch ID to name based on actual database values
            if ($branchId) {
                $branchMapping = [
                    401 => 'Hyderabad',
                    402 => 'Jaipur', 
                    403 => 'Pune',
                    1 => 'Hyderabad',  // Support both old and new schemas
                    2 => 'Jaipur',
                    3 => 'Pune'
                ];
                $branchName = $branchMapping[$branchId] ?? null;
            }
            
            // Build employee report matching legacy EmployeeReportDto structure
            $employeeReports[] = [
                'employeeId' => $employee->id,
                'employeeCode' => $employee->employee_code,
                'employeeName' => trim($employee->first_name . ' ' . $employee->last_name),
                'department' => $departmentName,
                'branch' => $branchName, // Return branch name, not ID
                'totalHour' => $totalHour,
                'workedHoursByDate' => $workedHoursByDate, // Dictionary with date keys and HH:MM values
                'employeeEmail' => $employee->employmentDetail->email ?? '',
                'isManualAttendance' => $employee->employmentDetail->is_manual_attendance ?? false
            ];
        }
        
        // Match legacy response structure (EmployeeReportResponseDto)
        return [
            'employeeReports' => $employeeReports,
            'totalRecords' => $totalRecords
        ];
    }
    
    /**
     * Export employee attendance report to Excel
     * Legacy: GenerateAttendanceReportExcelFile
     */
    public function exportEmployeeReportExcel(array $params)
    {
        // Use same filters as getEmployeeReport (no pagination)
        $dateFrom = $params['dateFrom'] ?? Carbon::now()->subDays(7)->format('Y-m-d');
        $dateTo = $params['dateTo'] ?? Carbon::now()->format('Y-m-d');
        
        // Build query with same filters
        $query = EmployeeData::with(['employmentDetail.department', 'employmentDetail.designationModel'])
            ->where('is_deleted', 0);
        
        // Apply same filters as getEmployeeReport
        if (!empty($params['employeeCode'])) {
            $codes = array_map('trim', explode(',', $params['employeeCode']));
            $query->whereIn('employee_code', $codes);
        }
        
        if (!empty($params['employeeName'])) {
            $query->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', '%' . $params['employeeName'] . '%');
        }
        
        if (!empty($params['departmentId'])) {
            $query->whereHas('employmentDetail', function($q) use ($params) {
                $q->where('department_id', $params['departmentId']);
            });
        }
        
        if (!empty($params['branchId'])) {
            $query->whereHas('employmentDetail', function($q) use ($params) {
                $q->where('branch_id', $params['branchId']);
            });
        }
        
        if (isset($params['isManualAttendance'])) {
            $query->whereHas('employmentDetail', function($q) use ($params) {
                $q->where('is_manual_attendance', $params['isManualAttendance']);
            });
        }
        
        $query->whereHas('employmentDetail', function($q) {
            $q->where('employee_status', '!=', 4);
        });
        
        $employees = $query->get();
        
        // Generate date range for columns (matching legacy - descending order)
        $dateRange = [];
        $currentDate = Carbon::parse($dateFrom);
        $endDate = Carbon::parse($dateTo);
        
        while ($currentDate->lte($endDate)) {
            $dateRange[] = $currentDate->copy();
            $currentDate->addDay();
        }
        
        // Reverse to match legacy (OrderByDescending)
        $dateRange = array_reverse($dateRange);
        
        // Build Excel data matching legacy format
        $excelData = [];
        
        // Header row: Sr No. | Employee Name | Employee Code | Total Hours | Date columns
        $headers = ['Sr No.', 'Employee Name', 'Employee Code', 'Total Hours'];
        foreach ($dateRange as $date) {
            // Format: "Mon\n(1/15/2024)" matching legacy
            $dayOfWeek = $date->format('D'); // Mon, Tue, etc.
            $dateStr = $date->format('m/d/Y');
            $headers[] = $dayOfWeek . "\n(" . $dateStr . ')';
        }
        $excelData[] = $headers;
        
        // Data rows
        $sno = 1;
        foreach ($employees as $employee) {
            // Get all attendance for date range
            $attendances = Attendance::where('employee_id', $employee->id)
                ->whereBetween('date', [$dateFrom, $dateTo])
                ->get()
                ->keyBy(function($item) {
                    return $item->date->format('Y-m-d');
                });
            
            // Calculate total hours
            $totalMinutes = 0;
            $workedHoursByDate = [];
            
            foreach ($attendances as $attendance) {
                $dateKey = $attendance->date->format('Y-m-d');
                $workedHoursByDate[$dateKey] = $attendance->total_hours ?? '00:00';
                
                if ($attendance->total_hours) {
                    $parts = explode(':', $attendance->total_hours);
                    if (count($parts) === 2) {
                        $totalMinutes += (intval($parts[0]) * 60) + intval($parts[1]);
                    }
                }
            }
            
            $totalHours = floor($totalMinutes / 60);
            $totalMins = $totalMinutes % 60;
            
            // Format total hours: "8h 30min" matching legacy Helper.GetFormattedTime
            $totalHourFormatted = $totalHours . 'h';
            if ($totalMins > 0) {
                $totalHourFormatted .= ' ' . $totalMins . 'min';
            }
            
            $row = [
                $sno++,
                trim($employee->first_name . ' ' . $employee->last_name),
                $employee->employee_code,
                $totalHourFormatted
            ];
            
            // Add daily hours for each date (in reverse order)
            foreach ($dateRange as $date) {
                $dateKey = $date->format('Y-m-d');
                if (isset($workedHoursByDate[$dateKey])) {
                    $hours = $workedHoursByDate[$dateKey];
                    // Format as "8h 30min"
                    $parts = explode(':', $hours);
                    if (count($parts) === 2) {
                        $h = intval($parts[0]);
                        $m = intval($parts[1]);
                        $formatted = $h . 'h';
                        if ($m > 0) {
                            $formatted .= ' ' . $m . 'min';
                        }
                        $row[] = $formatted;
                    } else {
                        $row[] = '0';
                    }
                } else {
                    $row[] = '0';
                }
            }
            
            $excelData[] = $row;
        }
        
        // Generate CSV (matching legacy Excel format)
        $output = fopen('php://temp', 'r+');
        foreach ($excelData as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);
        
        return $csvContent;
    }
    
    /**
     * Format attendance record for response
     * Convert UTC times to IST (matching legacy ConvertUtcToDiffTimeZone)
     */
    private function formatAttendanceRecord($attendance): array
    {
        // Convert UTC times to IST
        $startTimeIst = $attendance->start_time ? TimezoneHelper::utcToIst($attendance->start_time) : '';
        $endTimeIst = $attendance->end_time ? TimezoneHelper::utcToIst($attendance->end_time) : '';
        
        // Convert audit times to IST
        $auditsIst = $attendance->audits->map(function ($audit) {
            return [
                'action' => $audit->action,
                'time' => $audit->time ? TimezoneHelper::utcToIst($audit->time) : '',
                'comment' => $audit->comment,
                'reason' => $audit->reason
            ];
        })->toArray();
        
        return [
            'id' => $attendance->id,
            'date' => $attendance->date->format('Y-m-d'),
            'day' => $attendance->day,
            'startTime' => $startTimeIst,
            'endTime' => $endTimeIst,
            'totalHours' => $attendance->total_hours ?? '00:00',
            'location' => $attendance->location ?? '',
            'attendanceType' => $attendance->attendance_type,
            'audit' => $auditsIst
        ];
    }
}
