import apiClient from './client';

// Types
export interface Permission {
  permission_id: number;
  permission_name: string;
  is_active: boolean;
}

export interface Module {
  module_id: number;
  module_name: string;
  is_active: boolean;
  permissions: Permission[];
}

export interface Role {
  role_id: number;
  role_name: string;
  user_count: number;
}

export interface GetRolesRequest {
  sort_column_name: string;
  sort_direction: string;
  start_index: number;
  page_size: number;
  filters: {
    role_name: string;
  };
}

export interface GetRolesResponse {
  status_code: number;
  message: string;
  result: {
    total_records: number;
    role_response_list: Role[];
  };
  is_success: boolean;
}

export interface GetModulePermissionsByRoleResponse {
  status_code: number;
  message: string;
  result: {
    role_id: number;
    role_name: string;
    modules: Module[];
  };
  is_success: boolean;
}

export interface GetPermissionListResponse {
  status_code: number;
  message: string;
  result: Module[];
  is_success: boolean;
}

export interface SaveRolePermissionsRequest {
  role_id: number;
  role_name: string;
  is_role_name_update: boolean;
  is_role_permission_update: boolean;
  permission_list: number[];
}

export interface SaveRolePermissionsResponse {
  status_code: number;
  message: string;
  result: boolean;
  is_success: boolean;
}

const roleService = {
  /**
   * Get paginated list of roles with search and sorting
   */
  async getRoles(params: GetRolesRequest): Promise<GetRolesResponse> {
    const response = await apiClient.post<GetRolesResponse>(
      '/role-permission/get-roles',
      params
    );
    return response.data;
  },

  /**
   * Get module permissions by role ID
   */
  async getModulePermissionsByRole(
    roleId: number
  ): Promise<GetModulePermissionsByRoleResponse> {
    const response = await apiClient.get<GetModulePermissionsByRoleResponse>(
      '/role-permission/get-module-permissions-by-role',
      {
        params: { role_id: roleId },
      }
    );
    return response.data;
  },

  /**
   * Get all permissions grouped by modules (for role creation)
   */
  async getPermissionList(): Promise<GetPermissionListResponse> {
    const response = await apiClient.get<GetPermissionListResponse>(
      '/role-permission/get-permission-list'
    );
    return response.data;
  },

  /**
   * Save role permissions (create or update)
   */
  async saveRolePermissions(
    data: SaveRolePermissionsRequest
  ): Promise<SaveRolePermissionsResponse> {
    const response = await apiClient.post<SaveRolePermissionsResponse>(
      '/role-permission/save-role-permissions',
      data
    );
    return response.data;
  },

  /**
   * Get simple list of roles (for dropdowns)
   */
  async getRolesList(): Promise<{ id: number; name: string }[]> {
    const response = await apiClient.get<{
      status_code: number;
      result: { id: number; name: string }[];
    }>('/role-permission/get-roles-list');
    return response.data.result;
  },
};

export default roleService;
