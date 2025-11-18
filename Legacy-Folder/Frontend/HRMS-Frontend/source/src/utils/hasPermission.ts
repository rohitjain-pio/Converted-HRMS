import useModulePermissionsStore from "@/store/useModulePermissionsStore";

export const hasPermission = (permissionValue: string): boolean => {
  const modules = useModulePermissionsStore.getState().modules;

  if (!modules.length) {
    return false;
  }
  
  return modules.some((module) =>
    module.permissions.some(
      (permission) =>
        permission.permissionValue === permissionValue && permission.isActive
    )
  );
};
