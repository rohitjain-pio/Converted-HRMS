<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class EmployeeExitController extends Controller
{
    /**
     * Get exit management data for employees
     */
    public function index(Request $request): JsonResponse
    {
        // Dummy data for demonstration
        $data = [
            [
                'employee_id' => 1,
                'name' => 'John Doe',
                'exit_status' => 'Pending',
                'exit_date' => '2025-12-01',
            ],
            [
                'employee_id' => 2,
                'name' => 'Jane Smith',
                'exit_status' => 'Completed',
                'exit_date' => '2025-10-15',
            ],
        ];

        return response()->json([
            'status_code' => 200,
            'message' => 'Employee exit data fetched successfully',
            'data' => $data,
            'is_success' => true,
        ]);
    }
}
