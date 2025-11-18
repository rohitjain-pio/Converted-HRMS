<?php

namespace App\Services;

use App\Models\Menu;
use Illuminate\Support\Collection;

class MenuService
{
    /**
     * Get menu structure for a user based on their permissions
     *
     * @param array $userPermissions Array of permission strings (e.g., ['Read.Employees', 'Create.Employees'])
     * @return array Hierarchical menu structure
     */
    public function getMenuByPermissions(array $userPermissions): array
    {
        // Get all main menus with their children
        $mainMenus = Menu::mainMenus()
            ->with(['children.permissions', 'permissions'])
            ->get();

        $menuStructure = [];

        foreach ($mainMenus as $mainMenu) {
            $mainMenuItem = $this->buildMenuItem($mainMenu, $userPermissions);
            
            // Only include menu if user has permission or has accessible sub-menus
            if ($mainMenuItem['has_access'] || !empty($mainMenuItem['sub_menus'])) {
                $menuStructure[] = $mainMenuItem;
            }
        }

        return $menuStructure;
    }

    /**
     * Build a single menu item with permission checking
     *
     * @param Menu $menu
     * @param array $userPermissions
     * @return array
     */
    protected function buildMenuItem(Menu $menu, array $userPermissions): array
    {
        $menuItem = [
            'id' => $menu->id,
            'name' => $menu->menu_name,
            'path' => $menu->menu_path,
            'icon' => $menu->icon,
            'has_access' => $this->hasMenuAccess($menu, $userPermissions),
            'sub_menus' => [],
        ];

        // Process sub-menus
        foreach ($menu->children as $child) {
            $subMenuItem = $this->buildMenuItem($child, $userPermissions);
            
            // Only include sub-menu if user has permission
            if ($subMenuItem['has_access']) {
                $menuItem['sub_menus'][] = $subMenuItem;
            }
        }

        return $menuItem;
    }

    /**
     * Check if user has access to a menu based on permissions
     *
     * @param Menu $menu
     * @param array $userPermissions
     * @return bool
     */
    protected function hasMenuAccess(Menu $menu, array $userPermissions): bool
    {
        // If menu has no required permissions, it's accessible to all authenticated users
        $requiredPermissions = $menu->permissions;
        
        if ($requiredPermissions->isEmpty()) {
            return true;
        }

        // Check if user has any of the required permissions
        foreach ($requiredPermissions as $permission) {
            if (in_array($permission->value, $userPermissions)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get menu by role ID
     *
     * @param int $roleId
     * @return array
     */
    public function getMenuByRole(int $roleId): array
    {
        // Get all permissions for this role
        $permissions = \DB::table('role_permissions')
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->where('role_permissions.role_id', $roleId)
            ->pluck('permissions.value')
            ->toArray();

        return $this->getMenuByPermissions($permissions);
    }
}
