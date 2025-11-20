<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Public routes with rate limiting
Route::prefix('auth')->group(function () {
    // SSO Login with auth rate limiting
    Route::post('/', [AuthController::class, 'ssoLogin'])
        ->middleware('throttle:auth');
    
    // Internal login with stricter rate limiting and API key
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware(['api.key', 'throttle:login']);
    
    // Refresh token with auth rate limiting
    Route::post('/refresh-token', [AuthController::class, 'refreshToken'])
        ->middleware('throttle:auth');
    
    // Health check (no rate limiting)
    Route::get('/check-health', [AuthController::class, 'checkHealth']);
});

// Public test routes (for testing only - temporarily public)
Route::get('/employees/next-code/generate', [\App\Http\Controllers\Api\EmployeeController::class, 'getNextEmployeeCode']);

// Master data endpoints (public for initial testing, should be protected in production)
Route::prefix('master')->group(function () {
    Route::get('/all', [\App\Http\Controllers\Api\MasterDataController::class, 'getAllMasterData']);
    Route::get('/branches', [\App\Http\Controllers\Api\MasterDataController::class, 'getBranches']);
    Route::get('/departments', [\App\Http\Controllers\Api\MasterDataController::class, 'getDepartments']);
    Route::get('/designations', [\App\Http\Controllers\Api\MasterDataController::class, 'getDesignations']);
    Route::get('/designations-by-department', [\App\Http\Controllers\Api\MasterDataController::class, 'getDesignationsByDepartment']);
    Route::get('/teams', [\App\Http\Controllers\Api\MasterDataController::class, 'getTeams']);
    Route::get('/teams-by-department', [\App\Http\Controllers\Api\MasterDataController::class, 'getTeamsByDepartment']);
    Route::get('/countries', [\App\Http\Controllers\Api\MasterDataController::class, 'getCountries']);
    Route::get('/states', [\App\Http\Controllers\Api\MasterDataController::class, 'getStates']);
    Route::get('/cities', [\App\Http\Controllers\Api\MasterDataController::class, 'getCities']);
    Route::get('/relationships', [\App\Http\Controllers\Api\MasterDataController::class, 'getRelationships']);
    Route::get('/blood-groups', [\App\Http\Controllers\Api\MasterDataController::class, 'getBloodGroups']);
    Route::get('/marital-statuses', [\App\Http\Controllers\Api\MasterDataController::class, 'getMaritalStatuses']);
    Route::get('/genders', [\App\Http\Controllers\Api\MasterDataController::class, 'getGenders']);
    Route::get('/employment-statuses', [\App\Http\Controllers\Api\MasterDataController::class, 'getEmploymentStatuses']);
    Route::get('/nominee-types', [\App\Http\Controllers\Api\MasterDataController::class, 'getNomineeTypes']);
    Route::get('/employees', [\App\Http\Controllers\Api\MasterDataController::class, 'getEmployees']);
});

// Legacy API endpoints (for backward compatibility with React frontend)
Route::prefix('UserProfile')->group(function () {
    Route::get('/GetReportingManagerList', [\App\Http\Controllers\Api\MasterDataController::class, 'getReportingManagerList']);
    
    // Profile picture endpoints (legacy compatibility)
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('/UploadUserProfileImage', [\App\Http\Controllers\Api\ProfilePictureController::class, 'upload'])
            ->middleware('permission:employee.create');
        Route::post('/UpdateProfilePicture/{id}', [\App\Http\Controllers\Api\ProfilePictureController::class, 'update'])
            ->middleware('permission:employee.edit');
        Route::get('/RemoveProfilePicture/{id}', [\App\Http\Controllers\Api\ProfilePictureController::class, 'remove'])
            ->middleware('permission:employee.delete');
    });
});

// Protected routes (require authentication + rate limiting)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Get menu structure for authenticated user
    Route::get('/menu', [AuthController::class, 'getMenu']);

    // Employee Exit Management API
    Route::get('/employees/exit', [\App\Http\Controllers\Api\EmployeeExitController::class, 'index'])
        ->middleware('permission:Read.ExitManagement');

    // Module-2: Employee Management Routes
    Route::prefix('employees')->group(function () {
        // Export/Import (matching legacy endpoints)
        Route::post('/export', [\App\Http\Controllers\Api\EmployeeController::class, 'export'])
            ->middleware('permission:employee.view');
        Route::post('/import', [\App\Http\Controllers\Api\EmployeeController::class, 'import'])
            ->middleware('permission:employee.create');
        
        // Employee CRUD (Features #1-8)
        Route::get('/', [\App\Http\Controllers\Api\EmployeeController::class, 'index'])
            ->middleware('permission:employee.view');
        Route::post('/', [\App\Http\Controllers\Api\EmployeeController::class, 'store'])
            ->middleware('permission:employee.create');
        
        // Address Management (Features #16-18)
        Route::prefix('addresses')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\AddressController::class, 'index'])
                ->middleware('permission:employee.view');
            Route::post('/current', [\App\Http\Controllers\Api\AddressController::class, 'storeCurrentAddress'])
                ->middleware('permission:employee.create');
            Route::post('/permanent', [\App\Http\Controllers\Api\AddressController::class, 'storePermanentAddress'])
                ->middleware('permission:employee.create');
            Route::post('/copy-current-to-permanent', [\App\Http\Controllers\Api\AddressController::class, 'copyCurrentToPermanent'])
                ->middleware('permission:employee.create');
        });
        
        // Bank Details Management (Features #19-22)
        Route::prefix('bank-details')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\BankDetailsController::class, 'index'])
                ->middleware('permission:employee.view');
            Route::post('/', [\App\Http\Controllers\Api\BankDetailsController::class, 'store'])
                ->middleware('permission:employee.create');
            Route::put('/{id}', [\App\Http\Controllers\Api\BankDetailsController::class, 'update'])
                ->middleware('permission:employee.edit');
            Route::delete('/{id}', [\App\Http\Controllers\Api\BankDetailsController::class, 'destroy'])
                ->middleware('permission:employee.delete');
            Route::post('/{id}/set-active', [\App\Http\Controllers\Api\BankDetailsController::class, 'setActive'])
                ->middleware('permission:employee.edit');
        });
        
        // Nominee Management (Features #32-38)
        Route::prefix('nominees')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\NomineeController::class, 'index'])
                ->middleware('permission:employee.view');
            Route::post('/', [\App\Http\Controllers\Api\NomineeController::class, 'store'])
                ->middleware('permission:employee.create');
            Route::put('/{id}', [\App\Http\Controllers\Api\NomineeController::class, 'update'])
                ->middleware('permission:employee.edit');
            Route::delete('/{id}', [\App\Http\Controllers\Api\NomineeController::class, 'destroy'])
                ->middleware('permission:employee.delete');
            Route::post('/verify-percentage', [\App\Http\Controllers\Api\NomineeController::class, 'verifyPercentage'])
                ->middleware('permission:employee.view');
        });
        
        // Document Management (Features #23-26)
        Route::prefix('documents')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\DocumentController::class, 'index'])
                ->middleware('permission:employee.view');
            Route::post('/', [\App\Http\Controllers\Api\DocumentController::class, 'store'])
                ->middleware('permission:employee.create');
            Route::put('/{id}', [\App\Http\Controllers\Api\DocumentController::class, 'update'])
                ->middleware('permission:employee.edit');
            Route::delete('/{id}', [\App\Http\Controllers\Api\DocumentController::class, 'destroy'])
                ->middleware('permission:employee.delete');
            Route::get('/{id}/download', [\App\Http\Controllers\Api\DocumentController::class, 'download'])
                ->middleware('permission:employee.view');
            Route::get('/types', [\App\Http\Controllers\Api\DocumentController::class, 'getDocumentTypes'])
                ->middleware('permission:employee.view');
        });
        
        // Qualification Management (Features #39-44)
        Route::prefix('qualifications')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\QualificationController::class, 'index'])
                ->middleware('permission:employee.view');
            Route::post('/', [\App\Http\Controllers\Api\QualificationController::class, 'store'])
                ->middleware('permission:employee.create');
            Route::put('/{id}', [\App\Http\Controllers\Api\QualificationController::class, 'update'])
                ->middleware('permission:employee.edit');
            Route::delete('/{id}', [\App\Http\Controllers\Api\QualificationController::class, 'destroy'])
                ->middleware('permission:employee.delete');
            Route::get('/masters/qualifications', [\App\Http\Controllers\Api\QualificationController::class, 'getQualifications'])
                ->middleware('permission:employee.view');
            Route::get('/masters/universities', [\App\Http\Controllers\Api\QualificationController::class, 'getUniversities'])
                ->middleware('permission:employee.view');
        });
        
        // Certificate Management (Features #45-46)
        Route::prefix('certificates')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\QualificationController::class, 'getCertificates'])
                ->middleware('permission:employee.view');
            Route::post('/', [\App\Http\Controllers\Api\QualificationController::class, 'storeCertificate'])
                ->middleware('permission:employee.create');
            Route::delete('/{id}', [\App\Http\Controllers\Api\QualificationController::class, 'destroyCertificate'])
                ->middleware('permission:employee.delete');
        });
        
        // Profile Picture Management
        Route::prefix('profile-picture')->group(function () {
            Route::post('/upload', [\App\Http\Controllers\Api\ProfilePictureController::class, 'upload'])
                ->middleware('permission:employee.create');
            Route::post('/{id}/update', [\App\Http\Controllers\Api\ProfilePictureController::class, 'update'])
                ->middleware('permission:employee.edit');
            Route::delete('/{id}', [\App\Http\Controllers\Api\ProfilePictureController::class, 'remove'])
                ->middleware('permission:employee.delete');
            Route::get('/{id}/url', [\App\Http\Controllers\Api\ProfilePictureController::class, 'getUrl'])
                ->middleware('permission:employee.view');
        });
        
        // Employee CRUD with ID (must be at the end to avoid catching nested routes)
        // Note: More specific routes like /{id}/profile-completeness must come BEFORE /{id}
        Route::get('/{id}/profile-completeness', [\App\Http\Controllers\Api\EmployeeController::class, 'getProfileCompleteness'])
            ->middleware('permission:employee.view');
        Route::get('/{id}', [\App\Http\Controllers\Api\EmployeeController::class, 'show'])
            ->middleware('permission:employee.view');
        Route::put('/{id}', [\App\Http\Controllers\Api\EmployeeController::class, 'update'])
            ->middleware('permission:employee.edit');
        Route::delete('/{id}', [\App\Http\Controllers\Api\EmployeeController::class, 'destroy'])
            ->middleware('permission:employee.delete');
    });
    
    // Module-3: Attendance Management Routes
    Route::prefix('attendance')->group(function () {
        // Employee Attendance CRUD
        Route::post('/add-attendance/{employeeId}', [\App\Http\Controllers\AttendanceController::class, 'addAttendance'])
            ->middleware('permission:attendance.create');
            
        Route::get('/get-attendance/{employeeId}', [\App\Http\Controllers\AttendanceController::class, 'getAttendance'])
            ->middleware('permission:attendance.read');
            
        Route::put('/update-attendance/{employeeId}/{attendanceId}', [\App\Http\Controllers\AttendanceController::class, 'updateAttendance'])
            ->middleware('permission:attendance.edit');
        
        // Configuration Management
        Route::put('/update-config', [\App\Http\Controllers\AttendanceController::class, 'updateConfig'])
            ->middleware('permission:attendance.admin');
            
        Route::post('/get-attendance-config-list', [\App\Http\Controllers\AttendanceController::class, 'getAttendanceConfigList']);
            // TODO: Re-enable permission middleware after granting permissions
            // ->middleware('permission:attendance.admin');
        
        // Reporting
        Route::post('/get-employee-report', [\App\Http\Controllers\AttendanceController::class, 'getEmployeeReport'])
            ->middleware('permission:attendance.report');
            
        Route::post('/export-employee-report-excel', [\App\Http\Controllers\AttendanceController::class, 'exportEmployeeReportExcel'])
            ->middleware('permission:attendance.export');
        
        // Time Doctor Integration
        Route::post('/trigger-timesheet-sync', [\App\Http\Controllers\AttendanceController::class, 'triggerTimeDoctorSync'])
            ->middleware('permission:attendance.admin');
    });

    // ============================================================================
    // EXIT MANAGEMENT (MODULE 4) - Employee Routes
    // ============================================================================
    Route::prefix('ExitEmployee')->group(function () {
        // Submit new resignation
        Route::post('/AddResignation', [\App\Http\Controllers\ExitEmployeeController::class, 'addResignation']);
        
        // Get resignation form details
        Route::get('/GetResignationForm/{id}', [\App\Http\Controllers\ExitEmployeeController::class, 'getResignationForm']);
        
        // Get resignation exit details (with clearances)
        Route::get('/GetResignationDetails/{id}', [\App\Http\Controllers\ExitEmployeeController::class, 'getResignationExitDetails']);
        
        // Revoke/Withdraw resignation
        Route::post('/RevokeResignation/{resignationId}', [\App\Http\Controllers\ExitEmployeeController::class, 'revokeResignation']);
        
        // Request early release
        Route::post('/RequestEarlyRelease', [\App\Http\Controllers\ExitEmployeeController::class, 'requestEarlyRelease']);
        
        // Check if resignation exists for employee
        Route::get('/IsResignationExist/{employeeId}', [\App\Http\Controllers\ExitEmployeeController::class, 'isResignationExist']);
    });

    // ============================================================================
    // EXIT MANAGEMENT (MODULE 4) - Admin Routes
    // ============================================================================
    Route::prefix('AdminExitEmployee')->group(function () {
        // Get resignation list with search/filters
        Route::post('/GetResignationList', [\App\Http\Controllers\AdminExitEmployeeController::class, 'getResignationList']);
        
        // Get resignation detail by ID
        Route::get('/GetResignationById/{id}', [\App\Http\Controllers\AdminExitEmployeeController::class, 'getResignationById']);
        
        // Accept resignation
        Route::post('/AcceptResignation/{id}', [\App\Http\Controllers\AdminExitEmployeeController::class, 'acceptResignation']);
        
        // Accept early release
        Route::post('/AcceptEarlyRelease', [\App\Http\Controllers\AdminExitEmployeeController::class, 'acceptEarlyRelease']);
        
        // Admin rejection (resignation or early release)
        Route::post('/AdminRejection', [\App\Http\Controllers\AdminExitEmployeeController::class, 'adminRejection']);
        
        // Update last working day
        Route::patch('/UpdateLastWorkingDay', [\App\Http\Controllers\AdminExitEmployeeController::class, 'updateLastWorkingDay']);
        
        // HR Clearance
        Route::get('/GetHRClearanceByResignationId/{resignationId}', [\App\Http\Controllers\AdminExitEmployeeController::class, 'getHRClearance']);
        Route::post('/UpsertHRClearance', [\App\Http\Controllers\AdminExitEmployeeController::class, 'upsertHRClearance']);
        
        // Department Clearance
        Route::get('/GetDepartmentClearanceDetailByResignationId/{resignationId}', [\App\Http\Controllers\AdminExitEmployeeController::class, 'getDepartmentClearance']);
        Route::post('/UpsertDepartmentClearance', [\App\Http\Controllers\AdminExitEmployeeController::class, 'upsertDepartmentClearance']);
        
        // IT Clearance
        Route::get('/GetITClearanceDetailByResignationId/{resignationId}', [\App\Http\Controllers\AdminExitEmployeeController::class, 'getITClearance']);
        Route::post('/AddUpdateITClearance', [\App\Http\Controllers\AdminExitEmployeeController::class, 'addUpdateITClearance']);
        
        // Account Clearance
        Route::get('/GetAccountClearance/{resignationId}', [\App\Http\Controllers\AdminExitEmployeeController::class, 'getAccountClearance']);
        Route::post('/AddUpdateAccountClearance', [\App\Http\Controllers\AdminExitEmployeeController::class, 'addUpdateAccountClearance']);
    });
});
