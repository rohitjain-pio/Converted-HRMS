<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AddAzureUser extends Command
{
    protected $signature = 'auth:add-azure-user {email} {--first-name=Azure} {--last-name=User} {--role=1}';
    protected $description = 'Add a user for Azure AD authentication';

    public function handle()
    {
        $email = $this->argument('email');
        $firstName = $this->option('first-name');
        $lastName = $this->option('last-name');
        $roleId = $this->option('role');

        // Check if email already exists
        $existing = DB::table('employment_details')->where('email', $email)->first();
        if ($existing) {
            $this->error("User with email {$email} already exists!");
            return 1;
        }

        // Get next employee ID
        $maxId = DB::table('employee_data')->max('id') ?? 0;
        $newId = $maxId + 1;
        $employeeCode = 'EMP' . str_pad($newId, 3, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            // Insert employee data
            DB::table('employee_data')->insert([
                'id' => $newId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'employee_code' => $employeeCode,
                'personal_email' => $email,
                'phone' => '0000000000',
                'password' => Hash::make('password123'), // Default password
                'status' => 1,
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => Carbon::now(),
            ]);

            // Insert employment details
            DB::table('employment_details')->insert([
                'employee_id' => $newId,
                'email' => $email,
                'designation' => 'System User',
                'department_name' => 'IT',
                'role_id' => $roleId,
                'joining_date' => Carbon::now()->format('Y-m-d'),
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => Carbon::now(),
            ]);

            // Insert user role mapping
            DB::table('user_role_mappings')->insert([
                'role_id' => $roleId,
                'employee_id' => $newId,
                'is_deleted' => false,
                'created_by' => 'System',
                'created_on' => Carbon::now(),
            ]);

            DB::commit();

            $roleName = DB::table('roles')->where('id', $roleId)->value('name');
            $this->info("✓ User added successfully!");
            $this->line("  Email: {$email}");
            $this->line("  Employee Code: {$employeeCode}");
            $this->line("  Role: {$roleName}");
            
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Failed to add user: " . $e->getMessage());
            return 1;
        }
    }
}
