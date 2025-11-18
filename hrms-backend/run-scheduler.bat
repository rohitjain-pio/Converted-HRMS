@echo off
REM Laravel Scheduler Runner for Windows
REM This should be run by Windows Task Scheduler every minute

cd /d C:\wamp64\www\Working_Migration\Converted-HRMS\Converted-HRMS\hrms-backend
php artisan schedule:run >> storage\logs\scheduler.log 2>&1
