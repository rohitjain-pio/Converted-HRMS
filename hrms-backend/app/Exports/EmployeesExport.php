<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeesExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $employees;

    public function __construct($employees)
    {
        $this->employees = $employees;
    }

    public function collection()
    {
        return collect($this->employees);
    }

    public function headings(): array
    {
        return [
            'Sl No',
            'Code',
            'Employee Name',
            'Father\'s Name',
            'Gender',
            'DOB',
            'Email',
            'Current Address',
            'Permanent Address',
            'City',
            'State',
            'Pin',
            'Country',
            'Emergency No',
            'DOJ',
            'Confirmation Date',
            'Job Type',
            'Branch',
            'PF No',
            'PF Date',
            'Bank Name',
            'Bank Account No',
            'PAN',
            'ESI No',
            'Department',
            'Designation',
            'Reporting Manager',
            'Passport No',
            'Passport Expiry',
            'Telephone',
            'Mobile No',
            'Personal Email',
            'Blood Group',
            'Marital Status',
            'UAN Number',
            'Has PF',
            'Has ESI',
            'Aadhar Number',
            'Employee Status',
        ];
    }

    private $serialNumber = 1;

    public function map($employee): array
    {
        // Get address data
        $address = is_array($employee) ? ($employee['current_address'] ?? null) : ($employee->currentAddress ?? null);
        $permanentAddress = is_array($employee) ? ($employee['permanent_address'] ?? null) : ($employee->permanentAddress ?? null);
        $employmentDetail = is_array($employee) ? ($employee['employment_detail'] ?? null) : ($employee->employmentDetail ?? null);
        $bankDetail = is_array($employee) ? ($employee['active_bank_details'] ?? null) : ($employee->activeBankDetails ?? null);
        
        // Branch mapping
        $branchMap = [
            1 => 'Hyderabad',
            2 => 'Jaipur',
            3 => 'Pune',
        ];

        $branchId = is_array($employmentDetail) 
            ? ($employmentDetail['branch_id'] ?? null)
            : ($employmentDetail->branch_id ?? null);

        $branch = $branchMap[$branchId] ?? '';

        // Gender mapping
        $genderValue = is_array($employee) ? ($employee['gender'] ?? null) : ($employee->gender ?? null);
        $gender = $genderValue == 1 ? 'Male' : ($genderValue == 2 ? 'Female' : '');

        // Marital status mapping
        $maritalStatusValue = is_array($employee) ? ($employee['marital_status'] ?? null) : ($employee->marital_status ?? null);
        $maritalStatus = $maritalStatusValue == 1 ? 'Single' : ($maritalStatusValue == 2 ? 'Married' : '');

        // Employment status mapping
        $employmentStatusValue = is_array($employmentDetail)
            ? ($employmentDetail['employment_status'] ?? null)
            : ($employmentDetail->employment_status ?? null);
        
        $statusMap = [
            1 => 'Active',
            2 => 'Inactive',
            3 => 'Terminated',
            4 => 'Resigned',
        ];
        $status = $statusMap[$employmentStatusValue] ?? '';

        // Get values safely
        $getValue = function($obj, $key) {
            if (is_array($obj)) {
                return $obj[$key] ?? null;
            }
            return $obj->{$key} ?? null;
        };

        return [
            $this->serialNumber++,
            $getValue($employee, 'employee_code'),
            trim(
                ($getValue($employee, 'first_name') ?? '') . ' ' . 
                ($getValue($employee, 'middle_name') ?? '') . ' ' . 
                ($getValue($employee, 'last_name') ?? '')
            ),
            $getValue($employee, 'father_name'),
            $gender,
            $getValue($employee, 'date_of_birth') ? date('Y-m-d', strtotime($getValue($employee, 'date_of_birth'))) : '',
            $employmentDetail ? $getValue($employmentDetail, 'email') : $getValue($employee, 'email'),
            $getValue($address, 'address_line1'),
            $getValue($permanentAddress, 'address_line1'),
            $getValue($address, 'city'),
            $getValue($address, 'state'),
            $getValue($address, 'postal_code'),
            $getValue($address, 'country') ?? 'India',
            $getValue($employee, 'emergency_contact_number'),
            $getValue($employmentDetail, 'joining_date') ? date('Y-m-d', strtotime($getValue($employmentDetail, 'joining_date'))) : '',
            $getValue($employmentDetail, 'confirmation_date') ? date('Y-m-d', strtotime($getValue($employmentDetail, 'confirmation_date'))) : '',
            $getValue($employmentDetail, 'job_type'),
            $branch,
            $getValue($employmentDetail, 'pf_number'),
            $getValue($employmentDetail, 'pf_joining_date') ? date('Y-m-d', strtotime($getValue($employmentDetail, 'pf_joining_date'))) : '',
            $getValue($bankDetail, 'bank_name'),
            $getValue($bankDetail, 'account_no'),
            $getValue($employee, 'pan_number'),
            $getValue($employmentDetail, 'esi_number'),
            $getValue($employmentDetail, 'department') ? $getValue($getValue($employmentDetail, 'department'), 'department') : '',
            $getValue($employmentDetail, 'designation') ? $getValue($getValue($employmentDetail, 'designation'), 'designation') : '',
            $getValue($employmentDetail, 'reporting_manager') ? $getValue($getValue($employmentDetail, 'reporting_manager'), 'first_name') : '',
            $getValue($employee, 'passport_number'),
            $getValue($employee, 'passport_expiry_date') ? date('Y-m-d', strtotime($getValue($employee, 'passport_expiry_date'))) : '',
            $getValue($employee, 'alternate_phone_number'),
            $getValue($employee, 'phone_number'),
            $getValue($employee, 'personal_email'),
            $getValue($employee, 'blood_group'),
            $maritalStatus,
            $getValue($employmentDetail, 'uan_number'),
            $getValue($employmentDetail, 'has_pf') ? 'Yes' : 'No',
            $getValue($employmentDetail, 'has_esi') ? 'Yes' : 'No',
            $getValue($employee, 'aadhar_number'),
            $status,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
