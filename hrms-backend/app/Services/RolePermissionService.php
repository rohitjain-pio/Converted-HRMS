<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Module;
use App\Models\Permission;
use App\Models\RolePermission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RolePermissionService
{
    /**
     * Get roles with user count, pagination, search, and sorting
     * 
     * @param string|null $roleName
     * @param string $sortColumn
     * @param string $sortDirection
     * @param int $startIndex
     * @param int $pageSize
     * @return array
     */
    public function getRoles(
        ?string $roleName,
        string $sortColumn = 'name',
        string $sortDirection = 'asc',
        int $startIndex = 0,
        int $pageSize = 10
    ): array {
        // Build query for roles with user count
        $query = Role::query()
            ->select([
                'roles.id as role_id',
                'roles.name as role_name',
                DB::raw('COUNT(DISTINCT user_role_mappings.employee_id) as user_count')
            ])
            ->leftJoin('user_role_mappings', 'roles.id', '=', 'user_role_mappings.role_id')
            ->where('roles.is_active', true)
            ->groupBy('roles.id', 'roles.name');

        // Apply search filter
        if ($roleName) {
            $query->where('roles.name', 'like', '%' . $roleName . '%');
        }

        // Get total count before pagination
        $totalRecords = $query->count(DB::raw('DISTINCT roles.id'));

        // Apply sorting
        $sortColumn = $sortColumn === 'name' ? 'roles.name' : $sortColumn;
        $query->orderBy($sortColumn, $sortDirection);

        // Apply pagination
        $roles = $query->skip($startIndex)->take($pageSize)->get();

        return [
            'total_records' => $totalRecords,
            'role_response_list' => $roles->toArray(),
        ];
    }

    /**
     * Get module permissions by role ID
     * 
     * @param int $roleId
     * @return array|null
     */
    public function getModulePermissionsByRole(int $roleId): ?array
    {
        $role = Role::find($roleId);
        
        if (!$role) {
            return null;
        }

        // Get all modules with their permissions
        $modules = Module::with('permissions')->get();
        
        // Get active permissions for this role
        $activePermissionIds = RolePermission::where('role_id', $roleId)
            ->pluck('permission_id')
            ->toArray();

        $modulesData = [];

        foreach ($modules as $module) {
            $permissions = [];
            $hasActivePermission = false;

            foreach ($module->permissions as $permission) {
                $isActive = in_array($permission->id, $activePermissionIds);
                if ($isActive) {
                    $hasActivePermission = true;
                }

                $permissions[] = [
                    'permission_id' => $permission->id,
                    'permission_name' => $permission->name,
                    'is_active' => $isActive,
                ];
            }

            $modulesData[] = [
                'module_id' => $module->id,
                'module_name' => $module->module_name,
                'is_active' => $hasActivePermission,
                'permissions' => $permissions,
            ];
        }

        return [
            'role_id' => $role->id,
            'role_name' => $role->name,
            'modules' => $modulesData,
        ];
    }

    /**
     * Save role permissions (create or update)
     * 
     * @param int $roleId
     * @param string $roleName
     * @param bool $isRoleNameUpdate
     * @param bool $isRolePermissionUpdate
     * @param array $permissionList
     * @return array
     */
    public function saveRolePermissions(
        int $roleId,
        string $roleName,
        bool $isRoleNameUpdate,
        bool $isRolePermissionUpdate,
        array $permissionList
    ): array {
        try {
            $userEmail = Auth::user()->email ?? 'system';

            // Create new role
            if ($roleId === 0) {
                DB::beginTransaction();
                
                $role = Role::create([
                    'name' => $roleName,
                    'is_active' => true,
                    'created_by' => $userEmail,
                    'created_on' => now(),
                ]);

                $roleId = $role->id;
                DB::commit();

                // Call stored procedure AFTER transaction completes
                if (!empty($permissionList)) {
                    $this->savePermissionsUsingProcedure($roleId, $permissionList);
                }

                // TODO: Send email notification for new role
                // $this->emailNotificationService->newRoleAdded($roleName, now());

                return [
                    'success' => true,
                    'message' => 'Role created successfully',
                ];
            }

            // Update existing role
            DB::beginTransaction();
            
            $role = Role::find($roleId);

            if (!$role) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Role not found',
                ];
            }

            // Update role name if requested
            if ($isRoleNameUpdate) {
                $role->update([
                    'name' => $roleName,
                    'modified_by' => $userEmail,
                    'modified_on' => now(),
                ]);
            }

            DB::commit();

            // Update permissions AFTER transaction completes
            if ($isRolePermissionUpdate && !empty($permissionList)) {
                $this->savePermissionsUsingProcedure($roleId, $permissionList);
            }

            return [
                'success' => true,
                'message' => 'Role updated successfully',
            ];

        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            return [
                'success' => false,
                'message' => 'Error saving role: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Save permissions using stored procedure
     * 
     * @param int $roleId
     * @param array $permissionList
     * @return void
     */
    protected function savePermissionsUsingProcedure(int $roleId, array $permissionList): void
    {
        // Convert permission array to comma-separated string for MySQL stored procedure
        $permissionIds = implode(',', $permissionList);
        
        // Call the stored procedure using unprepared statement
        // Note: We use unprepared because MySQL stored procedures have their own transaction handling
        DB::unprepared("CALL SaveRolePermissions($roleId, '$permissionIds')");
    }

    /**
     * Get all permissions grouped by modules
     * 
     * @return array
     */
    public function getPermissionList(): array
    {
        $modules = Module::with('permissions')->get();

        $moduleList = [];

        foreach ($modules as $module) {
            $permissions = [];

            foreach ($module->permissions as $permission) {
                $permissions[] = [
                    'permission_id' => $permission->id,
                    'permission_name' => $permission->name,
                    'is_active' => false, // Default to false for creation form
                ];
            }

            $moduleList[] = [
                'module_id' => $module->id,
                'module_name' => $module->module_name,
                'is_active' => $module->is_active,
                'permissions' => $permissions,
            ];
        }

        return $moduleList;
    }

    /**
     * Get simple list of all roles (for dropdowns)
     * 
     * @return array
     */
    public function getRolesList(): array
    {
        return Role::where('is_active', true)
            ->select('id', 'name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            })
            ->toArray();
    }
}
