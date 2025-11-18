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
     * @param  string  $permission  The required permission
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

        // Check if user token has the required permission (ability)
        if (!$request->user()->tokenCan($permission)) {
            return response()->json([
                'status_code' => 403,
                'message' => 'You do not have permission to perform this action',
                'data' => null,
                'is_success' => false,
                'required_permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}
