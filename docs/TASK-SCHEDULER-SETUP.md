# Windows Task Scheduler Setup Instructions

## Automated Setup (Requires Administrator)

Run PowerShell as Administrator and execute:
```powershell
cd C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\setup-task-scheduler.ps1
```

## Manual Setup (Alternative)

If you prefer to set up manually or the automated script doesn't work:

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type `taskschd.msc` and press Enter

2. **Create New Task**
   - Click "Create Task..." (not "Create Basic Task")
   - Name: `HRMS_Laravel_Scheduler`
   - Description: `Runs Laravel scheduler every minute for HRMS application`
   - Select "Run whether user is logged on or not"
   - Check "Run with highest privileges"

3. **Configure Trigger**
   - Go to "Triggers" tab
   - Click "New..."
   - Begin the task: "On a schedule"
   - Settings: "Daily"
   - Start: Today at current time
   - Recur every: 1 day
   - Check "Repeat task every: 1 minute"
   - For a duration of: "Indefinitely"
   - Check "Enabled"
   - Click OK

4. **Configure Action**
   - Go to "Actions" tab
   - Click "New..."
   - Action: "Start a program"
   - Program/script: `C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend\run-scheduler.bat`
   - Start in: `C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend`
   - Click OK

5. **Configure Settings**
   - Go to "Settings" tab
   - Check "Allow task to be run on demand"
   - Check "Run task as soon as possible after a scheduled start is missed"
   - Check "If the task fails, restart every: 1 minute"
   - Uncheck "Stop the task if it runs longer than"
   - Click OK

6. **Test the Task**
   - Right-click the task and select "Run"
   - Check the "Last Run Result" column - should show "0x0" (success)

## Verification

### Check if Task is Running
```powershell
Get-ScheduledTask -TaskName "HRMS_Laravel_Scheduler" | Select-Object TaskName, State, LastRunTime, NextRunTime
```

### Monitor Scheduler Logs
```powershell
cd C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend
Get-Content storage\logs\scheduler.log -Wait
```

### Monitor Time Doctor Sync
```powershell
Get-Content storage\logs\laravel.log -Wait | Select-String "Time Doctor"
```

### View Task History
1. Open Task Scheduler (taskschd.msc)
2. Navigate to Task Scheduler Library
3. Find "HRMS_Laravel_Scheduler"
4. Click on the "History" tab at the bottom

## Current Schedule Configuration

- **Testing Mode (Current)**: Time Doctor sync runs every 5 minutes
- **Production Mode**: Time Doctor sync runs daily at 5:00 AM

To switch to production mode, edit `routes/console.php`:
```php
// Comment out testing line:
// Schedule::command('attendance:fetch-timedoctor')->everyFiveMinutes();

// Uncomment production line:
Schedule::command('attendance:fetch-timedoctor')->dailyAt('05:00');
```

## Troubleshooting

### Task doesn't run
- Check Windows Task Scheduler History tab for error messages
- Ensure the batch file path is correct
- Verify PHP is in system PATH
- Check permissions on the hrms-backend directory

### Time Doctor sync not happening
- Check `storage/logs/laravel.log` for errors
- Verify Time Doctor API credentials in `.env`
- Test manually: `php artisan attendance:fetch-timedoctor`
- Ensure MySQL timezone is set to UTC in `config/database.php`

### Scheduler log shows "No scheduled commands are ready to run"
- This is normal when no commands are due to run at that moment
- With 5-minute testing mode, you'll see Time Doctor sync every 5 minutes
- Check the time - commands run based on schedule definition

## Performance Notes

- Laravel's `schedule:run` is lightweight and runs quickly
- Task Scheduler overhead is minimal (< 1 second per minute)
- Time Doctor sync only runs when scheduled (5 min or daily)
- Logs are automatically rotated by Laravel
