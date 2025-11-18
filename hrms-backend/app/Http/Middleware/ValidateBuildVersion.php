<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateBuildVersion
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $clientVersion = $request->header('X-Build-Version');
        $minimumVersion = config('app.minimum_build_version');

        // Skip validation if not configured
        if (!$minimumVersion) {
            return $next($request);
        }

        // Check if client sent version header
        if (!$clientVersion) {
            return response()->json([
                'status_code' => 426,
                'message' => 'Build version header missing. Please update your application.',
                'data' => [
                    'current_version' => $clientVersion,
                    'minimum_version' => $minimumVersion,
                ],
                'is_success' => false,
            ], 426); // 426 Upgrade Required
        }

        // Compare versions
        if (version_compare($clientVersion, $minimumVersion, '<')) {
            return response()->json([
                'status_code' => 426,
                'message' => 'Your application version is outdated. Please update to continue.',
                'data' => [
                    'current_version' => $clientVersion,
                    'minimum_version' => $minimumVersion,
                    'update_required' => true,
                ],
                'is_success' => false,
            ], 426);
        }

        return $next($request);
    }
}
