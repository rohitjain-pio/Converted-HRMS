export interface Permission {
  permissionId: number;
  permissionName: string;
  isActive: boolean;
}

export interface Module {
  moduleId: number;
  moduleName: string;
  isActive: boolean;
  permissions: Permission[];
}

export interface Result {
  roleId: number;
  roleName: string;
  modules: Module[];
}

export interface GetRolePermissionResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: Result;
}

export interface UpdatePermissionArgs {
  roleId: number;
  roleName?: string;
  isRoleNameUpdate: boolean;
  isRolePermissionUpdate: boolean;
  permissionList?: number[];
}

export interface UpdatePermissionResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetRolesArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: {
    roleName: string;
  }
}

export interface RoleType {
  roleId: number;
  roleName: string;
  userCount: number;
}

export interface ResultType {
  roleResponseList: RoleType[];
  totalRecords: number;
}

export interface GetRolesResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: ResultType;
}

export interface GetPermissionListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: Module[];
}
