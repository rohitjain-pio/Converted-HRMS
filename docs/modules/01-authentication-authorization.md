# Module 1: Authentication & Authorization

## Module Overview

**Purpose:**  
Provides secure access control to the HRMS system through multi-method authentication and granular permission-based authorization. Handles user identity verification via Azure AD SSO or standard credentials, generates JWT tokens for stateless session management, and enforces permission checks on all protected resources.

**Role in System:**  
Foundation module that protects all other features. Every user interaction passes through this module for identity verification and permission validation.

## Implemented Features

### Authentication Features

1. **SSO Login (Azure AD Integration)**
   - User redirects to Microsoft login page
   - Authenticates with organizational Microsoft credentials
   - Azure AD returns access token to application
   - Backend validates token with Microsoft Graph API
   - User profile fetched from Graph API (email, name)
   - System checks if user exists in EmployeeData by email
   - If user exists: Generates internal JWT token with permissions
   - If user not exists: Registration flow or access denial

2. **Standard Login (Email/Password)**
   - User enters email and password in login form
   - Backend receives credentials
   - For test users: Password decrypted using AES encryption and matched against configured credentials
   - For regular users: Password validated against database (hashing mechanism not fully visible in codebase)
   - On successful validation: User details and permissions fetched from database
   - JWT token and refresh token generated and returned

3. **JWT Token Generation**
   - Claims created: EmployeeId, Email, Role, All user permissions
   - Token signed with symmetric key (HMAC SHA256 algorithm)
   - Token expiry set to 24 hours from generation
   - Issuer and Audience validated from configuration
   - Token returned to client in response

4. **Refresh Token Mechanism**
   - Refresh token generated as random secure string
   - Expiry set to 7 days from generation
   - Stored in database with user mapping
   - Client stores both JWT and refresh token
   - When JWT expires: Client sends refresh token to /api/Auth/RefreshToken endpoint
   - Backend validates refresh token against database
   - If valid: New JWT generated and returned
   - If invalid: User must re-login

5. **Health Check Endpoint**
   - Public endpoint /api/Auth/CheckHealth
   - Returns API status and version
   - Used for monitoring and availability checks

### Authorization Features

6. **Permission-Based Authorization**
   - 160+ granular permissions across all modules
   - Permissions organized hierarchically: Module → SubModule → Permission
   - Each permission has unique value string (e.g., "Employee.View", "Leave.Approve")
   - Permissions assigned to roles, not individual users
   - User inherits all permissions from assigned role

7. **Role-Based Access Control (RBAC)**
   - 8 predefined roles: SuperAdmin (1), HR (2), Employee (3), Accounts (4), Manager (5), IT (6), Developer (7), TeamLead (8)
   - Each role has specific permission set
   - User assigned single role (UserRoleMapping table)
   - Role determines accessible features and data

8. **Custom Authorization Handler**
   - PermissionAuthorizationHandler evaluates permission requirements
   - Checks if user's permission claims contain required permission
   - Implements IAuthorizationHandler interface
   - Invoked automatically by ASP.NET Core authorization middleware

9. **Custom Authorization Policy Provider**
   - PermissionAuthorizationPolicyProvider dynamically creates policies
   - Policy name format: "Permission_{PermissionValue}"
   - Generates policy with PermissionRequirement on-the-fly
   - Avoids need to pre-register all 160+ policies

10. **Custom Authorization Middleware Result Handler**
    - CustomAuthorizationMiddlewareResultHandler handles authorization failures
    - Standardizes 403 Forbidden responses
    - Returns ApiResponseModel format for consistency
    - Prevents default ASP.NET Core authorization response

11. **HasPermission Attribute**
    - Custom attribute applied to controller actions
    - Specifies required permission for action
    - Syntax: `[HasPermission(Permissions.Employee.View)]`
    - Triggers authorization handler automatically

12. **Dynamic Menu Generation**
    - Frontend requests user permissions from token claims
    - Menu items mapped to required permissions in configuration
    - Only menu items with satisfied permissions displayed
    - Provides role-appropriate navigation experience

13. **API Key Authentication**
    - ApiKeyMiddleware validates X-API-Key header
    - Used for external service integration (machine-to-machine)
    - API key validated against configured value in appsettings
    - Bypasses JWT authentication for external service endpoints

## Data Models / Entities Used

### Primary Entities:
- **EmployeeData**: Core employee record with email, name, status
- **EmploymentDetail**: Job details including role assignment
- **Role**: Role definition with name and description
- **Module**: Top-level permission grouping (e.g., Employee, Leave, Attendance)
- **SubModule**: Second-level permission grouping under module
- **Permission**: Granular permission definition with value string
- **UserRoleMapping**: Maps employee to role (EmployeeId, RoleId)
- **RolePermission**: Maps role to permissions (RoleId, PermissionId) - implied from codebase

### DTOs:
- **SSOLoginRequestDto**: Contains Azure AD access token
- **LoginDto**: Contains email and password
- **LoginResponseDto**: Contains EmployeeId, Email, Name, Role, Permissions array, JWT token, Refresh token
- **RefreshTokenRequest**: Contains refresh token string
- **UserCredentials**: Test user credentials configuration (email, AES encrypted password)

## External Dependencies or Services

1. **Microsoft Graph API**
   - Base URL: https://graph.microsoft.com/v1.0/me
   - Purpose: Validate Azure AD access token and fetch user profile
   - Authentication: OAuth bearer token from Azure AD
   - Data retrieved: Email, Name, Display Name

2. **Azure Active Directory (Azure AD)**
   - Purpose: SSO authentication provider
   - Managed by @azure/msal-browser and @azure/msal-react in frontend
   - Backend receives token from frontend after Azure AD authentication
   - Backend validates token by calling Graph API

3. **AESPasswordEncryption Utility**
   - Purpose: Encrypt/decrypt test user passwords
   - Algorithm: AES (Advanced Encryption Standard)
   - Used for development/testing environment credentials
   - Passwords stored encrypted in appsettings.json

## APIs or Endpoints

### POST /api/Auth (SSO Login)
- **Purpose:** Authenticate user via Azure AD access token
- **Request:** SSOLoginRequestDto with access token
- **Process:**
  - Validate token with Microsoft Graph API
  - Fetch user email from Graph API
  - Lookup user in database by email
  - Generate JWT with user permissions
  - Generate refresh token
- **Response:** LoginResponseDto with JWT, refresh token, user details
- **Auth Required:** No
- **Permissions:** None

### POST /api/Auth/Login (Standard Login)
- **Purpose:** Authenticate user with email and password
- **Request:** LoginDto with email and password
- **Process:**
  - Validate credentials (AES decrypt for test users or database validation)
  - Fetch user details and role
  - Fetch user permissions from role mapping
  - Generate JWT with claims
  - Generate refresh token
- **Response:** LoginResponseDto with JWT, refresh token, user details
- **Auth Required:** No
- **Permissions:** None

### POST /api/Auth/RefreshToken
- **Purpose:** Generate new JWT using refresh token
- **Request:** RefreshTokenRequest with refresh token string
- **Process:**
  - Validate refresh token against database
  - Check refresh token expiry (7 days)
  - Fetch user details
  - Generate new JWT with current permissions
- **Response:** New JWT token
- **Auth Required:** No (refresh token validated instead)
- **Permissions:** None

### GET /api/Auth/CheckHealth
- **Purpose:** Check API availability and version
- **Request:** None
- **Process:** Return status and version from configuration
- **Response:** API status and version string
- **Auth Required:** No
- **Permissions:** None

## UI Components / Screens

### Login Page
- **Components:**
  - SSO Login button (Sign in with Microsoft)
  - Email input field
  - Password input field
  - Login button
  - Remember me checkbox (optional)
  - Forgot password link (implementation not visible)
- **Behavior:**
  - SSO button triggers Azure AD authentication flow
  - Standard login submits credentials to /api/Auth/Login
  - On success: JWT and refresh token stored in local storage or memory
  - Redirect to dashboard or intended page
  - On failure: Display error message

### Unauthorized Page
- **Components:**
  - Access denied message
  - Back to home button
- **Trigger:** User attempts to access feature without required permission
- **Behavior:** Display friendly message, log unauthorized attempt

## Workflow or Process Description

### SSO Login Flow:
1. User clicks "Sign in with Microsoft" button
2. Frontend redirects to Azure AD login page
3. User enters Microsoft credentials on Azure login page
4. Azure AD validates credentials and returns authorization code
5. Frontend MSAL library exchanges code for access token
6. Frontend sends access token to backend /api/Auth endpoint
7. Backend calls Microsoft Graph API with access token to validate and fetch user profile
8. Backend extracts email from Graph API response
9. Backend queries EmployeeData table by email to find user
10. If user found: Backend fetches EmploymentDetail to get RoleId
11. Backend fetches all permissions for user's role from RolePermission table
12. Backend generates JWT with claims (EmployeeId, Email, Role, Permissions)
13. Backend generates refresh token and stores in database
14. Backend returns LoginResponseDto with JWT and refresh token
15. Frontend stores tokens and redirects to dashboard

### Standard Login Flow:
1. User enters email and password in login form
2. Frontend validates inputs client-side (required fields, email format)
3. Frontend submits credentials to /api/Auth/Login endpoint
4. Backend receives LoginDto
5. Backend checks if email exists in configured test users
6. If test user: Backend decrypts configured password using AES and compares with input
7. If regular user: Backend queries database and validates password (mechanism unclear)
8. If credentials valid: Backend fetches user details and role
9. Backend fetches all permissions for user's role
10. Backend generates JWT with claims
11. Backend generates refresh token and stores in database
12. Backend returns LoginResponseDto
13. Frontend stores tokens and redirects to dashboard
14. If credentials invalid: Backend returns 401 Unauthorized with error message

### Permission Check Flow:
1. User attempts to access protected feature (e.g., view employee list)
2. Frontend checks if user has required permission in local permission cache
3. If permission missing: Frontend hides feature or shows access denied
4. If permission present: Frontend makes API request with JWT in Authorization header
5. Backend receives request and extracts JWT from header
6. JWT middleware validates token (signature, expiry, issuer, audience)
7. JWT middleware extracts claims and populates HttpContext.User
8. Request reaches controller action decorated with [HasPermission] attribute
9. Authorization middleware invokes PermissionAuthorizationHandler
10. Handler checks if user's permission claims contain required permission
11. If permission found: Handler returns success, action executes
12. If permission missing: Handler returns failure, CustomAuthorizationMiddlewareResultHandler invoked
13. Handler returns 403 Forbidden with standardized error message
14. Frontend displays access denied message to user

### Token Refresh Flow:
1. User performs action with expired JWT (24 hours passed)
2. Backend returns 401 Unauthorized
3. Frontend Axios interceptor catches 401 response
4. Frontend sends refresh token to /api/Auth/RefreshToken endpoint
5. Backend validates refresh token against database
6. Backend checks refresh token expiry (7 days)
7. If valid: Backend generates new JWT with current user permissions
8. Backend returns new JWT
9. Frontend stores new JWT and retries original failed request
10. If refresh token expired: Frontend clears tokens and redirects to login

## Error Handling / Edge Cases

### Invalid Credentials:
- Standard login with incorrect password returns 401 Unauthorized
- Error message: "Invalid email or password"
- Frontend displays error message, allows retry

### Expired JWT Token:
- API request with expired token returns 401 Unauthorized
- Frontend automatically attempts token refresh
- If refresh succeeds: Original request retried
- If refresh fails: User redirected to login

### Invalid Refresh Token:
- Refresh token request with invalid/expired token returns 401 Unauthorized
- Frontend clears stored tokens and redirects to login
- User must re-authenticate

### User Not Found (SSO):
- Azure AD authentication succeeds but user email not in database
- Backend returns error: "User not registered in system"
- Frontend displays message: "Please contact HR to activate your account"

### Insufficient Permissions:
- API request with valid token but missing permission returns 403 Forbidden
- Error message: "You do not have permission to perform this action"
- Frontend displays access denied message
- Action logged for audit (if logging enabled)

### Multiple Login Sessions:
- System allows multiple concurrent sessions per user
- Each session has independent JWT and refresh token
- Logout from one session does not affect other sessions
- Refresh token invalidation affects only that specific token

### API Key Missing/Invalid:
- External service request without X-API-Key header returns 401 Unauthorized
- Request with incorrect API key returns 401 Unauthorized
- Error message: "Invalid or missing API key"

### Graph API Failure:
- SSO login fails if Graph API unavailable or returns error
- Error message: "Unable to validate Microsoft account. Please try again."
- User can retry or use standard login

### Token Claim Tampering:
- Modified JWT fails signature validation
- Request rejected with 401 Unauthorized
- Potential security event logged

## Integration Points with Other Modules

### Integration with All Modules:
- All protected features depend on Authentication for identity verification
- All feature-specific APIs depend on Authorization for permission validation
- User context (EmployeeId, Email) from JWT claims used throughout application

### Integration with Employee Management:
- EmployeeData table stores user email for authentication lookup
- EmploymentDetail table stores RoleId for permission resolution

### Integration with Role & Permission Management:
- Role definitions control user access levels
- Permission assignments determine feature visibility
- Changes to role permissions immediately affect user access (after token refresh)

### Integration with Dashboard:
- Personalized dashboard displays features based on user permissions
- User name and profile picture retrieved using authenticated user's EmployeeId

### Integration with Notification System:
- Welcome email sent on new employee creation with login instructions
- Password reset emails (if implemented) use user email from EmployeeData

## Dependencies / Reused Components

### Backend Dependencies:
- **Microsoft.IdentityModel.Tokens**: JWT token generation and validation
- **System.IdentityModel.Tokens.Jwt**: JWT token handler
- **System.Security.Claims**: Claims-based identity
- **Microsoft.AspNetCore.Authorization**: Authorization framework
- **GraphApiClient**: Custom client for Microsoft Graph API calls

### Frontend Dependencies:
- **@azure/msal-browser**: Azure AD authentication browser library
- **@azure/msal-react**: React wrapper for MSAL
- **Axios**: HTTP client with JWT token attachment
- **Zustand**: Global state management for user auth state
- **React Router**: Protected route implementation

### Shared Utilities:
- **AESPasswordEncryption**: Encrypt/decrypt test user passwords
- **TokenService**: Base class for services needing user context from JWT
- **AppSettings**: Configuration binding for JWT settings, API keys, test credentials

### Configuration Sections:
- **JwtConfig**: Key, Issuer, Audience, ValidHours, RefreshTokenExpiryDays
- **ApiKeys**: AuthorizedKey for external service authentication
- **Authentication:UserCredentials**: Test user email and encrypted password array
- **HttpClientsUrl:GraphApiUrl**: Microsoft Graph API base URL

## Testing Artifacts

Testing artifacts not explicitly found in codebase. Recommended tests:

### Unit Tests:
- JWT token generation with various claim combinations
- JWT token validation with valid, expired, and tampered tokens
- Permission check logic with matching and non-matching permissions
- AES password encryption and decryption
- Refresh token validation and expiry checks

### Integration Tests:
- SSO login flow end-to-end with mock Graph API
- Standard login with valid and invalid credentials
- Token refresh flow with valid and expired refresh tokens
- Permission-protected endpoint access with various permission combinations
- API key authentication for external services

### Security Tests:
- SQL injection attempts in login fields
- XSS attempts in login fields
- Brute force protection (not visible in codebase, may need implementation)
- Token tampering detection
- HTTPS enforcement validation

---

**Module Dependencies:**
- **Depends On:** None (foundation module)
- **Used By:** All other modules

**Key Security Considerations:**
- JWT tokens contain sensitive user data (permissions) - transmitted over HTTPS only
- Refresh tokens stored in database - should be hashed (implementation unclear)
- AES encrypted test passwords in configuration - configuration file should be secured
- API keys in configuration - should use environment variables or secrets manager in production
- No apparent rate limiting on login endpoint - potential security risk
- No apparent account lockout after multiple failed attempts - potential security risk
