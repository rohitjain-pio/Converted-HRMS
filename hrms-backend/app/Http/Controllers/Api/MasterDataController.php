<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\State;
use App\Models\City;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Team;
use App\Models\Relationship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * MasterDataController - Provides access to all master data
 * 
 * Used by frontend dropdowns and cascading selects
 */
class MasterDataController extends Controller
{
    /**
     * Get all branches (hardcoded to match legacy BranchLocation enum)
     */
    public function getBranches(): JsonResponse
    {
        $branches = [
            ['id' => 1, 'name' => 'Hyderabad'],
            ['id' => 2, 'name' => 'Jaipur'],
            ['id' => 3, 'name' => 'Pune'],
        ];

        return response()->json([
            'success' => true,
            'data' => $branches
        ]);
    }

    /**
     * Get all departments
     */
    public function getDepartments(): JsonResponse
    {
        $departments = Department::active()
            ->orderBy('department')
            ->get(['id', 'department as name']);

        return response()->json([
            'success' => true,
            'data' => $departments
        ]);
    }

    /**
     * Get all designations
     */
    public function getDesignations(): JsonResponse
    {
        $designations = Designation::active()
            ->orderBy('designation')
            ->get(['id', 'designation as name']);

        return response()->json([
            'success' => true,
            'data' => $designations
        ]);
    }

    /**
     * Get designations by department (if departments have designation mapping)
     */
    public function getDesignationsByDepartment(Request $request): JsonResponse
    {
        $departmentId = $request->query('department_id');

        $query = Designation::active()->orderBy('name');

        // If specific implementation exists for department-designation mapping
        // add the filter here. For now, return all designations.
        if ($departmentId) {
            // TODO: Add department-designation mapping if required
            // $query->whereHas('departments', function($q) use ($departmentId) {
            //     $q->where('department_id', $departmentId);
            // });
        }

        $designations = $query->get(['id', 'designation as name']);

        return response()->json([
            'success' => true,
            'data' => $designations
        ]);
    }

    /**
     * Get all teams
     */
    public function getTeams(): JsonResponse
    {
        $teams = Team::active()
            ->orderBy('team_name')
            ->get(['id', 'team_name as name']);

        return response()->json([
            'success' => true,
            'data' => $teams
        ]);
    }

    /**
     * Get teams by department
     */
    public function getTeamsByDepartment(Request $request): JsonResponse
    {
        // Note: Team table doesn't have department_id column yet
        $teams = Team::active()
            ->orderBy('team_name')
            ->get(['id', 'team_name as name']);

        return response()->json([
            'success' => true,
            'data' => $teams
        ]);
    }

    /**
     * Get all countries
     */
    public function getCountries(): JsonResponse
    {
        $countries = Country::active()
            ->orderBy('country_name')
            ->get(['id', 'country_name', 'country_code']);

        return response()->json([
            'success' => true,
            'data' => $countries
        ]);
    }

    /**
     * Get states by country
     */
    public function getStates(Request $request): JsonResponse
    {
        $countryId = $request->query('country_id');

        if (!$countryId) {
            return response()->json([
                'success' => false,
                'message' => 'country_id is required'
            ], 400);
        }

        $states = State::active()
            ->where('country_id', $countryId)
            ->orderBy('state_name')
            ->get(['id', 'state_name', 'state_code', 'country_id']);

        return response()->json([
            'success' => true,
            'data' => $states
        ]);
    }

    /**
     * Get cities by state
     */
    public function getCities(Request $request): JsonResponse
    {
        $stateId = $request->query('state_id');

        if (!$stateId) {
            return response()->json([
                'success' => false,
                'message' => 'state_id is required'
            ], 400);
        }

        $cities = City::active()
            ->where('state_id', $stateId)
            ->orderBy('city_name')
            ->get(['id', 'city_name', 'state_id']);

        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }

    /**
     * Get all relationships (for nominee relationships)
     */
    public function getRelationships(): JsonResponse
    {
        $relationships = Relationship::active()
            ->orderBy('relationship_name')
            ->get(['id', 'relationship_name']);

        return response()->json([
            'success' => true,
            'data' => $relationships
        ]);
    }

    /**
     * Get all blood groups (static data)
     */
    public function getBloodGroups(): JsonResponse
    {
        $bloodGroups = [
            ['id' => 1, 'name' => 'A+'],
            ['id' => 2, 'name' => 'A-'],
            ['id' => 3, 'name' => 'B+'],
            ['id' => 4, 'name' => 'B-'],
            ['id' => 5, 'name' => 'AB+'],
            ['id' => 6, 'name' => 'AB-'],
            ['id' => 7, 'name' => 'O+'],
            ['id' => 8, 'name' => 'O-'],
        ];

        return response()->json([
            'success' => true,
            'data' => $bloodGroups
        ]);
    }

    /**
     * Get all marital statuses (static data)
     */
    public function getMaritalStatuses(): JsonResponse
    {
        $statuses = [
            ['id' => 1, 'name' => 'Single', 'code' => 'SINGLE'],
            ['id' => 2, 'name' => 'Married', 'code' => 'MARRIED'],
            ['id' => 3, 'name' => 'Divorced', 'code' => 'DIVORCED'],
            ['id' => 4, 'name' => 'Widowed', 'code' => 'WIDOWED'],
        ];

        return response()->json([
            'success' => true,
            'data' => $statuses
        ]);
    }

    /**
     * Get all genders (static data)
     */
    public function getGenders(): JsonResponse
    {
        $genders = [
            ['id' => 1, 'name' => 'Male', 'code' => 'M'],
            ['id' => 2, 'name' => 'Female', 'code' => 'F'],
            ['id' => 3, 'name' => 'Other', 'code' => 'O'],
        ];

        return response()->json([
            'success' => true,
            'data' => $genders
        ]);
    }

    /**
     * Get all employment statuses (static data)
     */
    public function getEmploymentStatuses(): JsonResponse
    {
        $statuses = [
            ['id' => 1, 'name' => 'Permanent', 'code' => 'PERMANENT'],
            ['id' => 2, 'name' => 'Contract', 'code' => 'CONTRACT'],
            ['id' => 3, 'name' => 'Probation', 'code' => 'PROBATION'],
            ['id' => 4, 'name' => 'Intern', 'code' => 'INTERN'],
            ['id' => 5, 'name' => 'Consultant', 'code' => 'CONSULTANT'],
        ];

        return response()->json([
            'success' => true,
            'data' => $statuses
        ]);
    }

    /**
     * Get all nominee types (static data)
     */
    public function getNomineeTypes(): JsonResponse
    {
        $types = [
            ['id' => 1, 'name' => 'Insurance', 'code' => 'INSURANCE'],
            ['id' => 2, 'name' => 'PF', 'code' => 'PF'],
            ['id' => 3, 'name' => 'Gratuity', 'code' => 'GRATUITY'],
            ['id' => 4, 'name' => 'All', 'code' => 'ALL'],
        ];

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    /**
     * Get all active employees (for manager/reporting dropdowns)
     */
    public function getEmployees(Request $request): JsonResponse
    {
        dd($request->all());
        $search = $request->query('search');
        $excludeId = $request->query('exclude_id'); // To exclude current employee from manager selection

        $query = \App\Models\EmployeeData::active()
            ->with('employmentDetail:employee_id,designation,department_name')
            ->select('id', 'employee_code', 'first_name', 'middle_name', 'last_name');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $employees = $query->orderBy('first_name')
            ->limit(50)
            ->get()
            ->map(function($emp) {
                return [
                    'id' => $emp->id,
                    'employee_code' => $emp->employee_code,
                    'name' => trim("{$emp->first_name} {$emp->middle_name} {$emp->last_name}"),
                    'designation' => $emp->employmentDetail->designation ?? null,
                    'department' => $emp->employmentDetail->department_name ?? null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    /**
     * Get all master data in one call (for initial app load)
     */
    public function getAllMasterData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'branches' => [
                    ['id' => 1, 'name' => 'Hyderabad'],
                    ['id' => 2, 'name' => 'Jaipur'],
                    ['id' => 3, 'name' => 'Pune'],
                ],
                'departments' => Department::active()->orderBy('department')->get(['id', 'department as name']),
                'designations' => Designation::active()->orderBy('designation')->get(['id', 'designation as name']),
                'teams' => Team::active()->orderBy('team_name')->get(['id', 'team_name as name']),
                'countries' => Country::active()->orderBy('country_name')->get(['id', 'country_name as name', 'country_code as code']),
                // Note: Relationship table may not exist or be populated yet
                // 'relationships' => Relationship::active()->orderBy('relationship')->get(['id', 'relationship as name']),
                'blood_groups' => [
                    ['id' => 1, 'name' => 'A+'], ['id' => 2, 'name' => 'A-'],
                    ['id' => 3, 'name' => 'B+'], ['id' => 4, 'name' => 'B-'],
                    ['id' => 5, 'name' => 'AB+'], ['id' => 6, 'name' => 'AB-'],
                    ['id' => 7, 'name' => 'O+'], ['id' => 8, 'name' => 'O-'],
                ],
                'marital_statuses' => [
                    ['id' => 1, 'name' => 'Single', 'code' => 'SINGLE'],
                    ['id' => 2, 'name' => 'Married', 'code' => 'MARRIED'],
                    ['id' => 3, 'name' => 'Divorced', 'code' => 'DIVORCED'],
                    ['id' => 4, 'name' => 'Widowed', 'code' => 'WIDOWED'],
                ],
                'genders' => [
                    ['id' => 1, 'name' => 'Male', 'code' => 'M'],
                    ['id' => 2, 'name' => 'Female', 'code' => 'F'],
                    ['id' => 3, 'name' => 'Other', 'code' => 'O'],
                ],
                'employment_statuses' => [
                    ['id' => 1, 'name' => 'Permanent', 'code' => 'PERMANENT'],
                    ['id' => 2, 'name' => 'Contract', 'code' => 'CONTRACT'],
                    ['id' => 3, 'name' => 'Probation', 'code' => 'PROBATION'],
                    ['id' => 4, 'name' => 'Intern', 'code' => 'INTERN'],
                    ['id' => 5, 'name' => 'Consultant', 'code' => 'CONSULTANT'],
                ],
                'nominee_types' => [
                    ['id' => 1, 'name' => 'Insurance', 'code' => 'INSURANCE'],
                    ['id' => 2, 'name' => 'PF', 'code' => 'PF'],
                    ['id' => 3, 'name' => 'Gratuity', 'code' => 'GRATUITY'],
                    ['id' => 4, 'name' => 'All', 'code' => 'ALL'],
                ],
            ],
        ]);
    }

    /**
     * Get reporting managers list (Legacy API for backward compatibility)
     * Matches the exact response structure of the .NET backend
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getReportingManagerList(Request $request): JsonResponse
    {
        $name = $request->query('name');

        $query = \App\Models\EmployeeData::active()
            ->select('id', 'first_name as firstName', 'middle_name as middleName', 'last_name as lastName')
            ->with('employmentDetail:employee_id,email');

        if ($name) {
            $query->where(function($q) use ($name) {
                $q->where('first_name', 'like', "%{$name}%")
                  ->orWhere('middle_name', 'like', "%{$name}%")
                  ->orWhere('last_name', 'like', "%{$name}%");
            });
        }

        $employees = $query->orderBy('first_name')
            ->limit(50)
            ->get()
            ->map(function($emp) {
                return [
                    'id' => $emp->id,
                    'email' => $emp->employmentDetail->email ?? '',
                    'firstName' => $emp->firstName ?? '',
                    'middleName' => $emp->middleName ?? '',
                    'lastName' => $emp->lastName ?? '',
                ];
            });

        // Match legacy .NET API response structure exactly
        return response()->json([
            'statusCode' => 200,
            'message' => 'Success',
            'result' => $employees
        ]);
    }
}
