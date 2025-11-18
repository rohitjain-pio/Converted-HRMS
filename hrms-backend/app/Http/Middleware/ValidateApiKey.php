<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key');
        $configuredApiKey = config('app.api_key');

        // Check if API key is provided
        if (!$apiKey) {
            return response()->json([
                'status_code' => 401,
                'message' => 'API key is missing',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        // Validate API key
        if ($apiKey !== $configuredApiKey) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid API key',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return $next($request);
    }
}
