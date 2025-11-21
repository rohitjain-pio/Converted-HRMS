<?php

namespace App\Services\Auth;

use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use App\Models\Permission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthService
{
    /**
     * Validate Azure AD access token
     */
    public function validateAzureToken(string $accessToken): ?array
    {
        try {
            \Log::info('Attempting Azure token validation');
            
            $response = Http::withToken($accessToken)
                ->timeout(10)
                ->withoutVerifying() // Skip SSL verification for WAMP local dev
                ->get('https://graph.microsoft.com/v1.0/me');

            if ($response->successful()) {
                $userData = $response->json();
                \Log::info('Azure token validated successfully', [
                    'email' => $userData['mail'] ?? $userData['userPrincipalName'] ?? 'unknown'
                ]);
                return $userData;
            }

            \Log::warning('Azure token validation failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        } catch (\Exception $e) {
            \Log::error('Azure token validation exception: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Authenticate user with Azure AD
     */
    public function authenticateWithAzure(string $accessToken): ?array
    {
        $userProfile = $this->validateAzureToken($accessToken);

        if (!$userProfile) {
            \Log::warning('Azure token validation returned null');
            return null;
        }

        $email = $userProfile['mail'] ?? $userProfile['userPrincipalName'] ?? null;

        if (!$email) {
            \Log::warning('No email found in Azure profile', ['profile' => $userProfile]);
            return null;
        }

        // Normalize email to lowercase for case-insensitive comparison
        $email = strtolower($email);

        \Log::info('Looking up employee by email', ['email' => $email]);

        $employmentDetail = EmploymentDetail::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$employmentDetail) {
            \Log::warning('Employment detail not found for email', ['email' => $email]);
            return null;
        }

        $employee = EmployeeData::where('id', $employmentDetail->employee_id)
            ->where('is_deleted', false)
            ->first();

        if (!$employee) {
            \Log::warning('Employee not found', ['employee_id' => $employmentDetail->EmployeeId]);
            return null;
        }

        \Log::info('Azure authentication successful', ['employee_id' => $employee->id]);
        return $this->generateAuthResponse($employee, $employmentDetail);
    }

    /**
     * Authenticate user with email and password
     */
    public function authenticateWithCredentials(string $email, string $password): ?array
    {
        $employmentDetail = EmploymentDetail::where('email', $email)->first();

        if (!$employmentDetail) {
            return null;
        }

        $employee = EmployeeData::where('id', $employmentDetail->employee_id)
            ->where('is_deleted', false)
            ->first();

        if (!$employee) {
            return null;
        }

        // Verify password
        if (!$employee->password || !Hash::check($password, $employee->password)) {
            \Log::warning('Password verification failed', ['email' => $email]);
            return null;
        }

        return $this->generateAuthResponse($employee, $employmentDetail);
    }

    /**
     * Generate authentication response with token
     */
    protected function generateAuthResponse(EmployeeData $employee, EmploymentDetail $employmentDetail): array
    {
        // Get enhanced permissions (includes TeamLead permissions if user is a reporting manager)
        $permissions = $this->enhancePermissionsForReportingManager($employee->id, $employmentDetail->role_id);
        
        // Get grouped permissions for frontend display
        $permissionsGrouped = $this->getUserPermissionsGrouped($employmentDetail->role_id);

        // Generate Sanctum token with abilities
        $token = $employee->createToken('auth_token', $permissions)->plainTextToken;

        // Generate refresh token
        $refreshToken = Str::random(100);
        $refreshTokenExpiry = Carbon::now()->addDays(7);

        $employee->update([
            'refresh_token' => $refreshToken,
            'refresh_token_expiry_date' => $refreshTokenExpiry,
            'modified_by' => $employmentDetail->email ?? 'system',
        ]);

        return [
            'employee_id' => $employee->id,
            'email' => $employmentDetail->email,
            'name' => $employee->full_name,
            'role' => $employmentDetail->role_id,
            'permissions' => $permissions, // Flat array for token checking
            'permissions_grouped' => $permissionsGrouped, // Hierarchical for display
            'token' => $token,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Get user permissions based on role
     */
    protected function getUserPermissions(?int $roleId): array
    {
        if (!$roleId) {
            return [];
        }

        $permissions = \DB::table('role_permissions')
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->where('role_permissions.role_id', $roleId)
            ->pluck('permissions.value')
            ->toArray();

        return $permissions;
    }

    /**
     * Get user permissions grouped by modules (hierarchical structure)
     *
     * @param int $roleId
     * @return array
     */
    protected function getUserPermissionsGrouped(int $roleId): array
    {
        // Note: This assumes Module table exists - if not, return empty or just permissions array
        try {
            $permissions = \DB::table('role_permissions')
                ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
                ->where('role_permissions.role_id', $roleId)
                ->select(
                    'permissions.value as value',
                    'permissions.id as permission_id'
                )
                ->orderBy('permissions.value')
                ->get();

            // Since we don't have Module table confirmed, just return flat structure
            return $permissions->pluck('value')->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting grouped permissions: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Check if employee is a reporting manager and enhance permissions
     *
     * @param int $employeeId
     * @param int $roleId
     * @return array Enhanced permissions
     */
    protected function enhancePermissionsForReportingManager(int $employeeId, int $roleId): array
    {
        // Check if this employee is a reporting manager for anyone
        // Note: Column name has typo in database: 'reporting_manger_id' (missing 'a')
        $isReportingManager = \DB::table('employment_details')
            ->where('reporting_manger_id', $employeeId)
            ->exists();

        // If not a reporting manager, return normal permissions
        if (!$isReportingManager) {
            return $this->getUserPermissions($roleId);
        }

        // Get base permissions
        $basePermissions = $this->getUserPermissions($roleId);

        // Get TeamLead role permissions (assuming TeamLead role_id = 8)
        $teamLeadRoleId = 8;
        $teamLeadPermissions = $this->getUserPermissions($teamLeadRoleId);

        // Merge and deduplicate permissions
        $enhancedPermissions = array_unique(array_merge($basePermissions, $teamLeadPermissions));

        return $enhancedPermissions;
    }

    /**
     * Refresh access token
     */
    public function refreshToken(string $refreshToken): ?array
    {
        $employee = EmployeeData::where('refresh_token', $refreshToken)
            ->where('is_deleted', false)
            ->first();

        if (!$employee || Carbon::now()->gt($employee->refresh_token_expiry_date)) {
            return null;
        }

        $employmentDetail = $employee->employmentDetail;

        if (!$employmentDetail) {
            return null;
        }

        // Use enhanced permissions to include TeamLead permissions if user is a reporting manager
        $permissions = $this->enhancePermissionsForReportingManager($employee->id, $employmentDetail->role_id);
        $token = $employee->createToken('auth_token', $permissions)->plainTextToken;

        return ['token' => $token];
    }
}
