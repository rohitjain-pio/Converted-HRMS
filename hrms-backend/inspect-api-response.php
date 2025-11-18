<?php

$loginUrl = 'http://localhost:8000/api/auth/login';
$attendanceUrl = 'http://localhost:8000/api/attendance/get-attendance-config-list';
$apiKey = 'hrms-secure-api-key-change-in-production';

// Login first
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
    'X-API-Key: ' . $apiKey
]);

$loginResponse = curl_exec($ch);
curl_close($ch);

$loginResult = json_decode($loginResponse, true);

if (!isset($loginResult['data']['token'])) {
    die("Login failed\n");
}

$token = $loginResult['data']['token'];
echo "✓ Login successful\n\n";

// Now call attendance API
$attendanceData = json_encode([
    'sortColumnName' => '',
    'sortDirection' => 'asc',
    'startIndex' => 0,
    'pageSize' => 2,
    'filters' => []
]);

$ch = curl_init($attendanceUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $attendanceData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
    'X-API-Key: ' . $apiKey
]);

$attendanceResponse = curl_exec($ch);
curl_close($ch);

echo "=== RAW API RESPONSE ===\n";
echo $attendanceResponse . "\n\n";

echo "=== PRETTY PRINTED ===\n";
$attendanceResult = json_decode($attendanceResponse, true);
echo json_encode($attendanceResult, JSON_PRETTY_PRINT) . "\n";
