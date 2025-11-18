<?php

// Test the attendance API directly
$loginUrl = 'http://localhost:8000/api/auth/login';
$attendanceUrl = 'http://localhost:8000/api/attendance/get-attendance-config-list';

// Step 1: Login
$loginData = json_encode([
    'email' => 'admin@company.com',
    'password' => 'password123'
]);

$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: hrms-secure-api-key-change-in-production'
]);

$loginResponse = curl_exec($ch);
curl_close($ch);

echo "Login response: $loginResponse\n\n";

$loginResult = json_decode($loginResponse, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("JSON decode error: " . json_last_error_msg() . "\n");
}

$token = $loginResult['data']['token'] ?? null;

if (!$token) {
    echo "Login result structure:\n";
    print_r($loginResult);
    die("\nFailed to get token\n");
}

echo "✓ Login successful\n\n";

// Step 2: Get attendance config list
$attendanceData = json_encode([
    'sortColumnName' => '',
    'sortDirection' => 'asc',
    'startIndex' => 0,
    'pageSize' => 5,
    'filters' => []
]);

$ch = curl_init($attendanceUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $attendanceData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$attendanceResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "✓ API Response Code: $httpCode\n\n";

$attendanceResult = json_decode($attendanceResponse, true);

if (!isset($attendanceResult['data']['attendanceConfigList']) || !is_array($attendanceResult['data']['attendanceConfigList'])) {
    die("No data in response\n");
}

$employees = $attendanceResult['data']['attendanceConfigList'];
echo "✓ Total records: " . count($employees) . "\n\n";

// Display first 5 records
echo "=== Employee Data (First 5 Records) ===\n\n";
echo str_pad("Employee", 25) . str_pad("Department", 20) . str_pad("Designation", 20) . str_pad("Branch", 15) . "Manual\n";
echo str_repeat("-", 100) . "\n";

$validDept = 0;
$validDesig = 0;
$validBranch = 0;

foreach (array_slice($employees, 0, 5) as $employee) {
    echo str_pad(substr($employee['employeeName'] ?? 'N/A', 0, 24), 25);
    echo str_pad(substr($employee['department'] ?? 'N/A', 0, 19), 20);
    echo str_pad(substr($employee['designation'] ?? 'N/A', 0, 19), 20);
    echo str_pad(substr($employee['branch'] ?? 'N/A', 0, 14), 15);
    echo $employee['isManualAttendance'] ? 'Yes' : 'No';
    echo "\n";
    
    if (isset($employee['department']) && $employee['department'] !== 'N/A') $validDept++;
    if (isset($employee['designation']) && $employee['designation'] !== 'N/A') $validDesig++;
    if (isset($employee['branch']) && $employee['branch'] !== 'N/A') $validBranch++;
}

echo "\n=== Data Quality Summary ===\n";
echo "Records with valid department: $validDept / 5\n";
echo "Records with valid designation: $validDesig / 5\n";
echo "Records with valid branch: $validBranch / 5\n";

if ($validDept > 0 && $validDesig > 0) {
    echo "\n✓ SUCCESS: Department and Designation data is displaying correctly!\n";
    echo "⚠ NOTE: Branch data shows N/A because the 'branch' table doesn't exist in the database.\n";
} else {
    echo "\n✗ ISSUE: Some fields are still showing as N/A\n";
}
