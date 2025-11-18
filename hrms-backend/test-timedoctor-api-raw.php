<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

echo "╔════════════════════════════════════════════════╗\n";
echo "║  Testing Time Doctor API Raw Response        ║\n";
echo "╚════════════════════════════════════════════════╝\n\n";

$apiToken = config('services.timedoctor.api_token');
$companyId = config('services.timedoctor.company_id');
$url = config('services.timedoctor.summary_stats_url');

$date = Carbon::parse('2025-11-18');
$startOfDay = $date->copy()->startOfDay();
$endOfDay = $date->copy()->endOfDay();

$params = [
    'company' => $companyId,
    'from' => $startOfDay->format('Y-m-d\TH:i:s'),
    'to' => $endOfDay->format('Y-m-d\TH:i:s'),
    'user' => 'all',
    'fields' => 'start,end,userId,total',
    'group-by' => 'userId',
    'period' => 'days',
    'sort' => 'date',
    'limit' => '2000'
];

echo "Request URL: {$url}\n";
echo "Request Params:\n";
print_r($params);
echo "\n";

$response = Http::withHeaders([
    'Authorization' => 'JWT ' . $apiToken,
])
->withoutVerifying()
->get($url, $params);

if (!$response->successful()) {
    echo "❌ API request failed!\n";
    echo "Status: {$response->status()}\n";
    echo "Body: {$response->body()}\n";
    exit(1);
}

$data = $response->json();

echo "=== Raw API Response ===\n";
echo "Total users returned: " . count($data['data'] ?? []) . "\n\n";

// Find our test user (anand.sharma@programmers.io - Z0lxl9OgJAGyFH6-)
$testUserId = 'Z0lxl9OgJAGyFH6-';

foreach ($data['data'] as $dayStats) {
    foreach ($dayStats as $userStat) {
        if ($userStat['userId'] === $testUserId) {
            echo "Found test user: {$testUserId}\n\n";
            echo "Raw JSON from Time Doctor API:\n";
            echo json_encode($userStat, JSON_PRETTY_PRINT) . "\n\n";
            
            echo "=== Analyzing Times ===\n";
            echo "Start field: {$userStat['start']}\n";
            echo "End field: {$userStat['end']}\n";
            echo "Total seconds: {$userStat['total']}\n\n";
            
            // Parse times
            $start = Carbon::parse($userStat['start']);
            $end = Carbon::parse($userStat['end']);
            
            echo "Parsed Start DateTime:\n";
            echo "  Original: {$start->toIso8601String()}\n";
            echo "  Time only: {$start->format('H:i:s')}\n";
            echo "  Timezone: {$start->timezoneName}\n\n";
            
            echo "Parsed End DateTime:\n";
            echo "  Original: {$end->toIso8601String()}\n";
            echo "  Time only: {$end->format('H:i:s')}\n";
            echo "  Timezone: {$end->timezoneName}\n\n";
            
            echo "=== What Should Be Stored ===\n";
            echo "According to legacy .NET code:\n";
            echo "  stat.Start.TimeOfDay → stores as-is (UTC)\n";
            echo "  stat.End.TimeOfDay → stores as-is (UTC)\n";
            echo "  Database should have: {$start->format('H:i:s')} - {$end->format('H:i:s')}\n\n";
            
            break 2;
        }
    }
}

echo "\n╔════════════════════════════════════════════════╗\n";
echo "║  Analysis Complete!                           ║\n";
echo "╚════════════════════════════════════════════════╝\n";
