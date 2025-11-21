<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The required permission (can include |self for self-access)
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Unauthenticated',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        // Split permission by pipe for OR logic (e.g., "employee.view|self")
        $permissions = explode('|', $permission);
        
        // Check if "self" is in permissions
        $allowSelf = in_array('self', $permissions);
        
        // Remove "self" from permissions list for tokenCan check
        $actualPermissions = array_filter($permissions, fn($p) => $p !== 'self');
        
        // If "self" is allowed, check if user is accessing their own employee record
        if ($allowSelf) {
            // Get employee ID from route parameter or request input
            $employeeIdFromRoute = $request->route('id');
            $employeeIdFromRequest = $request->input('employee_id');
            
            // Get user's employee ID - the authenticated user IS the employee
            // $request->user() returns the EmployeeData model, so use its id
            $userEmployeeId = $request->user()->id ?? null;
            
            // If IDs match (from either route or request), allow access
            if ($userEmployeeId) {
                if (($employeeIdFromRoute && (int)$employeeIdFromRoute === (int)$userEmployeeId) ||
                    ($employeeIdFromRequest && (int)$employeeIdFromRequest === (int)$userEmployeeId)) {
                    return $next($request);
                }
            }
        }
        
        // Check if user has any of the required permissions
        foreach ($actualPermissions as $perm) {
            if ($request->user()->tokenCan($perm)) {
                return $next($request);
            }
        }

        return response()->json([
            'status_code' => 403,
            'message' => 'You do not have permission to perform this action',
            'data' => null,
            'is_success' => false,
            'required_permission' => implode(' or ', $actualPermissions),
        ], 403);
    }
}
