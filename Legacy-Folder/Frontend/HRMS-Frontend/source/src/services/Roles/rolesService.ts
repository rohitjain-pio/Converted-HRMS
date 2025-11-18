import { httpInstance } from "@/api/httpInstance";
import {
  GetRolePermissionResponse,
  UpdatePermissionArgs,
  UpdatePermissionResponse,
  GetRolesArgs,
  GetRolesResponse,
  GetPermissionListResponse,
} from "@/services/Roles/types";

const baseRoute = "/RolePermission";

export const getRoles = async (payload: GetRolesArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetRoles`,
    payload
  ) as Promise<GetRolesResponse>;
};

export const getRolePermissionById = async (roleId: string) => {
  return httpInstance.get(`${baseRoute}/GetModulePermissionsByRole`, {
    params: { roleId },
  }) as Promise<GetRolePermissionResponse>;
};

export const getRolePermission = async () => {
  return httpInstance.get(`${baseRoute}/GetPermissionList`) as Promise<GetPermissionListResponse>;
};

export const updatePermission = async (args: UpdatePermissionArgs) => {
  return httpInstance.post(
    `${baseRoute}/SaveRolePermissions`,
    args
  ) as Promise<UpdatePermissionResponse>;
};
