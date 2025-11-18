import { create } from "zustand";

interface AppUpdateState {
  newVersionAvailable: string | null;
  showUpdateDialog: boolean;
  setNewVersion: (version: string) => void;
  clearUpdate: () => void;
}

export const useAppUpdateStore = create<AppUpdateState>()((set) => ({
  newVersionAvailable: null,
  showUpdateDialog: false,
  setNewVersion: (version) =>
    set({ newVersionAvailable: version, showUpdateDialog: true }),
  clearUpdate: () =>
    set({ newVersionAvailable: null, showUpdateDialog: false }),
}));
