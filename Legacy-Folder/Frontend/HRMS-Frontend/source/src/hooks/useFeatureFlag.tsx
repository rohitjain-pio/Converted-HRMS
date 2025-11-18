import { useFeatureFlagStore } from "@/store/featureFlagStore";

export const useFeatureFlag = (flagKey: string) => {
  return useFeatureFlagStore((state) => state.flags[flagKey] ?? false);
};
