# OAuth Refresh Token Implementation

## Overview
Implemented refresh token support for Azure AD OAuth login in the HRMS application.

## Changes Made

### 1. Backend (Laravel)

#### AuthService.php
- **Method**: `generateAuthResponse()`
  - Generates 100-character random refresh token using `Str::random(100)`
  - Sets 7-day expiry: `Carbon::now()->addDays(7)`
  - Stores refresh token and expiry in `employee_data` table
  - Returns refresh_token in auth response

- **Method**: `refreshToken()`
  - Validates refresh token from database
  - Checks if token has expired
  - Regenerates access token (Sanctum token) with same permissions
  - Returns new access token

#### AuthController.php
- **Endpoint**: `POST /api/auth/refresh-token`
  - Accepts: `{ "refresh_token": "..." }`
  - Returns: `{ "token": "new_access_token" }`
  - Returns 401 if refresh token invalid or expired

- **Endpoint**: `POST /api/auth` (SSO Login)
  - Returns both `token` and `refresh_token` in response
  - No changes needed - already working

### 2. Frontend (Vue 3 + TypeScript)

#### auth.ts (Pinia Store)
- **State**: `refreshToken` ref stored in localStorage
- **Method**: `setAuthData()`
  - Stores refresh_token in state and localStorage
  
- **Method**: `loginWithAzure()`
  - Calls SSO endpoint and stores returned refresh_token
  
- **Method**: `refreshAccessToken()`
  - Checks if refresh token exists
  - Calls backend refresh endpoint
  - Updates access token
  - Logs out user if refresh fails

#### api.ts (Axios Interceptor)
- **Fixed**: Endpoint detection logic for SSO login
  - Changed: `url?.includes('/auth/')` → `url?.endsWith('/auth')`
  - Now correctly skips token refresh for SSO login POST requests
  
- **Request Queue**: Prevents multiple simultaneous refresh requests
  - Queues failed requests while token refresh is in progress
  - Retries all queued requests with new token after refresh succeeds

#### auth.service.ts
- **Method**: `refreshToken()`
  - Already implemented - no changes needed

### 3. Database

#### employee_data table
- **Column**: `refresh_token` (varchar)
- **Column**: `refresh_token_expiry_date` (datetime)
- Both columns already existed in schema

#### Test Users Created
Created 4 test users with proper roles and permissions:
- `rohit.jain@programmers.io` - Time Doctor ID: Z6mVqEraVK74EnFo
- `anand.sharma@programmers.io` - Time Doctor ID: Z0lxl9OgJAGyFH6-
- `rohit.jain@programmers.ai` - Time Doctor ID: Z6mVqEraVK74EnFo
- `anand.sharma@programmers.ai` - Time Doctor ID: Z0lxl9OgJAGyFH6-

All users:
- Password: `password`
- Role: Employee (role_id = 3)
- Permissions: attendance.read, attendance.create, attendance.edit
- Department: Engineering
- Designation: Software Engineer
- Attendance Mode: Automatic (Time Doctor sync)

## Flow Diagram

### Initial Login (Azure OAuth)
```
1. User clicks "Sign in with Microsoft"
2. Azure AD authentication popup
3. Get Azure access token
4. POST /api/auth with access_token
5. Backend validates token with Microsoft Graph
6. Backend generates:
   - Sanctum access token (Bearer token)
   - Random 100-char refresh token
   - 7-day expiry timestamp
7. Backend stores refresh token in database
8. Backend returns:
   {
     "token": "...",
     "refresh_token": "...",
     "employee_id": 56,
     "permissions": [...],
     ...
   }
9. Frontend stores both tokens in:
   - Pinia store (memory)
   - localStorage (persistence)
```

### Token Refresh on 401
```
1. API call returns 401 Unauthorized
2. Axios interceptor catches error
3. Check if refresh already in progress
   - Yes: Queue this request
   - No: Start refresh process
4. Call POST /api/auth/refresh-token
   Body: { "refresh_token": "..." }
5. Backend validates refresh token:
   - Check token exists in database
   - Check not expired (< 7 days old)
6. Backend generates new Sanctum access token
7. Frontend stores new access token
8. Retry original failed request with new token
9. Process all queued requests with new token
```

### Logout or Refresh Failure
```
1. Refresh token invalid or expired
2. Backend returns 401
3. Frontend clears all auth data:
   - Pinia store
   - localStorage
4. Redirect to login page
```

## API Endpoints

### Login
```http
POST /api/auth
Content-Type: application/json

{
  "access_token": "azure_ad_access_token"
}

Response (200):
{
  "status_code": 200,
  "message": "Login successful",
  "is_success": true,
  "data": {
    "token": "sanctum_bearer_token",
    "refresh_token": "100_char_random_string",
    "employee_id": 56,
    "email": "rohit.jain@programmers.io",
    "name": "Rohit Jain",
    "role": 3,
    "permissions": ["attendance.read", "attendance.create", "attendance.edit"],
    "permissions_grouped": [...]
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "100_char_random_string"
}

Response (200):
{
  "status_code": 200,
  "message": "Token refreshed successfully",
  "is_success": true,
  "data": {
    "token": "new_sanctum_bearer_token"
  }
}

Response (401):
{
  "status_code": 401,
  "message": "Invalid or expired refresh token",
  "is_success": false,
  "data": null
}
```

## Security Considerations

1. **Refresh Token Storage**
   - Stored in database (hashed? Currently plaintext - consider hashing in production)
   - 7-day expiry enforced at database level
   - Cleared on logout

2. **Refresh Token Rotation**
   - Currently reuses same refresh token
   - Consider implementing rotation (new refresh token on each use) for better security

3. **Token Revocation**
   - Logout clears refresh_token from database
   - Old refresh tokens become invalid

4. **HTTPS Only**
   - All token transmission should use HTTPS in production
   - LocalStorage is domain-specific and not accessible cross-domain

## Testing

### Manual Testing
1. Login with `rohit.jain@programmers.io` (or .ai)
2. Check browser localStorage for `refresh_token`
3. Wait for access token to expire or manually delete from localStorage
4. Make an API call (navigate to My Attendance)
5. Verify token is refreshed automatically
6. Check Network tab for `/api/auth/refresh-token` call

### Test Script
```bash
# Backend test
php test-sso-response.php

# Verify test user can login
# Open browser: http://localhost:5173
# Click "Sign in with Microsoft"
# Use: rohit.jain@programmers.io
```

## Known Issues

1. **Employee role had 0 permissions initially**
   - Fixed by assigning attendance.read, attendance.create, attendance.edit
   
2. **API interceptor was catching SSO login endpoint**
   - Fixed by using `url?.endsWith('/auth')` instead of `url?.includes('/auth/')`

3. **Test users missing role_id in employment_details**
   - Fixed by adding role_id = 3 (Employee) to employment_details creation

## Future Enhancements

1. **Token Rotation**: Generate new refresh token on each use
2. **Refresh Token Hashing**: Hash refresh tokens in database
3. **Device Tracking**: Track which device each refresh token belongs to
4. **Concurrent Session Limit**: Limit number of active sessions per user
5. **Token Revocation API**: Admin endpoint to revoke user tokens
6. **Audit Log**: Log all token refresh events for security auditing
