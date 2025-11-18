<?php

// Test Employee Report API

$baseUrl = 'http://localhost:8000/api';

// Step 1: Login
$loginData = [
    'email' => 'admin@programmers.io',
    'password' => 'password123'
];

$ch = curl_init($baseUrl . '/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: hrms-secure-api-key-change-in-production'
]);

$loginResponse = curl_exec($ch);
$loginData = json_decode($loginResponse, true);

if (!isset($loginData['data']['token'])) {
    die("Login failed: " . $loginResponse . "\n");
}

$token = $loginData['data']['token'];
echo "✓ Login successful\n";
echo "  Employee ID: {$loginData['data']['employee_id']}\n\n";

// Step 2: Get Employee Report
$reportParams = [
    'pageIndex' => 0,
    'pageSize' => 10,
    'filters' => [
        'dateFrom' => '2024-10-19',
        'dateTo' => '2024-11-18'
    ]
];

$ch = curl_init($baseUrl . '/attendance/get-employee-report');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($reportParams));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$reportResponse = curl_exec($ch);
$reportData = json_decode($reportResponse, true);

if (!isset($reportData['success']) || !$reportData['success']) {
    die("Employee report request failed: " . $reportResponse . "\n");
}

echo "✓ Employee Report API Response:\n";
echo "  Success: " . ($reportData['success'] ? 'true' : 'false') . "\n";
echo "  Total Records: {$reportData['data']['totalRecords']}\n";
echo "  Reports Returned: " . count($reportData['data']['employeeReports']) . "\n\n";

if (count($reportData['data']['employeeReports']) > 0) {
    echo "✓ First Employee Report:\n";
    $firstEmployee = $reportData['data']['employeeReports'][0];
    
    echo "  Employee Code: {$firstEmployee['employeeCode']}\n";
    echo "  Employee Name: {$firstEmployee['employeeName']}\n";
    echo "  Department: {$firstEmployee['department']}\n";
    echo "  Branch: {$firstEmployee['branch']}\n";
    echo "  Total Hours: {$firstEmployee['totalHour']}\n";
    echo "  Dates with Attendance: " . count($firstEmployee['workedHoursByDate']) . "\n";
    
    if (count($firstEmployee['workedHoursByDate']) > 0) {
        echo "\n  Sample Attendance Days:\n";
        $count = 0;
        foreach ($firstEmployee['workedHoursByDate'] as $date => $hours) {
            echo "    - $date: $hours\n";
            $count++;
            if ($count >= 5) break; // Show only first 5 days
        }
    }
}

curl_close($ch);
echo "\n✓ Test completed successfully!\n";
