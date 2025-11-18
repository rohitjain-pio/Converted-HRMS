<?php

/**
 * Script to create/update test users with Time Doctor IDs
 * Users: rohit.jain and anand.sharma (@programmers.io and @programmers.ai)
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use App\Models\Address;
use App\Models\UserRoleMapping;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

function createOrUpdateTestUser($email, $timeDoctorId, $firstName, $lastName)
{
    echo "\n=== Processing: $email ===\n";
    
    // Check if user exists
    $employee = EmployeeData::where('personal_email', $email)->first();
    
    if ($employee) {
        echo "User exists with ID: {$employee->id}. Deleting...\n";
        
        // Delete related records
        DB::table('user_role_mappings')->where('employee_id', $employee->id)->delete();
        Address::where('employee_id', $employee->id)->delete();
        EmploymentDetail::where('employee_id', $employee->id)->delete();
        
        // Delete employee
        $employee->delete();
        echo "Deleted existing user.\n";
    }
    
    // Generate employee code
    $latestEmployee = EmployeeData::orderBy('id', 'desc')->first();
    $nextNumber = $latestEmployee ? (intval(substr($latestEmployee->employee_code, 3)) + 1) : 1;
    $employeeCode = 'EMP' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    
    echo "Creating new user with code: $employeeCode\n";
    
    // Create employee data
    $employee = EmployeeData::create([
        'employee_code' => $employeeCode,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'personal_email' => $email,
        'phone' => '9999999999',
        'alternate_phone' => null,
        'dob' => '1990-01-01',
        'blood_group' => 'O+',
        'marital_status' => 0, // 0 = Single
        'gender' => 1, // 1 = Male, 0 = Female
        'password' => Hash::make('password'),
        'file_name' => null,
        'is_deleted' => 0,
        'created_by' => 'system',
        'created_on' => now()
    ]);
    
    echo "Created employee with ID: {$employee->id}\n";
    
    // Get department and designation IDs
    $department = DB::table('department')->where('department', 'Engineering')->first();
    $designation = DB::table('designation')->where('designation', 'Software Engineer')->first();
    
    if (!$department) {
        // Create Engineering department
        $departmentId = DB::table('department')->insertGetId([
            'department' => 'Engineering',
            'created_by' => 'system',
            'created_on' => now()
        ]);
        echo "Created Engineering department with ID: $departmentId\n";
    } else {
        $departmentId = $department->id;
    }
    
    if (!$designation) {
        // Create Software Engineer designation
        $designationId = DB::table('designation')->insertGetId([
            'designation' => 'Software Engineer',
            'created_by' => 'system',
            'created_on' => now()
        ]);
        echo "Created Software Engineer designation with ID: $designationId\n";
    } else {
        $designationId = $designation->id;
    }
    
    // Create employment detail with Time Doctor ID
    EmploymentDetail::create([
        'employee_id' => $employee->id,
        'employee_code' => $employeeCode,
        'email' => $email,
        'role_id' => 3, // Employee role
        'joining_date' => '2024-01-01',
        'department_id' => $departmentId,
        'designation_id' => $designationId,
        'branch_id' => 401, // Hyderabad
        'employee_status' => 1, // Active
        'employment_type' => 'Full Time',
        'time_doctor_user_id' => $timeDoctorId,
        'is_manual_attendance' => false, // Auto-sync from Time Doctor
        'probation_period' => 90,
        'notice_period' => 30,
        'created_by' => 'system',
        'created_on' => now()
    ]);
    
    echo "Created employment detail with Time Doctor ID: $timeDoctorId\n";
    
    // Create address
    Address::create([
        'employee_id' => $employee->id,
        'country_id' => 1,
        'state_id' => 1,
        'city_id' => 1,
        'address_type' => 1, // 1 = Current, 0 = Permanent
        'created_by' => 'system',
        'created_on' => now()
    ]);
    
    echo "Created address\n";
    
    // Assign Employee role (RoleId = 3)
    DB::table('user_role_mappings')->insert([
        'role_id' => 3,
        'employee_id' => $employee->id,
        'created_by' => 'system',
        'created_on' => now(),
        'is_deleted' => 0
    ]);
    
    echo "Assigned Employee role\n";
    echo "✓ Successfully created user: $email\n";
    
    return $employee;
}

try {
    DB::beginTransaction();
    
    echo "\n╔════════════════════════════════════════════════╗\n";
    echo "║  Creating Test Users with Time Doctor IDs    ║\n";
    echo "╚════════════════════════════════════════════════╝\n";
    
    // Create 4 test users
    createOrUpdateTestUser('rohit.jain@programmers.io', 'Z6mVqEraVK74EnFo', 'Rohit', 'Jain');
    createOrUpdateTestUser('anand.sharma@programmers.io', 'Z0lxl9OgJAGyFH6-', 'Anand', 'Sharma');
    createOrUpdateTestUser('rohit.jain@programmers.ai', 'Z6mVqEraVK74EnFo', 'Rohit', 'Jain');
    createOrUpdateTestUser('anand.sharma@programmers.ai', 'Z0lxl9OgJAGyFH6-', 'Anand', 'Sharma');
    
    DB::commit();
    
    echo "\n╔════════════════════════════════════════════════╗\n";
    echo "║  ✓ All test users created successfully!      ║\n";
    echo "╚════════════════════════════════════════════════╝\n";
    echo "\nTest Users Created:\n";
    echo "1. rohit.jain@programmers.io (TD ID: Z6mVqEraVK74EnFo)\n";
    echo "2. anand.sharma@programmers.io (TD ID: Z0lxl9OgJAGyFH6-)\n";
    echo "3. rohit.jain@programmers.ai (TD ID: Z6mVqEraVK74EnFo)\n";
    echo "4. anand.sharma@programmers.ai (TD ID: Z0lxl9OgJAGyFH6-)\n";
    echo "\nPassword for all users: password\n";
    echo "Department: Engineering\n";
    echo "Designation: Software Engineer\n";
    echo "Attendance Mode: Automatic (Time Doctor)\n";
    
} catch (\Exception $e) {
    DB::rollBack();
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
