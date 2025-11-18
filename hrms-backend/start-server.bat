@echo off
echo Starting HRMS Backend Server...
cd /d "c:\wamp64\www\Converted-HRMS\hrms-backend"
echo Clearing config cache...
php artisan config:clear
echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
php artisan serve --port=8000
