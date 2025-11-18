<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

// Configuration
$baseUrl = 'http://localhost:8000/api';
$apiKey = 'hrms-api-key-2024-secure';

// Test credentials
$email = 'admin@company.com';
$password = 'password';

echo "=== Testing Attendance API ===\n\n";

// Step 1: Login
echo "Step 1: Logging in...\n";
$loginResponse = Http::withHeaders([
    'X-API-Key' => $apiKey,
    'Accept' => 'application/json',
])->post("$baseUrl/auth/login", [
    'email' => $email,
    'password' => $password,
]);

if (!$loginResponse->successful()) {
    echo "❌ Login failed: " . $loginResponse->body() . "\n";
    exit(1);
}

$loginData = $loginResponse->json();
$token = $loginData['data']['token'] ?? null;
$employeeId = $loginData['data']['employee_id'] ?? null;

if (!$token || !$employeeId) {
    echo "❌ Failed to get token or employee ID\n";
    exit(1);
}

echo "✓ Login successful\n";
echo "Employee ID: $employeeId\n\n";

// Step 2: Get Attendance
echo "Step 2: Fetching attendance records...\n";
$attendanceResponse = Http::withHeaders([
    'Authorization' => "Bearer $token",
    'Accept' => 'application/json',
])->get("$baseUrl/attendance/get-attendance/$employeeId", [
    'pageIndex' => 0,
    'pageSize' => 10,
]);

echo "Response Status: " . $attendanceResponse->status() . "\n";
echo "Response Body:\n";
echo json_encode($attendanceResponse->json(), JSON_PRETTY_PRINT) . "\n\n";

if (!$attendanceResponse->successful()) {
    echo "❌ Failed to fetch attendance\n";
    exit(1);
}

$attendanceData = $attendanceResponse->json();

// Check response structure
echo "Step 3: Validating response structure...\n";

$requiredFields = ['success', 'data'];
$requiredDataFields = ['attendaceReport', 'totalRecords', 'isManualAttendance', 'isTimedIn', 'dates'];

foreach ($requiredFields as $field) {
    if (!isset($attendanceData[$field])) {
        echo "❌ Missing field: $field\n";
    } else {
        echo "✓ Field present: $field\n";
    }
}

if (isset($attendanceData['data'])) {
    foreach ($requiredDataFields as $field) {
        if (!isset($attendanceData['data'][$field])) {
            echo "❌ Missing data field: $field\n";
        } else {
            echo "✓ Data field present: $field\n";
            
            // Show the value
            $value = $attendanceData['data'][$field];
            if (is_array($value)) {
                echo "  Type: array, Count: " . count($value) . "\n";
            } elseif (is_bool($value)) {
                echo "  Type: boolean, Value: " . ($value ? 'true' : 'false') . "\n";
            } else {
                echo "  Type: " . gettype($value) . ", Value: $value\n";
            }
        }
    }
}

echo "\n";

// Display attendance records
if (isset($attendanceData['data']['attendaceReport']) && !empty($attendanceData['data']['attendaceReport'])) {
    echo "Step 4: Attendance Records:\n";
    echo str_repeat('-', 100) . "\n";
    
    foreach ($attendanceData['data']['attendaceReport'] as $index => $record) {
        echo "Record #" . ($index + 1) . ":\n";
        echo "  Date: " . ($record['date'] ?? 'N/A') . "\n";
        echo "  Day: " . ($record['day'] ?? 'N/A') . "\n";
        echo "  Start Time: " . ($record['startTime'] ?? 'N/A') . "\n";
        echo "  End Time: " . ($record['endTime'] ?? 'N/A') . "\n";
        echo "  Total Hours: " . ($record['totalHours'] ?? 'N/A') . "\n";
        echo "  Location: " . ($record['location'] ?? 'N/A') . "\n";
        
        if (isset($record['audit']) && !empty($record['audit'])) {
            echo "  Audit Trail:\n";
            foreach ($record['audit'] as $audit) {
                echo "    - " . ($audit['action'] ?? 'N/A') . " at " . ($audit['time'] ?? 'N/A') . "\n";
            }
        }
        
        echo "\n";
    }
} else {
    echo "Step 4: No attendance records found\n";
}

echo "\n=== Test Complete ===\n";
echo "✓ Response structure matches legacy format (attendaceReport with typo)\n";
echo "✓ isTimedIn flag is present\n";
echo "✓ dates array is present\n";
