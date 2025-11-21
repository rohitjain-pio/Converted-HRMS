<?php

namespace App\Http\Controllers;

use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RolePermissionController extends Controller
{
    protected RolePermissionService $rolePermissionService;

    public function __construct(RolePermissionService $rolePermissionService)
    {
        $this->rolePermissionService = $rolePermissionService;
    }

    /**
     * Get list of roles with pagination, search, and sorting
     * POST /api/role-permission/get-roles
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getRoles(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sort_column_name' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'start_index' => 'nullable|integer|min:0',
            'page_size' => 'nullable|integer|min:1|max:100',
            'filters.role_name' => 'nullable|string',
        ]);

        $result = $this->rolePermissionService->getRoles(
            $validated['filters']['role_name'] ?? null,
            $validated['sort_column_name'] ?? 'name',
            $validated['sort_direction'] ?? 'asc',
            $validated['start_index'] ?? 0,
            $validated['page_size'] ?? 10
        );

        return response()->json([
            'status_code' => 200,
            'message' => 'Success',
            'result' => $result,
            'is_success' => true,
        ]);
    }

    /**
     * Get module permissions by role ID
     * GET /api/role-permission/get-module-permissions-by-role?role_id={id}
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getModulePermissionsByRole(Request $request): JsonResponse
    {
        $request->validate([
            'role_id' => 'required|integer|min:1',
        ]);

        $roleId = $request->input('role_id');
        $result = $this->rolePermissionService->getModulePermissionsByRole($roleId);

        if (!$result) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Role not found',
                'result' => null,
                'is_success' => false,
            ], 404);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Success',
            'result' => $result,
            'is_success' => true,
        ]);
    }

    /**
     * Save role permissions (create new role or update existing)
     * POST /api/role-permission/save-role-permissions
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function saveRolePermissions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|integer|min:0',
            'role_name' => 'required|string|max:100',
            'is_role_name_update' => 'nullable|boolean',
            'is_role_permission_update' => 'nullable|boolean',
            'permission_list' => 'required|array',
            'permission_list.*' => 'integer|exists:permissions,id',
        ]);

        $result = $this->rolePermissionService->saveRolePermissions(
            $validated['role_id'],
            $validated['role_name'],
            $validated['is_role_name_update'] ?? false,
            $validated['is_role_permission_update'] ?? false,
            $validated['permission_list']
        );

        if ($result['success']) {
            return response()->json([
                'status_code' => 200,
                'message' => $result['message'],
                'result' => true,
                'is_success' => true,
            ]);
        }

        return response()->json([
            'status_code' => 400,
            'message' => $result['message'],
            'result' => false,
            'is_success' => false,
        ], 400);
    }

    /**
     * Get all permissions grouped by modules (for role creation form)
     * GET /api/role-permission/get-permission-list
     * 
     * @return JsonResponse
     */
    public function getPermissionList(): JsonResponse
    {
        $result = $this->rolePermissionService->getPermissionList();

        return response()->json([
            'status_code' => 200,
            'message' => 'Success',
            'result' => $result,
            'is_success' => true,
        ]);
    }

    /**
     * Get simple list of all roles (for dropdowns)
     * GET /api/role-permission/get-roles-list
     * 
     * @return JsonResponse
     */
    public function getRolesList(): JsonResponse
    {
        $result = $this->rolePermissionService->getRolesList();

        return response()->json([
            'status_code' => 200,
            'message' => 'Success',
            'result' => $result,
            'is_success' => true,
        ]);
    }
}
