<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Create a test request
$request = Illuminate\Http\Request::create(
    '/api/attendance/get-attendance-config-list',
    'POST',
    [
        'sortColumnName' => '',
        'sortDirection' => 'asc',
        'startIndex' => 0,
        'pageSize' => 10,
        'filters' => []
    ]
);

// Mock authentication
$user = \App\Models\EmployeeData::where('employee_code', 'EMP0001')->first();
if ($user) {
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
}

try {
    $response = $kernel->handle($request);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Content: " . $response->getContent() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

$kernel->terminate($request, $response);
