export interface Permission {
  permission_value: string;
  is_active: boolean;
}

export interface ModulePermissions {
  module_name: string;
  permissions: string[];
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  requiredPermission: string;
}
