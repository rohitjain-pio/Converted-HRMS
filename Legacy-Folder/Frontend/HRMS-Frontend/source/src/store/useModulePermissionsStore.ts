import { create } from "zustand";
import { persist } from "zustand/middleware";

type Permission = {
  permissionId: number;
  permissionName: string;
  isActive: boolean;
  permissionValue: string;
};

type Module = {
  moduleId: number;
  moduleName: string;
  isActive: boolean;
  permissions: Permission[];
};

type ModulePermissionsState = {
  modules: Module[];
  setModulePermissions: (permissions: Module[]) => void;
  updateModulePermissions: (permissionIds: number[]) => void;
};

const useModulePermissionsStore = create<ModulePermissionsState>()(
  persist(
    (set) => ({
      modules: [],
      setModulePermissions: (permissions) =>
        set(() => ({ modules: permissions })),
      updateModulePermissions: (permissionIds) =>
        set((state) => ({
            modules: state.modules.map((module) => ({
            ...module,
            permissions: module.permissions.map((permission) => ({
              ...permission,
              isActive: permissionIds.includes(permission.permissionId),
            })),
          })),
        })),
    }),
    { name: "module-permissions" }
  )
);

export default useModulePermissionsStore;
