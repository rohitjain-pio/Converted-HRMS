# PowerShell script to set up Windows Task Scheduler for Laravel Scheduler
# Run this script as Administrator

$taskName = "HRMS_Laravel_Scheduler"
$scriptPath = "C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend\run-scheduler.bat"
$workingDir = "C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend"

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Setting up Windows Task Scheduler            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if batch file exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Batch file not found at: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found batch file: $scriptPath" -ForegroundColor Green
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "⚠ Task '$taskName' already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to delete and recreate it? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "✓ Deleted existing task" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled. Task not modified." -ForegroundColor Red
        exit 0
    }
}

Write-Host "Creating scheduled task..." -ForegroundColor Cyan
Write-Host ""

# Create action - run the batch file
$action = New-ScheduledTaskAction -Execute $scriptPath -WorkingDirectory $workingDir

# Create trigger - run every minute, indefinitely
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration ([TimeSpan]::MaxValue)

# Create principal - run with highest privileges
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

# Register the task
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Description "Runs Laravel scheduler every minute for HRMS application (Time Doctor sync, etc.)"
    
    Write-Host "✓ Task created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Start the task immediately
    Start-ScheduledTask -TaskName $taskName
    Write-Host "✓ Task started!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "  Name: $taskName" -ForegroundColor White
    Write-Host "  Runs: Every 1 minute" -ForegroundColor White
    Write-Host "  Script: $scriptPath" -ForegroundColor White
    Write-Host "  Status: Running" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "✓ Setup Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The Laravel scheduler will now run every minute." -ForegroundColor White
    Write-Host "Time Doctor sync will execute based on the schedule in routes/console.php" -ForegroundColor White
    Write-Host "  - Currently: Every 5 minutes (testing)" -ForegroundColor Yellow
    Write-Host "  - Production: Daily at 5:00 AM" -ForegroundColor White
    Write-Host ""
    Write-Host "To view task history, open Task Scheduler (taskschd.msc) and check:" -ForegroundColor Cyan
    Write-Host "  Task Scheduler Library > $taskName" -ForegroundColor White
    Write-Host ""
    Write-Host "To monitor logs:" -ForegroundColor Cyan
    Write-Host "  Get-Content $workingDir\storage\logs\laravel.log -Wait | Select-String 'Time Doctor'" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to create task: $_" -ForegroundColor Red
    exit 1
}
