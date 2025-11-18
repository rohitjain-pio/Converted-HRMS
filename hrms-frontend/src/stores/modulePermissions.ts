import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ModulePermissions } from '@/types/permission.types';

export const useModulePermissionsStore = defineStore('modulePermissions', () => {
  const modules = ref<ModulePermissions[]>([]);

  /**
   * Set permissions grouped by modules
   */
  function setModulePermissions(permissionsGrouped: ModulePermissions[]) {
    modules.value = permissionsGrouped;
  }

  /**
   * Get all permissions as flat array
   */
  const flatPermissions = computed(() => {
    const flat: string[] = [];
    modules.value.forEach((module) => {
      module.permissions.forEach((perm) => {
        flat.push(perm);
      });
    });
    return flat;
  });

  /**
   * Get permissions for a specific module
   */
  function getModulePermissions(moduleName: string): string[] {
    const module = modules.value.find(
      (m) => m.module_name.toLowerCase() === moduleName.toLowerCase()
    );
    return module?.permissions || [];
  }

  /**
   * Check if user has a specific permission
   */
  function hasPermission(permissionValue: string): boolean {
    return flatPermissions.value.includes(permissionValue);
  }

  /**
   * Check if user has any of the specified permissions
   */
  function hasAnyPermission(permissionValues: string[]): boolean {
    return permissionValues.some((perm) => hasPermission(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  function hasAllPermissions(permissionValues: string[]): boolean {
    return permissionValues.every((perm) => hasPermission(perm));
  }

  /**
   * Get all module names
   */
  const moduleNames = computed(() => {
    return modules.value.map((m) => m.module_name);
  });

  /**
   * Clear all permissions
   */
  function clear() {
    modules.value = [];
  }

  return {
    modules,
    flatPermissions,
    moduleNames,
    setModulePermissions,
    getModulePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    clear,
  };
});
