import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FEATURE_FLAG_STORAGE_KEY } from "@/utils/constants";
import { FeatureFlagsConfig } from "@/contexts/FeatureFlagProvider";

export type FeatureFlagMap = {
  [flagKey: string]: boolean;
};

type FeatureFlagState = {
  flags: FeatureFlagMap;
  version: string;
};

type FeatureFlagActions = {
  setFlag: (key: string, value: boolean) => void;
  mergeRemoteFlags: (remote: FeatureFlagsConfig) => void;
};

type FeatureFlagStore = FeatureFlagState & FeatureFlagActions;

const initialState: FeatureFlagState = {
  flags: {},
  version: "",
};

export const useFeatureFlagStore = create<FeatureFlagStore>()(
  persist(
    (set) => ({
      ...initialState,
      setFlag: (key, value) => {
        set((state) => {
          const next = { ...state.flags, [key]: value };
          return { flags: next };
        });
      },
      mergeRemoteFlags: (remote) => {
        set((state) => {
          if (!state.version || state.version !== remote.version) {
            return { flags: remote.flags, version: remote.version };
          }

          return state;
        });
      },
    }),
    {
      name: FEATURE_FLAG_STORAGE_KEY,
    }
  )
);
