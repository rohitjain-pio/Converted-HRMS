<?php

namespace App\Imports;

use App\Models\Employee;
use App\Models\EmploymentDetail;
use App\Models\Address;
use App\Models\PermanentAddress;
use App\Models\BankDetail;
use App\Models\Department;
use App\Models\Designation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Carbon\Carbon;

class EmployeesImport implements ToCollection, WithHeadingRow
{
    protected $validRecords = [];
    protected $duplicateRecords = [];
    protected $invalidRecords = [];
    protected $importConfirmed = false;
    protected $createdBy;

    public function __construct($importConfirmed = false, $createdBy = null)
    {
        $this->importConfirmed = $importConfirmed;
        $this->createdBy = $createdBy ?? 'system';
    }

    public function collection(Collection $rows)
    {
        // Get existing employee codes and emails
        $existingCodes = DB::table('employee_data')
            ->whereNull('deleted_at')
            ->pluck('employee_code')
            ->toArray();

        $existingEmails = DB::table('employment_details')
            ->whereNull('deleted_at')
            ->pluck('email')
            ->toArray();

        $rowNumber = 2; // Start from 2 because row 1 is headers

        foreach ($rows as $row) {
            $rowNumber++;

            // Skip empty rows
            if (empty($row['code']) && empty($row['email'])) {
                continue;
            }

            // Validate required fields
            if (empty($row['code'])) {
                $this->invalidRecords[] = ['row' => $rowNumber, 'reason' => 'Missing Employee Code'];
                continue;
            }

            if (empty($row['email'])) {
                $this->invalidRecords[] = ['row' => $rowNumber, 'reason' => 'Missing Email'];
                continue;
            }

            if (empty($row['personal_email'])) {
                $this->invalidRecords[] = ['row' => $rowNumber, 'reason' => 'Missing Personal Email'];
                continue;
            }

            if (empty($row['mobile_no'])) {
                $this->invalidRecords[] = ['row' => $rowNumber, 'reason' => 'Missing Mobile No'];
                continue;
            }

            if (empty($row['current_address'])) {
                $this->invalidRecords[] = ['row' => $rowNumber, 'reason' => 'Missing Current Address'];
                continue;
            }

            if (empty($row['permanent_address'])) {
                $this->invalidRecords[] = ['row' => $rowNumber, 'reason' => 'Missing Permanent Address'];
                continue;
            }

            // Check for duplicates
            if (in_array($row['code'], $existingCodes) || in_array(strtolower($row['email']), array_map('strtolower', $existingEmails))) {
                $this->duplicateRecords[] = ['email' => $row['email'], 'code' => $row['code']];
                continue;
            }

            // Add to existing arrays to check duplicates within the file
            $existingCodes[] = $row['code'];
            $existingEmails[] = $row['email'];

            // Parse and prepare data
            $this->validRecords[] = $this->parseRow($row);
        }

        // If not confirmed, don't import - just return validation results
        if (!$this->importConfirmed) {
            return;
        }

        // Import valid records
        if (!empty($this->validRecords)) {
            $this->importRecords();
        }
    }

    protected function parseRow($row)
    {
        // Parse gender
        $gender = null;
        if (isset($row['gender'])) {
            $genderLower = strtolower(trim($row['gender']));
            if ($genderLower === 'male') $gender = 1;
            elseif ($genderLower === 'female') $gender = 2;
        }

        // Parse marital status
        $maritalStatus = null;
        if (isset($row['marital_status'])) {
            $maritalStatusLower = strtolower(trim($row['marital_status']));
            if ($maritalStatusLower === 'single') $maritalStatus = 1;
            elseif ($maritalStatusLower === 'married') $maritalStatus = 2;
        }

        // Parse branch
        $branchId = null;
        if (isset($row['branch'])) {
            $branchLower = strtolower(trim($row['branch']));
            if ($branchLower === 'hyderabad') $branchId = 1;
            elseif ($branchLower === 'jaipur') $branchId = 2;
            elseif ($branchLower === 'pune') $branchId = 3;
        }

        // Get department ID
        $departmentId = null;
        if (!empty($row['department'])) {
            $department = Department::where('department', 'LIKE', $row['department'])->first();
            $departmentId = $department ? $department->id : null;
        }

        // Get designation ID
        $designationId = null;
        if (!empty($row['designation'])) {
            $designation = Designation::where('designation', 'LIKE', $row['designation'])->first();
            $designationId = $designation ? $designation->id : null;
        }

        // Get reporting manager ID
        $reportingManagerId = null;
        if (!empty($row['reporting_manager'])) {
            $manager = DB::table('employee_data')
                ->where(DB::raw("CONCAT(first_name, ' ', IFNULL(last_name, ''))"), 'LIKE', '%' . $row['reporting_manager'] . '%')
                ->first();
            $reportingManagerId = $manager ? $manager->id : null;
        }

        return [
            'employee_data' => [
                'employee_code' => $row['code'],
                'first_name' => $this->extractFirstName($row['employee_name'] ?? ''),
                'middle_name' => $this->extractMiddleName($row['employee_name'] ?? ''),
                'last_name' => $this->extractLastName($row['employee_name'] ?? ''),
                'father_name' => $row['fathers_name'] ?? null,
                'gender' => $gender,
                'date_of_birth' => $this->parseDate($row['dob'] ?? null),
                'blood_group' => $row['blood_group'] ?? null,
                'marital_status' => $maritalStatus,
                'aadhar_number' => $row['aadhar_number'] ?? null,
                'pan_number' => $row['pan'] ?? null,
                'passport_number' => $row['passport_no'] ?? null,
                'passport_expiry_date' => $this->parseDate($row['passport_expiry'] ?? null),
                'phone_number' => $row['mobile_no'] ?? null,
                'alternate_phone_number' => $row['telephone'] ?? null,
                'emergency_contact_number' => $row['emergency_no'] ?? null,
                'personal_email' => $row['personal_email'] ?? null,
                'created_by' => $this->createdBy,
                'status' => 1, // Active
            ],
            'employment_detail' => [
                'email' => $row['email'],
                'joining_date' => $this->parseDate($row['doj'] ?? null),
                'confirmation_date' => $this->parseDate($row['confirmation_date'] ?? null),
                'branch_id' => $branchId ?? 1,
                'department_id' => $departmentId,
                'designation_id' => $designationId,
                'reporting_manager_id' => $reportingManagerId,
                'job_type' => $row['job_type'] ?? null,
                'employment_status' => 1, // Active
                'employee_status' => 1, // Active
                'has_pf' => isset($row['has_pf']) && strtolower($row['has_pf']) === 'yes' ? 1 : 0,
                'pf_number' => $row['pf_no'] ?? null,
                'pf_joining_date' => $this->parseDate($row['pf_date'] ?? null),
                'uan_number' => $row['uan_number'] ?? null,
                'has_esi' => isset($row['has_esi']) && strtolower($row['has_esi']) === 'yes' ? 1 : 0,
                'esi_number' => $row['esi_no'] ?? null,
                'created_by' => $this->createdBy,
            ],
            'address' => [
                'address_line1' => $row['current_address'] ?? null,
                'city' => $row['city'] ?? null,
                'state' => $row['state'] ?? null,
                'postal_code' => $row['pin'] ?? null,
                'country' => $row['country'] ?? 'India',
                'created_by' => $this->createdBy,
            ],
            'permanent_address' => [
                'address_line1' => $row['permanent_address'] ?? null,
                'city' => $row['city'] ?? null,
                'state' => $row['state'] ?? null,
                'postal_code' => $row['pin'] ?? null,
                'country' => $row['country'] ?? 'India',
                'created_by' => $this->createdBy,
            ],
            'bank_detail' => [
                'bank_name' => $row['bank_name'] ?? null,
                'account_no' => $row['bank_account_no'] ?? null,
                'ifsc_code' => $row['ifsc'] ?? null,
                'branch_name' => null,
                'created_by' => $this->createdBy,
            ],
        ];
    }

    protected function importRecords()
    {
        DB::beginTransaction();
        try {
            foreach ($this->validRecords as $record) {
                // Create employee
                $employee = Employee::create($record['employee_data']);

                // Create employment detail
                $employmentData = $record['employment_detail'];
                $employmentData['employee_id'] = $employee->id;
                EmploymentDetail::create($employmentData);

                // Create address
                $addressData = $record['address'];
                $addressData['employee_id'] = $employee->id;
                Address::create($addressData);

                // Create permanent address
                $permanentAddressData = $record['permanent_address'];
                $permanentAddressData['employee_id'] = $employee->id;
                PermanentAddress::create($permanentAddressData);

                // Create bank detail
                if (!empty($record['bank_detail']['bank_name'])) {
                    $bankData = $record['bank_detail'];
                    $bankData['employee_id'] = $employee->id;
                    BankDetail::create($bankData);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Employee import failed: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function parseDate($dateString)
    {
        if (empty($dateString)) {
            return null;
        }

        try {
            // Try different date formats
            $formats = ['Y-m-d', 'd-m-Y', 'm/d/Y', 'd/m/Y', 'Y/m/d'];
            
            foreach ($formats as $format) {
                $date = Carbon::createFromFormat($format, $dateString);
                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            }

            // Try Carbon's parse method as fallback
            return Carbon::parse($dateString)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function extractFirstName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        return $parts[0] ?? '';
    }

    protected function extractMiddleName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        if (count($parts) > 2) {
            return implode(' ', array_slice($parts, 1, -1));
        }
        return null;
    }

    protected function extractLastName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        return count($parts) > 1 ? end($parts) : '';
    }

    public function getValidationResults()
    {
        return [
            'validRecordsCount' => count($this->validRecords),
            'duplicateCount' => count($this->duplicateRecords),
            'duplicateRecords' => $this->duplicateRecords,
            'invalidCount' => count($this->invalidRecords),
            'invalidRecords' => $this->invalidRecords,
        ];
    }

    public function getImportedCount()
    {
        return count($this->validRecords);
    }
}
