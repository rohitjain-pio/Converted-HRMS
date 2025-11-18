import { useFeatureFlagStore } from "@/store/featureFlagStore";

const getStore = () => useFeatureFlagStore.getState();

export function getFeatureFlag(key: string, defaultValue = false) {
  const flags = getStore().flags;

  return typeof flags[key] !== "boolean" ? defaultValue : flags[key];
}
