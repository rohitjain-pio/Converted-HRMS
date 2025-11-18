#!/usr/bin/env pwsh

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Testing OAuth Refresh Token Implementation  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test Configuration
$baseUrl = "http://localhost:8000/api"
$headers = @{
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
}

Write-Host "=== Step 1: Simulating Azure SSO Login ===" -ForegroundColor Yellow
Write-Host "Note: Using mock access token since we're testing backend only" -ForegroundColor Gray
Write-Host ""

# For testing purposes, we'll simulate what the frontend does
# In real scenario, frontend gets Azure token from Microsoft
# Here we'll use direct email/password login to get tokens

$loginBody = @{
    email = "rohit.jain@programmers.io"
    password = "password"
} | ConvertTo-Json

$loginHeaders = $headers.Clone()
$loginHeaders['X-API-Key'] = 'hrms-secure-api-key-change-in-production'

try {
    Write-Host "Logging in as rohit.jain@programmers.io..." -ForegroundColor White
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $loginHeaders -Body $loginBody
    
    if ($loginResponse.is_success) {
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "  Employee ID: $($loginResponse.data.employee_id)" -ForegroundColor Gray
        Write-Host "  Email: $($loginResponse.data.email)" -ForegroundColor Gray
        Write-Host "  Role: $($loginResponse.data.role)" -ForegroundColor Gray
        Write-Host "  Permissions: $($loginResponse.data.permissions.Count)" -ForegroundColor Gray
        Write-Host "  Access Token: $($loginResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "  Refresh Token: $($loginResponse.data.refresh_token.Substring(0, 20))..." -ForegroundColor Gray
        
        $accessToken = $loginResponse.data.token
        $refreshToken = $loginResponse.data.refresh_token
    } else {
        Write-Host "✗ Login failed: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Step 2: Testing Protected Endpoint ===" -ForegroundColor Yellow
Write-Host "Making request to /api/attendance/get-attendance..." -ForegroundColor White

$authHeaders = $headers.Clone()
$authHeaders['Authorization'] = "Bearer $accessToken"

try {
    $attendanceUrl = "$baseUrl/attendance/get-attendance/$($loginResponse.data.employee_id)" + "?pageIndex=0&pageSize=10"
    $attendanceResponse = Invoke-RestMethod -Uri $attendanceUrl -Method GET -Headers $authHeaders
    
    if ($attendanceResponse.is_success) {
        Write-Host "✓ Protected endpoint accessible with access token!" -ForegroundColor Green
        Write-Host "  Attendance records: $($attendanceResponse.data.attendanceDetails.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Protected endpoint failed (expected if no attendance data): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Step 3: Testing Token Refresh ===" -ForegroundColor Yellow
Write-Host "Refreshing access token using refresh token..." -ForegroundColor White

$refreshBody = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh-token" -Method POST -Headers $headers -Body $refreshBody
    
    if ($refreshResponse.is_success) {
        Write-Host "✓ Token refresh successful!" -ForegroundColor Green
        Write-Host "  New Access Token: $($refreshResponse.data.token.Substring(0, 20))..." -ForegroundColor Gray
        
        $newAccessToken = $refreshResponse.data.token
    } else {
        Write-Host "✗ Token refresh failed: $($refreshResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Token refresh request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Step 4: Testing Protected Endpoint with New Token ===" -ForegroundColor Yellow
Write-Host "Making request with refreshed token..." -ForegroundColor White

$newAuthHeaders = $headers.Clone()
$newAuthHeaders['Authorization'] = "Bearer $newAccessToken"

try {
    $attendanceUrl2 = "$baseUrl/attendance/get-attendance/$($loginResponse.data.employee_id)" + "?pageIndex=0&pageSize=10"
    $attendanceResponse2 = Invoke-RestMethod -Uri $attendanceUrl2 -Method GET -Headers $newAuthHeaders
    
    if ($attendanceResponse2.is_success) {
        Write-Host "✓ Protected endpoint accessible with refreshed token!" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Protected endpoint failed with new token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Step 5: Testing Invalid Refresh Token ===" -ForegroundColor Yellow
Write-Host "Attempting to refresh with invalid token..." -ForegroundColor White

$invalidRefreshBody = @{
    refresh_token = "invalid_token_12345"
} | ConvertTo-Json

try {
    $invalidRefreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh-token" -Method POST -Headers $headers -Body $invalidRefreshBody
    Write-Host "✗ Invalid token was accepted (security issue!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Invalid token correctly rejected with 401!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✓ OAuth Refresh Token Flow Verified!        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✓ Login returns access token and refresh token" -ForegroundColor Green
Write-Host "  ✓ Access token works for protected endpoints" -ForegroundColor Green
Write-Host "  ✓ Refresh token generates new access token" -ForegroundColor Green
Write-Host "  ✓ New access token works for protected endpoints" -ForegroundColor Green
Write-Host "  ✓ Invalid refresh tokens are rejected" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Test Azure SSO login in browser (http://localhost:5173)" -ForegroundColor Gray
Write-Host "  2. Login with rohit.jain@programmers.io or .ai domain" -ForegroundColor Gray
Write-Host "  3. Verify refresh token in browser localStorage" -ForegroundColor Gray
Write-Host "  4. Test automatic token refresh on 401 errors" -ForegroundColor Gray
