<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Add daily attendance record
     * POST /api/attendance/add-attendance/{employeeId}
     */
    public function addAttendance(Request $request, $employeeId)
    {
        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'startTime' => 'nullable|date_format:H:i',
            'endTime' => 'nullable|date_format:H:i|after:startTime',
            'location' => 'required|string|max:255',
            'attendanceType' => 'string|max:100',
            'audit' => 'array'
        ]);

        try {
            $result = $this->attendanceService->addAttendance($employeeId, $validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance added successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get attendance records for employee with pagination
     * GET /api/attendance/get-attendance/{employeeId}
     */
    public function getAttendance(Request $request, $employeeId)
    {
        $dateFrom = $request->query('dateFrom', Carbon::now()->startOfWeek()->toDateString());
        $dateTo = $request->query('dateTo', Carbon::now()->endOfWeek()->toDateString());
        $pageIndex = $request->query('pageIndex', 0);
        $pageSize = $request->query('pageSize', 7);

        try {
            $result = $this->attendanceService->getAttendanceByEmployee(
                $employeeId, $dateFrom, $dateTo, $pageIndex, $pageSize
            );
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update existing attendance record
     * PUT /api/attendance/update-attendance/{employeeId}/{attendanceId}
     */
    public function updateAttendance(Request $request, $employeeId, $attendanceId)
    {
        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'startTime' => 'nullable|date_format:H:i',
            'endTime' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'audit' => 'array'
        ]);

        try {
            $result = $this->attendanceService->updateAttendance(
                $employeeId, $attendanceId, $validated
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance updated successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Toggle attendance configuration (Manual/Automatic)
     * PUT /api/attendance/update-config
     */
    public function updateConfig(Request $request)
    {
        $validated = $request->validate([
            'employeeId' => 'required|integer|exists:employee_data,id'
        ]);

        try {
            $result = $this->attendanceService->toggleAttendanceConfig(
                $validated['employeeId']
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance configuration updated successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get attendance configuration list (Admin)
     * POST /api/attendance/get-attendance-config-list
     */
    public function getAttendanceConfigList(Request $request)
    {
        try {
            \Log::info('Attendance Config List Request', [
                'data' => $request->all(),
                'user' => auth()->check() ? auth()->user()->email : 'not authenticated',
                'headers' => $request->headers->all()
            ]);
            
            $validated = $request->validate([
                'sortColumnName' => 'nullable|string',
                'sortDirection' => 'nullable|string',
                'startIndex' => 'nullable|integer|min:0',
                'pageSize' => 'nullable|integer|min:1|max:100',
                'filters' => 'nullable|array',
                'filters.employeeCode' => 'nullable|string',
                'filters.employeeName' => 'nullable|string',
                'filters.departmentId' => 'nullable|integer',
                'filters.designationId' => 'nullable|integer',
                'filters.branchId' => 'nullable|integer',
                'filters.countryId' => 'nullable|integer',
                'filters.isManualAttendance' => 'nullable|boolean',
                'filters.dojFrom' => 'nullable|date',
                'filters.dojTo' => 'nullable|date',
            ]);

            $result = $this->attendanceService->getAttendanceConfigList($validated);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Error in getAttendanceConfigList', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get employee attendance report (Manager/HR)
     * POST /api/attendance/get-employee-report
     * Legacy: POST api/Attendance/GetEmployeeReport with SearchRequestDto<EmployeeReportSearchRequestDto>
     */
    public function getEmployeeReport(Request $request)
    {
        try {
            \Log::info('Employee Report Request', [
                'data' => $request->all(),
                'user' => auth()->check() ? auth()->user()->email : 'not authenticated'
            ]);
            
            // Match legacy SearchRequestDto structure
            $validated = $request->validate([
                'sortColumnName' => 'nullable|string',
                'sortDirection' => 'nullable|string',
                'startIndex' => 'nullable|integer|min:0',
                'pageSize' => 'nullable|integer|min:1|max:100',
                'pageIndex' => 'nullable|integer|min:0', // Alternative to startIndex
                'filters' => 'nullable|array',
                'filters.employeeCode' => 'nullable|string',
                'filters.employeeName' => 'nullable|string',
                'filters.employeeEmail' => 'nullable|string',
                'filters.departmentId' => 'nullable|integer',
                'filters.branchId' => 'nullable|integer',
                'filters.designationId' => 'nullable|integer',
                'filters.countryId' => 'nullable|integer',
                'filters.isManualAttendance' => 'nullable|boolean',
                'filters.dateFrom' => 'nullable|date',
                'filters.dateTo' => 'nullable|date|after_or_equal:filters.dateFrom',
                'filters.dojFrom' => 'nullable|date',
                'filters.dojTo' => 'nullable|date',
                // Also accept direct params (for backward compatibility)
                'employeeCode' => 'nullable|string',
                'employeeName' => 'nullable|string',
                'dateFrom' => 'nullable|date',
                'dateTo' => 'nullable|date',
                'departmentId' => 'nullable|integer',
                'branchId' => 'nullable|integer',
                'isManualAttendance' => 'nullable|boolean',
            ]);

            // Merge filters and direct params
            $filters = $validated['filters'] ?? [];
            
            // Build params for service
            $params = [
                'pageIndex' => $validated['pageIndex'] ?? ($validated['startIndex'] ?? 0),
                'pageSize' => $validated['pageSize'] ?? 10,
                'sortColumnName' => $validated['sortColumnName'] ?? null,
                'sortDirection' => $validated['sortDirection'] ?? 'asc',
                'employeeCode' => $filters['employeeCode'] ?? $validated['employeeCode'] ?? null,
                'employeeName' => $filters['employeeName'] ?? $validated['employeeName'] ?? null,
                'dateFrom' => $filters['dateFrom'] ?? $validated['dateFrom'] ?? null,
                'dateTo' => $filters['dateTo'] ?? $validated['dateTo'] ?? null,
                'departmentId' => $filters['departmentId'] ?? $validated['departmentId'] ?? null,
                'branchId' => $filters['branchId'] ?? $validated['branchId'] ?? null,
                'isManualAttendance' => $filters['isManualAttendance'] ?? $validated['isManualAttendance'] ?? null,
            ];
            
            $result = $this->attendanceService->getEmployeeReport($params);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Error in getEmployeeReport', [
                'error' => $e->getMessage(), 
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Export attendance report to Excel
     * POST /api/attendance/export-employee-report-excel
     * Legacy: POST api/Attendance/ExportEmployeeReportExcel
     */
    public function exportEmployeeReportExcel(Request $request)
    {
        try {
            // Match legacy SearchRequestDto structure (same as getEmployeeReport)
            $validated = $request->validate([
                'sortColumnName' => 'nullable|string',
                'sortDirection' => 'nullable|string',
                'filters' => 'nullable|array',
                'filters.employeeCode' => 'nullable|string',
                'filters.employeeName' => 'nullable|string',
                'filters.employeeEmail' => 'nullable|string',
                'filters.departmentId' => 'nullable|integer',
                'filters.branchId' => 'nullable|integer',
                'filters.isManualAttendance' => 'nullable|boolean',
                'filters.dateFrom' => 'nullable|date',
                'filters.dateTo' => 'nullable|date|after_or_equal:filters.dateFrom',
                // Also accept direct params
                'employeeCode' => 'nullable|string',
                'employeeName' => 'nullable|string',
                'dateFrom' => 'nullable|date',
                'dateTo' => 'nullable|date',
                'departmentId' => 'nullable|integer',
                'branchId' => 'nullable|integer',
                'isManualAttendance' => 'nullable|boolean',
            ]);
            
            // Merge filters and direct params
            $filters = $validated['filters'] ?? [];
            
            $params = [
                'employeeCode' => $filters['employeeCode'] ?? $validated['employeeCode'] ?? null,
                'employeeName' => $filters['employeeName'] ?? $validated['employeeName'] ?? null,
                'dateFrom' => $filters['dateFrom'] ?? $validated['dateFrom'] ?? null,
                'dateTo' => $filters['dateTo'] ?? $validated['dateTo'] ?? null,
                'departmentId' => $filters['departmentId'] ?? $validated['departmentId'] ?? null,
                'branchId' => $filters['branchId'] ?? $validated['branchId'] ?? null,
                'isManualAttendance' => $filters['isManualAttendance'] ?? $validated['isManualAttendance'] ?? null,
            ];
            
            $excelData = $this->attendanceService->exportEmployeeReportExcel($params);
            
            // Match legacy filename format: EmployeeReport_yyyyMMdd_HHmmss.xlsx
            $timestamp = Carbon::now()->format('Ymd_His');
            $fileName = "EmployeeReport_{$timestamp}.xlsx";
            
            return response()->streamDownload(
                function () use ($excelData) {
                    echo $excelData;
                },
                $fileName,
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Export employee report failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Manually trigger Time Doctor sync job
     * POST /api/attendance/trigger-timesheet-sync
     * Legacy: AttendanceController.TriggerFetchTimeSheetSummaryStats
     */
    public function triggerTimeDoctorSync(Request $request)
    {
        $validated = $request->validate([
            'forDate' => 'required|date'
        ]);

        try {
            $date = \Carbon\Carbon::parse($validated['forDate']);
            $timeDoctorService = new \App\Services\TimeDoctorSyncService();
            
            $result = $timeDoctorService->syncTimesheetForDate($date);
            
            return response()->json([
                'success' => true,
                'message' => 'Time Doctor sync completed successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            \Log::error('Time Doctor sync trigger failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync Time Doctor data: ' . $e->getMessage()
            ], 400);
        }
    }
}
