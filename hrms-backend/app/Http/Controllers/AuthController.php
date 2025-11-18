<?php

namespace App\Http\Controllers;

use App\Services\Auth\AuthService;
use App\Services\MenuService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    protected AuthService $authService;
    protected MenuService $menuService;

    public function __construct(AuthService $authService, MenuService $menuService)
    {
        $this->authService = $authService;
        $this->menuService = $menuService;
    }

    /**
     * SSO Login with Azure AD
     */
    public function ssoLogin(Request $request): JsonResponse
    {
        $request->validate([
            'access_token' => 'required|string',
        ]);

        $authData = $this->authService->authenticateWithAzure($request->input('access_token'));

        if (!$authData) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid Azure AD token or user not found',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Login successful',
            'data' => $authData,
            'is_success' => true,
        ]);
    }

    /**
     * Standard email/password login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $authData = $this->authService->authenticateWithCredentials(
            $request->input('email'),
            $request->input('password')
        );

        if (!$authData) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid email or password',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Login successful',
            'data' => $authData,
            'is_success' => true,
        ]);
    }

    /**
     * Refresh access token
     */
    public function refreshToken(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $tokenData = $this->authService->refreshToken($request->input('refresh_token'));

        if (!$tokenData) {
            return response()->json([
                'status_code' => 401,
                'message' => 'Invalid or expired refresh token',
                'data' => null,
                'is_success' => false,
            ], 401);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Token refreshed successfully',
            'data' => $tokenData,
            'is_success' => true,
        ]);
    }

    /**
     * API Health Check
     */
    public function checkHealth(): JsonResponse
    {
        return response()->json([
            'status_code' => 200,
            'message' => 'API is healthy',
            'data' => [
                'version' => '1.0.0',
                'timestamp' => now()->toDateTimeString(),
            ],
            'is_success' => true,
        ]);
    }

    /**
     * Get menu structure for authenticated user
     */
    public function getMenu(Request $request): JsonResponse
    {
        $user = $request->user();

        // The user here is EmployeeData model with tokenCan abilities
        // Get employmentDetail to get the role_id
        $employmentDetail = $user->employmentDetail;
        
        if (!$employmentDetail) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Employment details not found',
                'data' => null,
                'is_success' => false,
            ], 404);
        }

        // Get menu structure based on role
        $menuStructure = $this->menuService->getMenuByRole($employmentDetail->role_id);

        return response()->json([
            'status_code' => 200,
            'message' => 'Menu retrieved successfully',
            'data' => $menuStructure,
            'is_success' => true,
        ]);
    }
}
